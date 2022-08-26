import algosdk from "algosdk";

import { getStateSchema, Schema } from "../generate/";
import { parseLogicError, LogicError } from "./logic_error";

export type MethodArg = algosdk.ABIArgument | algosdk.Transaction | object | MethodArg[];

export type MethodArgs = {
  [key: string]: MethodArg
};

export type ABIReturnType = object | void | algosdk.ABIValue

export class ABIResult<T extends ABIReturnType> {
  txID: string;
  rawReturnValue: Uint8Array;
  method: algosdk.ABIMethod;
  returnValue?: T;
  decodeError?: Error;
  txInfo?: Record<string, any>;

  constructor(result: algosdk.ABIResult, t: T){
    this.txID = result.txID;
    this.rawReturnValue = result.rawReturnValue;
    this.method = result.method;
    this.decodeError = result.decodeError;
    this.txInfo = result.txInfo;
    const retType = this.method.returns.type
    if(retType.toString() === 'void') return

    if(Array.isArray(result.returnValue) && typeof t === "object"){
      this.returnValue = Object.assign({}, t, Object.fromEntries(
        Object.keys(t).map((k, idx)=>{ return [k, result.returnValue[idx]]})
      ))
    }
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

  async create(): Promise<[number, string, string]> {
    await this.ensurePrograms();

    const sp = await this.client.getTransactionParams().do();

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

  async delete() {
    const sp = await this.client.getTransactionParams().do();

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationCallTxnFromObject({
        from: this.getSender(),
        suggestedParams: sp,
        onComplete: algosdk.OnApplicationComplete.DeleteApplicationOC,
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

  async update() {
    await this.ensurePrograms();

    const sp = await this.client.getTransactionParams().do();

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationUpdateTxnFromObject({
        from: this.getSender(),
        suggestedParams: sp,
        approvalProgram: this.approvalProgramBinary,
        clearProgram: this.clearProgramBinary,
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

  async optIn() {
    const sp = await this.client.getTransactionParams().do();

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationOptInTxnFromObject({
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

  async closeOut() {
    const sp = await this.client.getTransactionParams().do();

    const atc = new algosdk.AtomicTransactionComposer();
    atc.addTransaction({
      txn: algosdk.makeApplicationCloseOutTxnFromObject({
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

  async clearState() {
    const sp = await this.client.getTransactionParams().do();

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
    txParams?: algosdk.TransactionLike
  ): Promise<algosdk.ABIResult> {
    const sp = await this.client.getTransactionParams().do();
    const atc = new algosdk.AtomicTransactionComposer();

    const processedArgs: algosdk.ABIArgument[] = [];

    for (const expected_arg of method.args) {
      if (!(expected_arg.name in args)) {
        // Error! (or check hints)
        throw new Error(`Cant find required argument: ${expected_arg.name}`);
      }

      let arg = args[expected_arg.name];

      if (arg instanceof algosdk.Transaction) {
        arg = { txn: arg, signer: this.signer } as algosdk.TransactionWithSigner;
      }

      if(arg instanceof Object){
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

    try {
      return (await atc.execute(this.client, 4)).methodResults.pop();
    } catch (e) {
      throw this.wrapLogicError(e);
    }

  }

  async addMethodCall() {}

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
