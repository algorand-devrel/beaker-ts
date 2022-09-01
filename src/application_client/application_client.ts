import algosdk, { ABIValue, SuggestedParams, TransactionParams } from "algosdk";

import { getStateSchema, Schema } from "../";
import { parseLogicError, LogicError } from "./logic_error";
import { ApplicationState, AccountState, decodeState } from "./state"

export type MethodArg = algosdk.ABIArgument | algosdk.Transaction | object | MethodArg[];

export type MethodArgs = {
  [key: string]: MethodArg
};

export type ABIReturnType = object | void | algosdk.ABIValue

export function decodeNamedTuple(v: ABIValue, keys: string[]): object {
  if(!Array.isArray(v)) throw Error("Expected array")
  if(v.length != keys.length) throw Error("Different key length than value length")

  return Object.fromEntries(keys.map((key, idx)=>{ return [key, v[idx]]}))
}

export class ABIResult<T extends ABIReturnType> {
  txID: string;
  rawReturnValue: Uint8Array;
  method: algosdk.ABIMethod;
  returnValue: ABIValue;
  decodeError?: Error;
  txInfo?: Record<string, any>;

  value: T;

  constructor(result: algosdk.ABIResult | undefined, value?: T){
    this.txID = result.txID;
    this.rawReturnValue = result.rawReturnValue;
    this.method = result.method;
    this.decodeError = result.decodeError;
    this.txInfo = result.txInfo;
    this.returnValue = result.returnValue
    this.value = value 
  }

}


export class ApplicationClient {
  client: algosdk.Algodv2;

  appId: number;
  appAddress: string;

  approvalProgram: string;
  clearProgram: string;

  approvalProgramBinary: Uint8Array;
  clearProgramBinary: Uint8Array;

  approvalProgramMap: algosdk.SourceMap;
  clearProgramMap: algosdk.SourceMap;

  appSchema: Schema;
  acctSchema: Schema;

  signer?: algosdk.TransactionSigner;
  sender: string;

  constructor(opts: {
    client: algosdk.Algodv2;
    appId?: number;
    signer?: algosdk.TransactionSigner;
    sender?: string;
  }) {
    this.client = opts.client;

    if (this.appId !== undefined) {
      this.appId = opts.appId;
      this.appAddress = algosdk.getApplicationAddress(opts.appId);
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

  async create(txParams?: algosdk.TransactionParams): Promise<[number, string, string]> {
    await this.ensurePrograms();

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
      const txinfo = await this.client
        .pendingTransactionInformation(result.txIDs[0])
        .do();
      this.appId = txinfo["application-index"];
      this.appAddress = algosdk.getApplicationAddress(this.appId);
      return [this.appId, this.appAddress, result.txIDs[0]];
    } catch (e) {
      throw this.wrapLogicError(e);
    }
  }

  async delete(txParams?: algosdk.TransactionParams) {
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
      throw this.wrapLogicError(e);
    }
  }

  async update(txParams?: algosdk.TransactionParams) {
    await this.ensurePrograms();

    const sp = await this.getSuggestedParams(txParams)

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
      throw this.wrapLogicError(e);
    }
  }

  async optIn(txParams?: algosdk.TransactionParams) {
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
      throw this.wrapLogicError(e);
    }
  }

  async closeOut(txParams?: algosdk.TransactionParams) {
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
      throw this.wrapLogicError(e);
    }
  }

  async clearState(txParams?: algosdk.TransactionParams) {
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
      throw this.wrapLogicError(e);
    }
  }

  async call(
    method: algosdk.ABIMethod,
    args?: MethodArgs,
    txParams?: algosdk.TransactionParams
  ): Promise<algosdk.ABIResult> {

    const atc = new algosdk.AtomicTransactionComposer();

    await this.addMethodCall(atc, method, args, txParams)

    try {
      return (await atc.execute(this.client, 4)).methodResults.pop();
    } catch (e) {
      throw this.wrapLogicError(e);
    }

  }

  async addMethodCall(
    atc: algosdk.AtomicTransactionComposer,
    method: algosdk.ABIMethod,
    args?: MethodArgs,
    txParams?: algosdk.TransactionParams
  ): Promise<algosdk.AtomicTransactionComposer> {

    const sp = await this.getSuggestedParams(txParams);

    const processedArgs: algosdk.ABIArgument[] = [];
    for (const expected_arg of method.args) {

      if (!(expected_arg.name in args)) {
        // Error! (or check hints)
        throw new Error(`Cant find required argument: ${expected_arg.name}`);
      }

      let arg = args[expected_arg.name];

      if (arg instanceof algosdk.Transaction) {
        arg = { txn: arg, signer: this.signer } as algosdk.TransactionWithSigner;
      } else if(arg instanceof Object){
        arg = Object.values(arg)
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

    return atc
  }

  wrapLogicError(e: Error): Error {
    const led = parseLogicError(e.message);
    if (led.msg !== undefined)
      return new LogicError(
        led,
        Buffer.from(this.approvalProgram, "base64").toString().split("\n"),
        this.approvalProgramMap
      );
    else return e;
  }

  async getSuggestedParams(txParams?: algosdk.TransactionParams): Promise<algosdk.SuggestedParams> {
    if(txParams !== undefined && txParams.suggestedParams !== undefined)  return txParams.suggestedParams
    return await this.client.getTransactionParams().do();
  }


  async getApplicationState(raw?: boolean): Promise<ApplicationState> {
    const appInfo = await this.client.getApplicationByID(this.appId).do()
    if (!('params' in appInfo) || !('global-state' in appInfo['params'])) throw Error("No global state found")
    return decodeState(appInfo['params']['global-state'], raw) as ApplicationState
  }

  async getAccountState(address?: string, raw?: boolean): Promise<AccountState> {
    if(address === undefined) address = this.getSender()
    const acctInfo = await this.client.accountApplicationInformation(address, this.appId).do()
    if (!('app-local-state' in acctInfo) || !('key-value' in acctInfo['app-local-state'])) throw Error("No global state found")
    return decodeState(acctInfo['app-local-state']['key-value'], raw) as ApplicationState
  }


  private getSender(): string {
    return this.sender;
  }

  private getLocalSchema(): {
    numLocalInts: number;
    numLocalByteSlices: number;
  } {
    const s = getStateSchema(this.acctSchema);
    return { numLocalInts: s.uints, numLocalByteSlices: s.bytes };
  }

  private getGlobalSchema(): {
    numGlobalInts: number;
    numGlobalByteSlices: number;
  } {
    const s = getStateSchema(this.appSchema);
    return { numGlobalInts: s.uints, numGlobalByteSlices: s.bytes };
  }

}
