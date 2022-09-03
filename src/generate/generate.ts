import type {
  AppSpec,
  DeclaredSchemaValueSpec,
  DynamicSchemaValueSpec,
  Hint,
  Schema,
  Struct,
} from "./appspec";

import algosdk from "algosdk";
import ts, { factory } from "typescript";
import { writeFileSync } from "fs";

// AMAZING resource:
// https://ts-ast-viewer.com/#

const CLIENT_NAME = "bkr.ApplicationClient";
// TODO: only import if we _need_ them
const CLIENT_IMPORTS = `* as bkr`;
const CLIENT_PATH = "beaker-ts";

const ALGOSDK_IMPORTS = "algosdk";
const ALGOSDK_PATH = "algosdk";

const REF_TYPES: string[] = ["account", "application", "asset"];

const TXN_TYPES: string[] = [
  "txn",
  "pay",
  "axfer",
  "acfg",
  "appl",
  "keyreg",
  "frz",
];


// native types
const UINT8_ARRAY_IDENT = factory.createIdentifier("Uint8Array")
const UINT8_ARRAY_TYPE = factory.createTypeReferenceNode(UINT8_ARRAY_IDENT)

// sdk types
const ABI_METHOD_IDENT = factory.createIdentifier("algosdk.ABIMethod")
const ABI_METHOD_TYPE = factory.createTypeReferenceNode( ABI_METHOD_IDENT)

// bkr types
const ABI_RESULT_IDENT = factory.createIdentifier("bkr.ABIResult")
const DECODE_NAMED_TUPLE_IDENT = factory.createIdentifier("bkr.decodeNamedTuple")
const SCHEMA_TYPE =  factory.createTypeReferenceNode("bkr.Schema")
const TRANSACTION_OVERRIDES_TYPE = factory.createTypeReferenceNode("bkr.TransactionOverrides")


function tsTypeFromAbiType(argType: string | algosdk.ABIType): ts.TypeNode {
  if (typeof argType === "string") {
    if (TXN_TYPES.includes(argType))
      return factory.createUnionTypeNode([
        factory.createTypeReferenceNode("algosdk.TransactionWithSigner"),
        factory.createTypeReferenceNode("algosdk.Transaction"),
      ]);

    if (REF_TYPES.includes(argType)) {
      if (["application", "asset"].includes(argType))
        return factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword);

      return factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    }
  }

  const abiType =
    typeof argType === "string" ? algosdk.ABIType.from(argType) : argType;
  switch (abiType.constructor) {
    case algosdk.ABIByteType:
      return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case algosdk.ABIUintType:
    case algosdk.ABIUfixedType:
      return factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword);
    case algosdk.ABIAddressType:
    case algosdk.ABIStringType:
      return factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case algosdk.ABIBoolType:
      return factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    case algosdk.ABIArrayStaticType:
      const asStaticArr = abiType as algosdk.ABIArrayStaticType;
      switch (asStaticArr.childType.constructor) {
        // If its bytes, make it a uint8array
        case algosdk.ABIByteType:
          return UINT8_ARRAY_TYPE
      }

      return factory.createArrayTypeNode(
        tsTypeFromAbiType(asStaticArr.childType)
      );
    case algosdk.ABIArrayDynamicType:
      const asArr = abiType as algosdk.ABIArrayStaticType;

      switch (asArr.childType.constructor) {
        // If its bytes, make it a uint8array
        case algosdk.ABIByteType:
          return UINT8_ARRAY_TYPE
      }

      return factory.createArrayTypeNode(tsTypeFromAbiType(asArr.childType));

    case algosdk.ABITupleType:
      const asTuple = abiType as algosdk.ABITupleType;
      return factory.createTupleTypeNode(
        asTuple.childTypes.map((elem: algosdk.ABIType) => {
          return tsTypeFromAbiType(elem);
        })
      );
  }

  return factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
}

function defaultValueFromTsType(t: ts.TypeNode): ts.Expression {
  switch (t.kind) {
    case ts.SyntaxKind.StringKeyword:
      return factory.createStringLiteral("");
    case ts.SyntaxKind.NumberKeyword:
      return factory.createNumericLiteral(0);
    case ts.SyntaxKind.BigIntKeyword:
      return factory.createCallExpression(
        factory.createIdentifier("BigInt"),
        undefined,
        [factory.createNumericLiteral("0")]
      );
    case ts.SyntaxKind.BooleanKeyword:
      return factory.createIdentifier("false");
    case ts.SyntaxKind.TypeReference:
      return factory.createNewExpression(
        UINT8_ARRAY_IDENT,
        undefined,
        []
      );
  }

  return factory.createIdentifier("undefined");
}

export function generateApplicationClient(
  appSpec: AppSpec,
  path: string,
  beakerPath?: string
) {
  const name = appSpec.contract.name;

  const nodes: ts.Node[] = generateImports(beakerPath);

  const structNodes = generateStructTypes(appSpec);
  nodes.push(...structNodes);

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
function generateImports(beakerPath?: string): ts.ImportDeclaration[] {
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
      factory.createStringLiteral(beakerPath ? beakerPath : CLIENT_PATH),
      undefined
    ),
  ];
}

function generateClass(appSpec: AppSpec): ts.ClassDeclaration {
  return factory.createClassDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
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
      ...appSpec.contract.methods.map((meth) =>
        generateMethodImpl(meth, appSpec)
      ),
    ]
  );
}

// Creates the methods on the AppClient class used to call specific ABI methods 
function generateMethodImpl(
  method: algosdk.ABIMethod,
  spec: AppSpec
): ts.ClassElement {

  const params: ts.ParameterDeclaration[] = [];
  const callArgs: ts.Expression[] = [];
  const abiMethodArgs: ts.PropertyAssignment[] = [];
  const argParams: ts.PropertySignature[] = [];

  const hint =
    method.name in spec.hints ? spec.hints[method.name] : ({} as Hint);

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
    if (arg.name === undefined) continue;

    const argName: ts.Identifier = factory.createIdentifier(arg.name);

    let argType: ts.TypeNode = tsTypeFromAbiType(arg.type.toString());
    if (
      hint !== undefined &&
      hint.structs !== undefined &&
      arg.name in hint.structs
    ) {
      const structHint = hint.structs[arg.name];
      if (structHint !== undefined)
        argType = factory.createTypeReferenceNode(structHint.name);
    }

    const defaultArg =
      hint?.default_arguments !== undefined &&
      arg.name in hint.default_arguments
        ? hint.default_arguments[arg.name]
        : undefined;

    let argVal: ts.Expression = factory.createIdentifier(`args.${arg.name}`);
    if (defaultArg !== undefined) {
      let data: ts.Expression;
      if (typeof defaultArg.data == "string") {
        data = factory.createStringLiteral(defaultArg.data);
      } else if (typeof defaultArg.data == "bigint") {
        data = factory.createBigIntLiteral(defaultArg.data.toString());
      } else if (typeof defaultArg.data == "number") {
        data = factory.createNumericLiteral(defaultArg.data);
      } else {
        data = factory.createIdentifier("undefined");
      }

      argVal = factory.createConditionalExpression(
        factory.createBinaryExpression(
          argVal,
          factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
          factory.createIdentifier("undefined")
        ),
        factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createAwaitExpression(
          factory.createCallExpression(
            factory.createIdentifier("this.resolve"),
            undefined,
            [factory.createStringLiteral(defaultArg.source), data]
          )
        ),
        factory.createToken(ts.SyntaxKind.ColonToken),
        argVal
      );
    }

    abiMethodArgs.push(factory.createPropertyAssignment(argName, argVal));

    const optional =
      defaultArg !== undefined
        ? factory.createToken(ts.SyntaxKind.QuestionToken)
        : undefined;

    //factory.createPropertyDeclaration
    argParams.push(
      factory.createPropertySignature(undefined, arg.name, optional, argType)
    );
  }

  // Expect args
  if(argParams.length>0){
    params.push(
      factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        factory.createIdentifier("args"),
        undefined,
        factory.createTypeLiteralNode(argParams)
      )
    );
  }

  // Any tx overrides

  const txnParams = factory.createIdentifier("txnParams");
  params.push(
    factory.createParameterDeclaration(
      undefined,
      undefined,
      undefined,
      txnParams,
      factory.createToken(ts.SyntaxKind.QuestionToken),
      TRANSACTION_OVERRIDES_TYPE,
    )
  );

  // Set up return type
  let abiRetType: ts.TypeNode = factory.createKeywordTypeNode(
    ts.SyntaxKind.VoidKeyword
  );
  let resultArgs: ts.Expression[] = [factory.createIdentifier("result")];

  if (method.returns.type.toString() !== "void") {
    abiRetType = tsTypeFromAbiType(method.returns.type.toString());
    // Always `output` here because pyteal,
    // when others app specs come in we should consider them
    if (
      hint !== undefined &&
      hint?.structs !== undefined &&
      "output" in hint.structs
    ) {
      const outputHint = hint.structs["output"];
      if (outputHint !== undefined) {
        abiRetType = factory.createTypeReferenceNode(outputHint?.name);
        resultArgs.push(
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier(outputHint.name),
              factory.createIdentifier("decodeResult")
            ),
            undefined,
            [
              factory.createPropertyAccessExpression(
                factory.createIdentifier("result"),
                factory.createIdentifier("returnValue")
              ),
            ]
          )
        );
      }
    } else {
      resultArgs.push(
        factory.createAsExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier("result"),
            factory.createIdentifier("returnValue")
          ),
          abiRetType
        )
      );
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
                  [
                    ...callArgs,
                    factory.createObjectLiteralExpression(abiMethodArgs),
                    txnParams,
                  ]
                )
              )
            ),
          ],
          ts.NodeFlags.Const
        )
      ),
      factory.createReturnStatement(
        factory.createNewExpression(
          ABI_RESULT_IDENT, [abiRetType], resultArgs
        )
      ),
    ],
    true
  );

  let retType = factory.createTypeReferenceNode(
    factory.createIdentifier("Promise"),
    [
      factory.createTypeReferenceNode(ABI_RESULT_IDENT, [abiRetType]),
    ]
  );

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
            factory.createIdentifier(`bkr.AVMType.${sv[1].type}`)
          ),
          objStrProperty("key", sv[1].key),
          objStrProperty("desc", sv[1].desc),
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
            factory.createIdentifier(`bkr.AVMType.${sv[1].type.toString()}`)
          ),
          objStrProperty("desc", sv[1].desc),
          factory.createPropertyAssignment(
            factory.createIdentifier("max_keys"),
            factory.createNumericLiteral(sv[1].max_keys ? sv[1].max_keys : 0)
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
  const hints = spec.hints;

  const structs: Record<string, ts.ClassDeclaration> = {};

  for (const k of Object.keys(hints)) {
    const hint = hints[k];

    if (hint !== undefined && hint.structs !== undefined) {
      for (const sk of Object.keys(hint.structs)) {
        const struct: Struct | undefined = hint.structs[sk];
        if (struct !== undefined && !(struct.name in struct)) {
          structs[struct.name] = generateStruct(struct);
        }
      }
    }
  }

  return Object.values(structs);
}

function generateStruct(s: Struct): ts.ClassDeclaration {
  const members: ts.ClassElement[] = [];
  const tupleTypes: string[] = [];
  const tupleNames: string[] = [];

  for (const elem of s.elements) {
    tupleNames.push(elem[0]);
    tupleTypes.push(elem[1]);
    const tsType = tsTypeFromAbiType(elem[1]);
    members.push(
      factory.createPropertyDeclaration(
        undefined,
        undefined,
        factory.createIdentifier(elem[0]),
        undefined,
        tsType,
        defaultValueFromTsType(tsType)
      )
    );
  }

  members.push(
    factory.createPropertyDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.StaticKeyword)],
      factory.createIdentifier("codec"),
      undefined,
      factory.createTypeReferenceNode(
        factory.createQualifiedName(
          factory.createIdentifier("algosdk"),
          factory.createIdentifier("ABIType")
        ),
        undefined
      ),
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier("algosdk"),
            factory.createIdentifier("ABIType")
          ),
          factory.createIdentifier("from")
        ),
        undefined,
        [factory.createStringLiteral(`(${tupleTypes.join(",")})`)]
      )
    )
  );
  members.push(
    factory.createPropertyDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.StaticKeyword)],
      factory.createIdentifier("fields"),
      undefined,
      factory.createTypeReferenceNode("string[]"),
      factory.createArrayLiteralExpression(
        tupleNames.map((name) => {
          return factory.createStringLiteral(name);
        })
      )
    )
  );

  members.push(
    // Add static `decodeResult(val: ABIValue): <T>` method
    factory.createMethodDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.StaticKeyword)],
      undefined,
      factory.createIdentifier("decodeResult"),
      undefined,
      undefined,
      [
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier("val"),
          undefined,
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(
              factory.createQualifiedName(
                factory.createIdentifier("algosdk"),
                factory.createIdentifier("ABIValue")
              ),
              undefined
            ),
            factory.createTypeReferenceNode("undefined"),
          ]),
          undefined
        ),
      ],
      factory.createTypeReferenceNode(
        factory.createIdentifier(s.name),
        undefined
      ),
      factory.createBlock(
        [
          factory.createReturnStatement(
            factory.createAsExpression(
              factory.createCallExpression(
                DECODE_NAMED_TUPLE_IDENT,
                undefined,
                [
                  factory.createIdentifier("val"),
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier(s.name),
                    factory.createIdentifier("fields")
                  ),
                ]
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(s.name),
                undefined
              )
            )
          ),
        ],
        true
      )
    )
  );

  members.push(
    factory.createMethodDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.StaticKeyword)],
      undefined,
      factory.createIdentifier("decodeBytes"),
      undefined,
      undefined,
      [
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier("val"),
          undefined,
          UINT8_ARRAY_TYPE,
          undefined
        ),
      ],
      factory.createTypeReferenceNode(
        factory.createIdentifier(s.name),
        undefined
      ),
      factory.createBlock(
        [
          factory.createReturnStatement(
            factory.createAsExpression(
              factory.createCallExpression(
                DECODE_NAMED_TUPLE_IDENT,
                undefined,
                [
                  factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier(s.name),
                        factory.createIdentifier("codec")
                      ),
                      factory.createIdentifier("decode")
                    ),
                    undefined,
                    [factory.createIdentifier("val")]
                  ),
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier(s.name),
                    factory.createIdentifier("fields")
                  ),
                ]
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier(s.name),
                undefined
              )
            )
          ),
        ],
        true
      )
    )
  );

  return factory.createClassDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(s.name),
    undefined,
    undefined,
    members
  );
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
    [factory.createModifier(ts.SyntaxKind.OverrideKeyword)],
    factory.createIdentifier("approvalProgram"),
    undefined,
    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    factory.createStringLiteral(source.approval)
  );

  // Create clear program property
  const clearProp = factory.createPropertyDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.OverrideKeyword)],
    factory.createIdentifier("clearProgram"),
    undefined,
    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    factory.createStringLiteral(source.clear)
  );

  // Create App Schema Property
  const appSchemaProp = factory.createPropertyDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.OverrideKeyword)],
    factory.createIdentifier("appSchema"),
    undefined,
    SCHEMA_TYPE,
    copySchemaObject(schema.global)
  );

  // Create Acct schema property
  const acctSchemaProp = factory.createPropertyDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.OverrideKeyword)],
    factory.createIdentifier("acctSchema"),
    undefined,
    SCHEMA_TYPE,
    copySchemaObject(schema.local)
  );

  // Add methods
  const methodAssignments: ts.Expression[] = [];
  for (const meth of methods) {

    const argObjs: ts.ObjectLiteralExpression[] = meth.args.map((arg) => {
      return factory.createObjectLiteralExpression([
        objStrProperty("type", arg.type.toString()),
        objStrProperty("name", arg.name),
        objStrProperty("desc", arg.description)
      ]);
    });

    const returnObj = factory.createObjectLiteralExpression([
      objStrProperty("type", meth.returns.type.toString()),
      objStrProperty("desc", meth.returns.description)
    ]);

    // Create ABIMethod object 
    methodAssignments.push(
      factory.createNewExpression(
        ABI_METHOD_IDENT,
        undefined,
        [
          factory.createObjectLiteralExpression([
            objStrProperty("name", meth.name),
            objStrProperty("desc", meth.description),
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
    [factory.createModifier(ts.SyntaxKind.OverrideKeyword)],
    factory.createIdentifier("methods"),
    undefined,
    factory.createArrayTypeNode(ABI_METHOD_TYPE),
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


function objStrProperty(k: string, v: string | undefined): ts.PropertyAssignment {
  const val = v===undefined?"":v
  return factory.createPropertyAssignment(
        factory.createIdentifier(k),
        factory.createStringLiteral(val)
  )
}