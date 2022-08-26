import {
  AppSpec,
  DeclaredSchemaValueSpec,
  DynamicSchemaValueSpec,
  HintSpec,
  Hint,
  Schema,
  Struct,
  SchemaSpec,
  AppSources,
} from "./appspec";

import algosdk, { ABIMethod } from "algosdk";
import ts, { factory } from "typescript";
import { writeFileSync } from "fs";

// AMAZING resource:
// https://ts-ast-viewer.com/#

const CLIENT_NAME = "ApplicationClient";
const CLIENT_IMPORTS = `{${CLIENT_NAME}, ABIResult}` 
const CLIENT_PATH = "../../application_client/";

const APP_SPEC_IMPORTS = "{Schema,AVMType}";
const APP_SPEC_PATH = "../../generate/";

const ALGOSDK_IMPORTS = "algosdk";
const ALGOSDK_PATH = "algosdk";

const NUMBER_TYPES: string[] = [
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "uint128",
  "uint256",
  "asset",
  "app",
];

const STRING_TYPES: string[] = ["account", "address", "string"];

const TXN_TYPES: string[] = [
  "txn",
  "pay",
  "axfer",
  "acfg",
  "appl",
  "keyreg",
  "frz",
];

export default function generateApplicationClient(appSpec: AppSpec, path: string) {
  const name = appSpec.contract.name;

  const nodes: ts.Node[] = generateImports();

  const structNodes = generateStructTypes(appSpec);
  nodes.push(...structNodes)

  const classNode = generateClass(appSpec);
  nodes.push(classNode);

  const outputFile = ts
    .createPrinter()
    .printList(
      ts.ListFormat.MultiLine,
      factory.createNodeArray(nodes),
      ts.createSourceFile(
        name,
        "",
        ts.ScriptTarget.ESNext,
        true,
        ts.ScriptKind.TS
      )
    );

  const file_name = `${name.toLowerCase()}_client.ts`;
  writeFileSync(path + file_name, outputFile);
}

// create the imports for the generated client
function generateImports(): ts.ImportDeclaration[] {
  return [
    // Import algosdk
    factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        factory.createIdentifier(ALGOSDK_IMPORTS),
        undefined
      ),
      factory.createStringLiteral(ALGOSDK_PATH),
      undefined
    ),

    // Import generic client
    factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        factory.createIdentifier(CLIENT_IMPORTS),
        undefined
      ),
      factory.createStringLiteral(CLIENT_PATH),
      undefined
    ),

    // Import app spec stuff
    factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        factory.createIdentifier(APP_SPEC_IMPORTS),
        undefined
      ),
      factory.createStringLiteral(APP_SPEC_PATH),
      undefined
    ),
  ];
}

function generateClass(appSpec: AppSpec): ts.ClassDeclaration {
  return factory.createClassDeclaration(
    undefined,
    [
      factory.createModifier(ts.SyntaxKind.ExportKeyword),
    ],
    factory.createIdentifier(appSpec.contract.name),
    undefined,
    [
      factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        factory.createExpressionWithTypeArguments(
          factory.createIdentifier(CLIENT_NAME),
          undefined
        ),
      ]),
    ],
    [
      ...generateContractProperties(appSpec),
      ...appSpec.contract.methods.map((meth) => generateMethodImpl(meth, appSpec)),
    ]
  );
}

function tsTypeFromAbiType(argType: string): ts.TypeNode {
  if (NUMBER_TYPES.includes(argType))
    return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);

  if (STRING_TYPES.includes(argType))
    return factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);

  if (TXN_TYPES.includes(argType)) {
    const acceptableTxns: ts.TypeNode[] = [
      factory.createTypeReferenceNode("algosdk.TransactionWithSigner"),
      factory.createTypeReferenceNode("algosdk.Transaction"),
    ];
    return factory.createUnionTypeNode(acceptableTxns);
  }

  return factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
}

function generateMethodImpl(method: ABIMethod, spec: AppSpec): ts.ClassElement {
  const params: ts.ParameterDeclaration[] = [];

  const callArgs: ts.Expression[] = [];

  const abiMethodArgs: ts.PropertyAssignment[] = [];

  let hint = {} as Hint
  if(method.name in spec.hints)
    hint = spec.hints[method.name]

  callArgs.push(
    factory.createCallExpression(
      factory.createIdentifier("algosdk.getMethodByName"),
      undefined,
      [
        factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier("methods")
        ),
        factory.createStringLiteral(method.name),
      ]
    )
  );

  for (const arg of method.args) {
    let argType
    if(arg.name in hint.structs) {
        // Its got a struct def, so we should specify the struct type in args and
        // get the values when we call `call`
        argType = factory.createTypeReferenceNode(hint.structs[arg.name].name)
        abiMethodArgs.push(
          factory.createPropertyAssignment(
            factory.createIdentifier(arg.name),
            factory.createIdentifier(arg.name),
          ) 
        );
    }else{
      argType = tsTypeFromAbiType(arg.type.toString())
      abiMethodArgs.push(
        factory.createPropertyAssignment(
          factory.createIdentifier(arg.name),
          factory.createIdentifier(arg.name)
        )
      );
    }

    const typeParams = factory.createParameterDeclaration(
      undefined,
      undefined,
      undefined,
      arg.name,
      undefined,
      argType,
      undefined
    );

    params.push(typeParams);
  }

  // Set up return type
  let abiRetType: ts.TypeNode = factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
  if(method.returns.type.toString() !== "void"){
    abiRetType = tsTypeFromAbiType(method.returns.type.toString())
    // Always `output` here because pyteal, 
    // when others app specs come in we should consider them
    if('output' in hint.structs){
      abiRetType = factory.createTypeReferenceNode(hint.structs['output'].name)
    }
  }

  const body = factory.createBlock(
    [
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier("result"),
              undefined,
              undefined,
              factory.createAwaitExpression(
                factory.createCallExpression(
                  factory.createPropertyAccessExpression(
                    factory.createThis(),
                    factory.createIdentifier("call")
                  ),
                  undefined,
                  [...callArgs, factory.createObjectLiteralExpression(abiMethodArgs)]
                )
              )
            )
          ],
          ts.NodeFlags.Const
        )
      ),
      factory.createReturnStatement(
        factory.createNewExpression(
          factory.createIdentifier("ABIResult"),
          [abiRetType],
          [factory.createIdentifier("result")]
        )
      )
    ],
    true
  );

  

  let retType = factory.createTypeReferenceNode(
    factory.createIdentifier("Promise"),
    [factory.createTypeReferenceNode( factory.createIdentifier("ABIResult") , [abiRetType])]
  )

  const methodSpec = factory.createMethodDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
    undefined,
    method.name,
    undefined,
    undefined,
    params,
    retType,
    body
  );

  return methodSpec;
}

function copySchemaObject(so: Schema): ts.Expression {
  const declaredAppSchemaProps = Object.entries(so.declared).map(
    (sv: [string, DeclaredSchemaValueSpec]): ts.PropertyAssignment => {
      return factory.createPropertyAssignment(
        factory.createIdentifier(sv[0]),
        factory.createObjectLiteralExpression([
          factory.createPropertyAssignment(
            factory.createIdentifier("type"),
            factory.createIdentifier(`AVMType.${sv[1].type}`)
          ),
          factory.createPropertyAssignment(
            factory.createIdentifier("key"),
            factory.createStringLiteral(sv[1].key ? sv[1].key : "")
          ),
          factory.createPropertyAssignment(
            factory.createIdentifier("desc"),
            factory.createStringLiteral(sv[1].desc ? sv[1].desc : "")
          ),
          factory.createPropertyAssignment(
            factory.createIdentifier("static"),
            sv[1].static ? factory.createTrue() : factory.createFalse()
          ),
        ])
      );
    }
  );

  const dynamicAppSchemaProps = Object.entries(so.dynamic).map(
    (sv: [string, DynamicSchemaValueSpec]): ts.PropertyAssignment => {
      return factory.createPropertyAssignment(
        factory.createIdentifier(sv[0]),
        factory.createObjectLiteralExpression([
          factory.createPropertyAssignment(
            factory.createIdentifier("type"),
            factory.createIdentifier(`AVMType.${sv[1].type.toString()}`)
          ),
          factory.createPropertyAssignment(
            factory.createIdentifier("desc"),
            factory.createStringLiteral(sv[1].desc ? sv[1].desc : "")
          ),
          factory.createPropertyAssignment(
            factory.createIdentifier("max_keys"),
            factory.createNumericLiteral(sv[1].max_keys?sv[1].max_keys:0)
          ),
        ])
      );
    }
  );

  return factory.createObjectLiteralExpression([
    factory.createPropertyAssignment(
      factory.createIdentifier("declared"),
      factory.createObjectLiteralExpression(declaredAppSchemaProps)
    ),
    factory.createPropertyAssignment(
      factory.createIdentifier("dynamic"),
      factory.createObjectLiteralExpression(dynamicAppSchemaProps)
    ),
  ]);
}

function generateStructTypes(spec: AppSpec): ts.Node[] {
  const hints = spec.hints

  const structs = {}
  for(const k of Object.keys(hints)){
    const hint = hints[k]
    if(hint.structs !== undefined){
      for(const sk of Object.keys(hint.structs)){
        const struct = hint.structs[sk]
        if(!(struct.name in struct)){
          structs[struct.name] = generateStruct(struct)
        }
      }
    }
  }

  return Object.values(structs)
}

function generateStruct(s: Struct): ts.TypeAliasDeclaration {
  const members: ts.TypeElement[] = []

  for(const elem of s.elements){
    members.push(
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier(elem[0]),
        undefined,
        tsTypeFromAbiType(elem[1])
      )
    )
  }

  return factory.createTypeAliasDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(s.name),
    undefined,
    factory.createTypeLiteralNode(members)
  )

}

function generateContractProperties(spec: AppSpec): ts.PropertyDeclaration[] {
  const descr = spec.contract.description;
  const methods = spec.contract.methods;
  const source = spec.source;
  const schema = spec.schema;

  // create desc property
  const descrProp = factory.createPropertyDeclaration(
    undefined,
    undefined,
    factory.createIdentifier("desc"),
    undefined,
    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    factory.createStringLiteral(descr ? descr : "")
  );

  // Create approval program property
  const approvalProp = factory.createPropertyDeclaration(
    undefined,
    undefined,
    factory.createIdentifier("approvalProgram"),
    undefined,
    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    factory.createStringLiteral(source.approval)
  );

  // Create clear program property
  const clearProp = factory.createPropertyDeclaration(
    undefined,
    undefined,
    factory.createIdentifier("clearProgram"),
    undefined,
    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    factory.createStringLiteral(source.clear)
  );

  // Create App Schema Property
  const appSchemaProp = factory.createPropertyDeclaration(
    undefined,
    undefined,
    factory.createIdentifier("appSchema"),
    undefined,
    factory.createTypeReferenceNode("Schema"),
    copySchemaObject(schema.global)
  );

  // Create Acct schema property
  const acctSchemaProp = factory.createPropertyDeclaration(
    undefined,
    undefined,
    factory.createIdentifier("acctSchema"),
    undefined,
    factory.createTypeReferenceNode("Schema"),
    copySchemaObject(schema.local)
  );

  // Add methods
  const methodAssignments: ts.Expression[] = [];
  for (const meth of methods) {
    const argObjs: ts.ObjectLiteralExpression[] = meth.args.map((arg) => {
      return factory.createObjectLiteralExpression([
        factory.createPropertyAssignment(
          factory.createIdentifier("type"),
          factory.createStringLiteral(arg.type.toString())
        ),
        factory.createPropertyAssignment(
          factory.createIdentifier("name"),
          factory.createStringLiteral(arg.name ? arg.name : "")
        ),
        factory.createPropertyAssignment(
          factory.createIdentifier("desc"),
          factory.createStringLiteral(arg.description ? arg.description : "")
        ),
      ]);
    });

    const returnObj = factory.createObjectLiteralExpression([
      factory.createPropertyAssignment(
        factory.createIdentifier("type"),
        factory.createStringLiteral(meth.returns.type.toString())
      ),
      factory.createPropertyAssignment(
        factory.createIdentifier("desc"),
        factory.createStringLiteral(
          meth.returns.description ? meth.returns.description : ""
        )
      ),
    ]);

    methodAssignments.push(
      factory.createNewExpression(
        factory.createIdentifier("algosdk.ABIMethod"),
        undefined,
        [
          factory.createObjectLiteralExpression([
            factory.createPropertyAssignment(
              factory.createIdentifier("name"),
              factory.createStringLiteral(meth.name)
            ),
            factory.createPropertyAssignment(
              factory.createIdentifier("desc"),
              factory.createStringLiteral(
                meth.description ? meth.description : ""
              )
            ),
            factory.createPropertyAssignment(
              factory.createIdentifier("args"),
              factory.createArrayLiteralExpression(argObjs)
            ),
            factory.createPropertyAssignment(
              factory.createIdentifier("returns"),
              returnObj
            ),
          ]),
        ]
      )
    );
  }

  // create methods property
  const methodProps = factory.createPropertyDeclaration(
    undefined,
    undefined,
    factory.createIdentifier("methods"),
    undefined,
    factory.createArrayTypeNode(
      factory.createTypeReferenceNode(
        factory.createIdentifier("algosdk.ABIMethod")
      )
    ),
    factory.createArrayLiteralExpression(methodAssignments, true)
  );

  return [
    descrProp,
    appSchemaProp,
    acctSchemaProp,
    approvalProp,
    clearProp,
    methodProps,
  ];
}
