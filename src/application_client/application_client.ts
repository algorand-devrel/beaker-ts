import algosdk, { ABIReferenceType, AtomicTransactionComposer } from "algosdk";

import { getStateSchema, Schema } from "../";
import { parseLogicError, LogicError } from "./logic_error";
import { ApplicationState, AccountState, decodeState } from "./state";

export type MethodArg =
  | algosdk.ABIArgument
  | algosdk.Transaction
  | object
  | MethodArg[];
export type MethodArgs = Record<string, MethodArg>;
export type ABIReturnType = object | void | algosdk.ABIValue;
export type TransactionOverrides = Partial<algosdk.TransactionParams>;

export function decodeNamedTuple(
  v: algosdk.ABIValue | undefined,
  keys: string[]
): object {
  if (v === undefined) return {};
  if (!Array.isArray(v)) throw Error("Expected array");
  if (v.length != keys.length)
    throw Error("Different key length than value length");

  return Object.fromEntries(
    keys.map((key, idx) => {
      return [key, v[idx]];
    })
  );
}

export interface InnerTransaction {
  txn: algosdk.Transaction;
  createdAsset?: bigint;
  createdApp?: bigint;
}

export class ABIResult<T extends ABIReturnType> {
  txID: string;
  rawReturnValue: Uint8Array;
  method: algosdk.ABIMethod;
  txInfo: Record<string, any> | undefined;
  returnValue: algosdk.ABIValue | undefined;
  decodeError: Error | undefined;

  value: T | undefined;
  inners: InnerTransaction[];

  constructor(result: algosdk.ABIResult, value?: T) {
    this.txID = result.txID;
    this.rawReturnValue = result.rawReturnValue;
    this.method = result.method;
    this.decodeError = result.decodeError;
    this.txInfo = result.txInfo;
    this.returnValue = result.returnValue;

    this.inners = [];
    if (result?.txInfo !== undefined && "inner-txns" in result.txInfo) {
      // TODO: this only parses 1 level deep
      const outer = result.txInfo["txn"]["txn"] as algosdk.EncodedTransaction;
      this.inners = result.txInfo["inner-txns"].map((itxn: any) => {
        const et = itxn["txn"]["txn"] as algosdk.EncodedTransaction;
        et.gen = outer.gen;
        et.gh = outer.gh;
        return {
          createdAsset: itxn["asset-index"] as bigint,
          createdApp: itxn["application-index"],
          txn: algosdk.Transaction.from_obj_for_encoding(
            itxn["txn"]["txn"] as algosdk.EncodedTransaction
          ),
        } as InnerTransaction;
      });
    }

    this.value = value;
  }
}

export class ApplicationClient {
  client: algosdk.Algodv2;

  appId: number;
  appAddress: string;

  signer: algosdk.TransactionSigner;
  sender: string;

  methods?: algosdk.ABIMethod[];

  approvalProgram?: string;
  clearProgram?: string;

  approvalProgramBinary?: Uint8Array;
  clearProgramBinary?: Uint8Array;

  approvalProgramMap?: algosdk.SourceMap;
  clearProgramMap?: algosdk.SourceMap;

  appSchema?: Schema;
  acctSchema?: Schema;

  constructor(opts: {
    client: algosdk.Algodv2;
    signer: algosdk.TransactionSigner;
    sender: string;
    appId?: number;
  }) {
    this.client = opts.client;

    if (opts.appId !== undefined) {
      this.appId = opts.appId;
      this.appAddress = algosdk.getApplicationAddress(opts.appId);
    } else {
      this.appId = 0;
      this.appAddress = "";
    }

    this.sender = opts.sender;
    this.signer = opts.signer;
  }

  async compile(program: string): Promise<[Uint8Array, algosdk.SourceMap]> {
    const result = await this.client.compile(program).sourcemap(true).do();
    return [
      new Uint8Array(Buffer.from(result["result"], "base64")),
      new algosdk.SourceMap(result["sourcemap"]),
    ];
  }

  private async ensurePrograms() {
    if (this.approvalProgram === undefined || this.clearProgram === undefined)
      throw Error("no approval or clear program defined");

    if (this.approvalProgramBinary === undefined) {
      const [appBin, appMap] = await this.compile(
        Buffer.from(this.approvalProgram, "base64").toString()
      );
      this.approvalProgramBinary = appBin;
      this.approvalProgramMap = appMap;
    }

    if (this.clearProgramBinary === undefined) {
      const [clearBin, clearMap] = await this.compile(
        Buffer.from(this.clearProgram, "base64").toString()
      );
      this.clearProgramBinary = clearBin;
      this.clearProgramMap = clearMap;
    }
  }

  async create(
    txParams?: TransactionOverrides
  ): Promise<[number, string, string]> {
    await this.ensurePrograms();

    if (
      this.approvalProgramBinary === undefined ||
      this.clearProgramBinary === undefined
    )
      throw Error("no approval or clear program binaries defined");

    if (this.signer === undefined) throw Error("no signer defined");

    const sp = await this.getSuggestedParams(txParams);

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationCreateTxnFromObject({
        from: this.getSender(),
        suggestedParams: sp,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: this.approvalProgramBinary,
        clearProgram: this.clearProgramBinary,
        ...this.getGlobalSchema(),
        ...this.getLocalSchema(),
        ...txParams,
      }),
      signer: this.signer,
    });

    try {
      const result = await atc.execute(this.client, 4);
      const txid = result.txIDs[0];

      if (txid === undefined)
        throw new Error("No transaction id returned from execute");

      const txinfo = await this.client.pendingTransactionInformation(txid).do();
      this.appId = txinfo["application-index"];
      this.appAddress = algosdk.getApplicationAddress(this.appId);
      return [this.appId, this.appAddress, txid];
    } catch (e) {
      throw this.wrapLogicError(e as Error);
    }
  }

  async delete(txParams?: TransactionOverrides) {
    if (this.signer === undefined) throw Error("no signer defined");

    const sp = await this.getSuggestedParams(txParams);

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationCallTxnFromObject({
        from: this.getSender(),
        suggestedParams: sp,
        onComplete: algosdk.OnApplicationComplete.DeleteApplicationOC,
        appIndex: this.appId,
        ...txParams,
      }),
      signer: this.signer,
    });

    try {
      return await atc.execute(this.client, 4);
    } catch (e) {
      throw this.wrapLogicError(e as Error);
    }
  }

  async update(txParams?: TransactionOverrides) {
    await this.ensurePrograms();

    if (
      this.approvalProgramBinary === undefined ||
      this.clearProgramBinary === undefined
    )
      throw Error("no approval or clear program binaries defined");

    if (this.signer === undefined) throw Error("no signer defined");

    const sp = await this.getSuggestedParams(txParams);

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationUpdateTxnFromObject({
        from: this.getSender(),
        suggestedParams: sp,
        approvalProgram: this.approvalProgramBinary,
        clearProgram: this.clearProgramBinary,
        appIndex: this.appId,
        ...txParams,
      }),
      signer: this.signer,
    });

    try {
      return await atc.execute(this.client, 4);
    } catch (e) {
      throw this.wrapLogicError(e as Error);
    }
  }

  async optIn(txParams?: TransactionOverrides) {
    if (this.signer === undefined) throw Error("no signer defined");

    const sp = await this.getSuggestedParams(txParams);

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationOptInTxnFromObject({
        from: this.getSender(),
        suggestedParams: sp,
        appIndex: this.appId,
        ...txParams,
      }),
      signer: this.signer,
    });

    try {
      return await atc.execute(this.client, 4);
    } catch (e) {
      throw this.wrapLogicError(e as Error);
    }
  }

  async closeOut(txParams?: TransactionOverrides) {
    if (this.signer === undefined) throw Error("no signer defined");

    const sp = await this.getSuggestedParams(txParams);

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationCloseOutTxnFromObject({
        from: this.getSender(),
        suggestedParams: sp,
        appIndex: this.appId,
        ...txParams,
      }),
      signer: this.signer,
    });

    try {
      return await atc.execute(this.client, 4);
    } catch (e) {
      throw this.wrapLogicError(e as Error);
    }
  }

  async clearState(txParams?: TransactionOverrides) {
    if (this.signer === undefined) throw Error("no signer defined");

    const sp = await this.getSuggestedParams(txParams);

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationClearStateTxnFromObject({
        from: this.getSender(),
        suggestedParams: sp,
        appIndex: this.appId,
      }),
      signer: this.signer,
    });

    try {
      return await atc.execute(this.client, 4);
    } catch (e) {
      throw this.wrapLogicError(e as Error);
    }
  }

  async execute(
    atc: AtomicTransactionComposer
  ): Promise<algosdk.ABIResult> {
    try {
      const result = await atc.execute(this.client, 4);
      return result.methodResults[0]
        ? result.methodResults[0]
        : ({} as algosdk.ABIResult);
    } catch (e) {
      throw this.wrapLogicError(e as Error);
    }
  }

  async addMethodCall(
    method: algosdk.ABIMethod,
    args?: MethodArgs,
    txParams?: TransactionOverrides,
    atc?: algosdk.AtomicTransactionComposer,
  ): Promise<algosdk.AtomicTransactionComposer> {

    if(atc === undefined){
      atc = new algosdk.AtomicTransactionComposer() 
    }

    if (this.signer === undefined) throw new Error("no signer defined");

    const sp = await this.getSuggestedParams(txParams);

    const processedArgs: algosdk.ABIArgument[] = [];
    for (const expected_arg of method.args) {
      if (args === undefined)
        throw new Error(`No args passed, expected ${method.args}`);

      if (expected_arg.name === undefined || !(expected_arg.name in args)) {
        // Error! (or check hints)
        throw new Error(`Cant find required argument: ${expected_arg.name}`);
      }

      let arg = args[expected_arg.name];

      if (arg instanceof algosdk.Transaction) {
        arg = {
          txn: arg,
          signer: this.signer,
        } as algosdk.TransactionWithSigner;
      } else if (arg instanceof Uint8Array) {
        // TODO: other types?
        if (expected_arg.type instanceof algosdk.ABIAddressType || expected_arg.type == ABIReferenceType.account){
          arg = algosdk.encodeAddress(arg)
        }
      }else if ( arg instanceof Object && !algosdk.isTransactionWithSigner(arg)) {
        arg = Object.values(arg);
      }

      processedArgs.push(arg as algosdk.ABIArgument);
    }

    atc.addMethodCall({
      appID: this.appId,
      method: method,
      methodArgs: processedArgs,
      sender: this.getSender(),
      suggestedParams: sp,
      signer: this.signer,
      ...txParams,
    });

    return atc;
  }

  wrapLogicError(e: Error): Error {
    if (
      this.approvalProgram === undefined ||
      this.approvalProgramMap == undefined
    )
      return e;

    const led = parseLogicError(e.message);

    if (led.msg !== undefined)
      return new LogicError(
        led,
        Buffer.from(this.approvalProgram, "base64").toString().split("\n"),
        this.approvalProgramMap
      );
    else return e;
  }

  async resolve(
    source: string,
    data: bigint | number | string | Uint8Array
  ): Promise<MethodArg> {
    let val;
    switch (source) {
      case "global-state":
        // Use the raw return value, so encode the key as hex since 
        // that is what we get back from the call to getAppState
        const appState = await this.getApplicationState(true);
        const key = Buffer.from(data as string).toString('hex')

        val = appState[key];
        if (val === undefined)
          throw new Error(`no global state value: ${data}`);

        return val;
      case "local-state":
        // TODO: how do we pass in which account to resolve against ?
        // This assumes the current client sender
        const acctState = await this.getAccountState();
        val = acctState[data as string];
        if (val === undefined)
          throw new Error(`no global state value: ${data}`);
        return val;
      case "abi-method":
        // TODO: args?
        if(this.methods === undefined)
          throw new Error("no methods defined, cannot resolve hint")
        const meth = algosdk.getMethodByName(this.methods, data as string)
        return this.execute(await this.addMethodCall(meth, undefined))
      default:
        return data;
    }
  }

  async getSuggestedParams(
    txParams?: TransactionOverrides
  ): Promise<algosdk.SuggestedParams> {
    if (txParams !== undefined && txParams.suggestedParams !== undefined)
      return txParams.suggestedParams;
    return await this.client.getTransactionParams().do();
  }

  async getApplicationState(raw?: boolean): Promise<ApplicationState> {
    const appInfo = await this.client.getApplicationByID(this.appId).do();
    if (!("params" in appInfo) || !("global-state" in appInfo["params"]))
      throw new Error("No global state found");
    return decodeState(
      appInfo["params"]["global-state"],
      raw
    ) as ApplicationState;
  }

  async getAccountState(
    address?: string,
    raw?: boolean
  ): Promise<AccountState> {
    if (address === undefined) address = this.getSender();
    const acctInfo = await this.client
      .accountApplicationInformation(address, this.appId)
      .do();
    if (
      !("app-local-state" in acctInfo) ||
      !("key-value" in acctInfo["app-local-state"])
    )
      throw new Error("No global state found");
    return decodeState(
      acctInfo["app-local-state"]["key-value"],
      raw
    ) as ApplicationState;
  }

  private getSender(): string {
    return this.sender;
  }

  private getLocalSchema(): {
    numLocalInts: number;
    numLocalByteSlices: number;
  } {
    if (this.acctSchema === undefined)
      throw new Error("No account schema defined");
    const s = getStateSchema(this.acctSchema);
    return { numLocalInts: s.uints, numLocalByteSlices: s.bytes };
  }

  private getGlobalSchema(): {
    numGlobalInts: number;
    numGlobalByteSlices: number;
  } {
    if (this.appSchema === undefined) throw new Error("No app schema defined");
    const s = getStateSchema(this.appSchema);
    return { numGlobalInts: s.uints, numGlobalByteSlices: s.bytes };
  }
}
