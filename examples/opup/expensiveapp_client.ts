import algosdk from "algosdk";
import * as bkr from "../../src/";
export class ExpensiveApp extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: { opup_app_id: { type: bkr.AVMType.uint64, key: "ouaid", desc: "", static: false } }, dynamic: {} };
    override acctSchema: bkr.Schema = { declared: {}, dynamic: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKaW50Y2Jsb2NrIDAgMSA2CmJ5dGVjYmxvY2sgMHg2Zjc1NjE2OTY0IDB4MTUxZjdjNzUKdHhuIE51bUFwcEFyZ3MKaW50Y18wIC8vIDAKPT0KYm56IG1haW5fbDYKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHg2MjI4YzY4MiAvLyAiaGFzaF9pdChzdHJpbmcsdWludDY0LGFwcGxpY2F0aW9uKWJ5dGVbMzJdIgo9PQpibnogbWFpbl9sNQp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweDEwMWNlYTAwIC8vICJvcHVwX2Jvb3RzdHJhcChwYXkpdWludDY0Igo9PQpibnogbWFpbl9sNAplcnIKbWFpbl9sNDoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuIEdyb3VwSW5kZXgKaW50Y18xIC8vIDEKLQpzdG9yZSA5CmxvYWQgOQpndHhucyBUeXBlRW51bQppbnRjXzEgLy8gcGF5Cj09CmFzc2VydApsb2FkIDkKY2FsbHN1YiBvcHVwYm9vdHN0cmFwXzQKc3RvcmUgMTAKYnl0ZWNfMSAvLyAweDE1MWY3Yzc1CmxvYWQgMTAKaXRvYgpjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2w1Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCnN0b3JlIDAKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgpidG9pCnN0b3JlIDEKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMwppbnRjXzAgLy8gMApnZXRieXRlCnN0b3JlIDIKbG9hZCAwCmxvYWQgMQpsb2FkIDIKY2FsbHN1YiBoYXNoaXRfMQpzdG9yZSAzCmJ5dGVjXzEgLy8gMHgxNTFmN2M3NQpsb2FkIDMKY29uY2F0CmxvZwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sNjoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQpibnogbWFpbl9sOAplcnIKbWFpbl9sODoKdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKPT0KYXNzZXJ0CmNhbGxzdWIgY3JlYXRlXzAKaW50Y18xIC8vIDEKcmV0dXJuCgovLyBjcmVhdGUKY3JlYXRlXzA6CmludGNfMSAvLyAxCnJldHVybgoKLy8gaGFzaF9pdApoYXNoaXRfMToKc3RvcmUgNgpzdG9yZSA1CnN0b3JlIDQKbG9hZCA2CnR4bmFzIEFwcGxpY2F0aW9ucwpieXRlY18wIC8vICJvdWFpZCIKYXBwX2dsb2JhbF9nZXQKPT0KYXNzZXJ0CnB1c2hpbnQgMjU1IC8vIDI1NQpjYWxsc3ViIGNhbGxvcHVwXzIKbG9hZCA0CmV4dHJhY3QgMiAwCnN0b3JlIDcKaW50Y18wIC8vIDAKc3RvcmUgOApoYXNoaXRfMV9sMToKbG9hZCA4CmxvYWQgNQo8CmJ6IGhhc2hpdF8xX2wzCmxvYWQgNwpzaGEyNTYKc3RvcmUgNwpsb2FkIDgKaW50Y18xIC8vIDEKKwpzdG9yZSA4CmIgaGFzaGl0XzFfbDEKaGFzaGl0XzFfbDM6CmxvYWQgNwpyZXRzdWIKCi8vIGNhbGxfb3B1cApjYWxsb3B1cF8yOgpzdG9yZSAxMQpsb2FkIDExCmludGNfMSAvLyAxCj09CmJueiBjYWxsb3B1cF8yX2w0CmludGNfMCAvLyAwCnN0b3JlIDEyCmNhbGxvcHVwXzJfbDI6CmxvYWQgMTIKbG9hZCAxMQo8CmJ6IGNhbGxvcHVwXzJfbDUKaXR4bl9iZWdpbgppbnRjXzIgLy8gYXBwbAppdHhuX2ZpZWxkIFR5cGVFbnVtCmJ5dGVjXzAgLy8gIm91YWlkIgphcHBfZ2xvYmFsX2dldAppdHhuX2ZpZWxkIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKaXR4bl9maWVsZCBGZWUKaXR4bl9zdWJtaXQKbG9hZCAxMgppbnRjXzEgLy8gMQorCnN0b3JlIDEyCmIgY2FsbG9wdXBfMl9sMgpjYWxsb3B1cF8yX2w0OgppdHhuX2JlZ2luCmludGNfMiAvLyBhcHBsCml0eG5fZmllbGQgVHlwZUVudW0KYnl0ZWNfMCAvLyAib3VhaWQiCmFwcF9nbG9iYWxfZ2V0Cml0eG5fZmllbGQgQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAppdHhuX2ZpZWxkIEZlZQppdHhuX3N1Ym1pdApjYWxsb3B1cF8yX2w1OgpyZXRzdWIKCi8vIGNyZWF0ZV9vcHVwCmNyZWF0ZW9wdXBfMzoKaXR4bl9iZWdpbgppbnRjXzIgLy8gYXBwbAppdHhuX2ZpZWxkIFR5cGVFbnVtCnB1c2hieXRlcyAweDA2MzEwMDMyMDkxMjQzIC8vIGJhc2U2NChCakVBTWdrU1F3PT0pCml0eG5fZmllbGQgQXBwcm92YWxQcm9ncmFtCnB1c2hieXRlcyAweDA2ODEwMTQzIC8vIGJhc2U2NChCb0VCUXc9PSkKaXR4bl9maWVsZCBDbGVhclN0YXRlUHJvZ3JhbQppbnRjXzAgLy8gMAppdHhuX2ZpZWxkIEZlZQppdHhuX3N1Ym1pdAppbnRjXzAgLy8gMApieXRlY18wIC8vICJvdWFpZCIKYXBwX2dsb2JhbF9nZXRfZXgKc3RvcmUgMTQKc3RvcmUgMTMKbG9hZCAxNAohCmFzc2VydApieXRlY18wIC8vICJvdWFpZCIKaXR4biBDcmVhdGVkQXBwbGljYXRpb25JRAphcHBfZ2xvYmFsX3B1dApyZXRzdWIKCi8vIG9wdXBfYm9vdHN0cmFwCm9wdXBib290c3RyYXBfNDoKZ3R4bnMgQW1vdW50CnB1c2hpbnQgMTAwMDAwIC8vIDEwMDAwMAo+PQphc3NlcnQKY2FsbHN1YiBjcmVhdGVvcHVwXzMKYnl0ZWNfMCAvLyAib3VhaWQiCmFwcF9nbG9iYWxfZ2V0CnJldHN1Yg==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKcHVzaGludCAwIC8vIDAKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "hash_it", desc: "", args: [{ type: "string", name: "input", desc: "" }, { type: "uint64", name: "iters", desc: "" }, { type: "application", name: "opup_app", desc: "" }], returns: { type: "byte[32]", desc: "" } }),
        new algosdk.ABIMethod({ name: "opup_bootstrap", desc: "", args: [{ type: "pay", name: "ptxn", desc: "" }], returns: { type: "uint64", desc: "" } })
    ];
    async hash_it(args: {
        input: string;
        iters: bigint;
        opup_app?: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<Uint8Array>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "hash_it"), { input: args.input, iters: args.iters, opup_app: args.opup_app === undefined ? await this.resolve("global-state", "ouaid") : args.opup_app }, txnParams);
        return new bkr.ABIResult<Uint8Array>(result, result.returnValue as Uint8Array);
    }
    async opup_bootstrap(args: {
        ptxn: algosdk.TransactionWithSigner | algosdk.Transaction;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "opup_bootstrap"), { ptxn: args.ptxn }, txnParams);
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
}
