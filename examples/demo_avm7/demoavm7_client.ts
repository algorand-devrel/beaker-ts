import algosdk from "algosdk";
import * as bkr from "../../src/";
export class BlockDetails {
    ts: bigint = BigInt(0);
    seed: Uint8Array = new Uint8Array();
    static codec: algosdk.ABIType = algosdk.ABIType.from("(uint64,byte[32])");
    static fields: string[] = ["ts", "seed"];
    static decodeResult(val: algosdk.ABIValue | undefined): BlockDetails {
        return bkr.decodeNamedTuple(val, BlockDetails.fields) as BlockDetails;
    }
    static decodeBytes(val: Uint8Array): BlockDetails {
        return bkr.decodeNamedTuple(BlockDetails.codec.decode(val), BlockDetails.fields) as BlockDetails;
    }
}
export class JsonExampleResult {
    string_key: string = "";
    uint_key: bigint = BigInt(0);
    obj_key: string = "";
    static codec: algosdk.ABIType = algosdk.ABIType.from("(string,uint64,string)");
    static fields: string[] = ["string_key", "uint_key", "obj_key"];
    static decodeResult(val: algosdk.ABIValue | undefined): JsonExampleResult {
        return bkr.decodeNamedTuple(val, JsonExampleResult.fields) as JsonExampleResult;
    }
    static decodeBytes(val: Uint8Array): JsonExampleResult {
        return bkr.decodeNamedTuple(JsonExampleResult.codec.decode(val), JsonExampleResult.fields) as JsonExampleResult;
    }
}
export class DemoAVM7 extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, dynamic: {} };
    override acctSchema: bkr.Schema = { declared: {}, dynamic: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKaW50Y2Jsb2NrIDAgMQpieXRlY2Jsb2NrIDB4MTUxZjdjNzUKdHhuIE51bUFwcEFyZ3MKaW50Y18wIC8vIDAKPT0KYm56IG1haW5fbDE4CnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4YTViNzk2NWQgLy8gImI2NGRlY29kZShzdHJpbmcpc3RyaW5nIgo9PQpibnogbWFpbl9sMTcKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHgzN2YyOTM4OCAvLyAiYmxvY2sodWludDY0KSh1aW50NjQsYnl0ZVszMl0pIgo9PQpibnogbWFpbl9sMTYKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHg5MzQ1ZjY0MSAvLyAiZWQyNTUxOXZlcmlmeV9iYXJlKHN0cmluZyxhZGRyZXNzLGJ5dGVbNjRdKWJvb2wiCj09CmJueiBtYWluX2wxNQp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweGU4MGUyOGJhIC8vICJqc29uX3JlZihzdHJpbmcpKHN0cmluZyx1aW50NjQsc3RyaW5nKSIKPT0KYm56IG1haW5fbDE0CnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4ZTgzYTg3YWIgLy8gIm5vb3AoKXZvaWQiCj09CmJueiBtYWluX2wxMwp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweDJlOTg1NWVjIC8vICJyZXBsYWNlKHN0cmluZyx1aW50NjQsc3RyaW5nKXN0cmluZyIKPT0KYm56IG1haW5fbDEyCnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4ZTYwOTU1YjggLy8gInNoYTNfMjU2KHN0cmluZylieXRlW10iCj09CmJueiBtYWluX2wxMQp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweDI1M2YzOTgyIC8vICJ2cmZfdmVyaWZ5KGJ5dGVbXSxieXRlWzgwXSxhZGRyZXNzKWJ5dGVbNjRdIgo9PQpibnogbWFpbl9sMTAKZXJyCm1haW5fbDEwOgp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCnN0b3JlIDMwCnR4bmEgQXBwbGljYXRpb25BcmdzIDIKc3RvcmUgMzEKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMwpzdG9yZSAzMgpsb2FkIDMwCmxvYWQgMzEKbG9hZCAzMgpjYWxsc3ViIHZyZnZlcmlmeV8xMApzdG9yZSAzMwpieXRlY18wIC8vIDB4MTUxZjdjNzUKbG9hZCAzMwpjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2wxMToKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQpjYWxsc3ViIHNoYTMyNTZfOQpzdG9yZSAyOApieXRlY18wIC8vIDB4MTUxZjdjNzUKbG9hZCAyOApjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2wxMjoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQpzdG9yZSAyMQp0eG5hIEFwcGxpY2F0aW9uQXJncyAyCmJ0b2kKc3RvcmUgMjIKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMwpzdG9yZSAyMwpsb2FkIDIxCmxvYWQgMjIKbG9hZCAyMwpjYWxsc3ViIHJlcGxhY2VfOApzdG9yZSAyNApieXRlY18wIC8vIDB4MTUxZjdjNzUKbG9hZCAyNApjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2wxMzoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKY2FsbHN1YiBub29wXzcKaW50Y18xIC8vIDEKcmV0dXJuCm1haW5fbDE0Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCmNhbGxzdWIganNvbnJlZl82CnN0b3JlIDEyCmJ5dGVjXzAgLy8gMHgxNTFmN2M3NQpsb2FkIDEyCmNvbmNhdApsb2cKaW50Y18xIC8vIDEKcmV0dXJuCm1haW5fbDE1Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCnN0b3JlIDYKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgpzdG9yZSA3CnR4bmEgQXBwbGljYXRpb25BcmdzIDMKc3RvcmUgOApsb2FkIDYKbG9hZCA3CmxvYWQgOApjYWxsc3ViIGVkMjU1MTl2ZXJpZnliYXJlXzUKc3RvcmUgOQpieXRlY18wIC8vIDB4MTUxZjdjNzUKcHVzaGJ5dGVzIDB4MDAgLy8gMHgwMAppbnRjXzAgLy8gMApsb2FkIDkKc2V0Yml0CmNvbmNhdApsb2cKaW50Y18xIC8vIDEKcmV0dXJuCm1haW5fbDE2Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCmJ0b2kKY2FsbHN1YiBibG9ja180CnN0b3JlIDIKYnl0ZWNfMCAvLyAweDE1MWY3Yzc1CmxvYWQgMgpjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2wxNzoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQpjYWxsc3ViIGI2NGRlY29kZV8zCnN0b3JlIDAKYnl0ZWNfMCAvLyAweDE1MWY3Yzc1CmxvYWQgMApjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2wxODoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQpibnogbWFpbl9sMjIKdHhuIE9uQ29tcGxldGlvbgpwdXNoaW50IDUgLy8gRGVsZXRlQXBwbGljYXRpb24KPT0KYm56IG1haW5fbDIxCmVycgptYWluX2wyMToKdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KYXNzZXJ0CmNhbGxzdWIgZGVsZXRlXzIKaW50Y18xIC8vIDEKcmV0dXJuCm1haW5fbDIyOgp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAo9PQphc3NlcnQKY2FsbHN1YiBjcmVhdGVfMAppbnRjXzEgLy8gMQpyZXR1cm4KCi8vIGNyZWF0ZQpjcmVhdGVfMDoKaW50Y18xIC8vIDEKcmV0dXJuCgovLyBhdXRoX29ubHkKYXV0aG9ubHlfMToKZ2xvYmFsIENyZWF0b3JBZGRyZXNzCj09CnJldHN1YgoKLy8gZGVsZXRlCmRlbGV0ZV8yOgp0eG4gU2VuZGVyCmNhbGxzdWIgYXV0aG9ubHlfMQovLyB1bmF1dGhvcml6ZWQKYXNzZXJ0CmludGNfMSAvLyAxCnJldHVybgoKLy8gYjY0ZGVjb2RlCmI2NGRlY29kZV8zOgpleHRyYWN0IDIgMApiYXNlNjRfZGVjb2RlIFN0ZEVuY29kaW5nCnN0b3JlIDEKbG9hZCAxCmxlbgppdG9iCmV4dHJhY3QgNiAwCmxvYWQgMQpjb25jYXQKc3RvcmUgMQpsb2FkIDEKcmV0c3ViCgovLyBibG9jawpibG9ja180OgpzdG9yZSAzCmxvYWQgMwpibG9jayBCbGtUaW1lc3RhbXAKc3RvcmUgNApsb2FkIDMKYmxvY2sgQmxrU2VlZApzdG9yZSA1CnB1c2hpbnQgMzIgLy8gMzIKbG9hZCA1Cmxlbgo9PQphc3NlcnQKbG9hZCA0Cml0b2IKbG9hZCA1CmNvbmNhdApyZXRzdWIKCi8vIGVkMjU1MTl2ZXJpZnlfYmFyZQplZDI1NTE5dmVyaWZ5YmFyZV81OgpzdG9yZSAxMQpzdG9yZSAxMApleHRyYWN0IDIgMApsb2FkIDExCmxvYWQgMTAKZWQyNTUxOXZlcmlmeV9iYXJlCiEKIQpyZXRzdWIKCi8vIGpzb25fcmVmCmpzb25yZWZfNjoKc3RvcmUgMTMKbG9hZCAxMwpleHRyYWN0IDIgMApwdXNoYnl0ZXMgMHg3Mzc0NzI2OTZlNjc1ZjZiNjU3OSAvLyAic3RyaW5nX2tleSIKanNvbl9yZWYgSlNPTlN0cmluZwpzdG9yZSAxNApsb2FkIDE0CmxlbgppdG9iCmV4dHJhY3QgNiAwCmxvYWQgMTQKY29uY2F0CnN0b3JlIDE0CmxvYWQgMTMKZXh0cmFjdCAyIDAKcHVzaGJ5dGVzIDB4NzU2OTZlNzQ1ZjZiNjU3OSAvLyAidWludF9rZXkiCmpzb25fcmVmIEpTT05VaW50NjQKc3RvcmUgMTUKbG9hZCAxMwpleHRyYWN0IDIgMApwdXNoYnl0ZXMgMHg2ZjYyNmE1ZjZiNjU3OSAvLyAib2JqX2tleSIKanNvbl9yZWYgSlNPTk9iamVjdApzdG9yZSAxNgpsb2FkIDE2CmxlbgppdG9iCmV4dHJhY3QgNiAwCmxvYWQgMTYKY29uY2F0CnN0b3JlIDE2CmxvYWQgMTQKc3RvcmUgMjAKbG9hZCAyMApzdG9yZSAxOQpwdXNoaW50IDEyIC8vIDEyCnN0b3JlIDE3CmxvYWQgMTcKbG9hZCAyMApsZW4KKwpzdG9yZSAxOApsb2FkIDE4CnB1c2hpbnQgNjU1MzYgLy8gNjU1MzYKPAphc3NlcnQKbG9hZCAxNwppdG9iCmV4dHJhY3QgNiAwCmxvYWQgMTUKaXRvYgpjb25jYXQKbG9hZCAxNgpzdG9yZSAyMApsb2FkIDE5CmxvYWQgMjAKY29uY2F0CnN0b3JlIDE5CmxvYWQgMTgKc3RvcmUgMTcKbG9hZCAxNwppdG9iCmV4dHJhY3QgNiAwCmNvbmNhdApsb2FkIDE5CmNvbmNhdApyZXRzdWIKCi8vIG5vb3AKbm9vcF83OgppbnRjXzEgLy8gMQpyZXR1cm4KCi8vIHJlcGxhY2UKcmVwbGFjZV84OgpzdG9yZSAyNgpzdG9yZSAyNQpleHRyYWN0IDIgMApsb2FkIDI1CmxvYWQgMjYKZXh0cmFjdCAyIDAKcmVwbGFjZTMKc3RvcmUgMjcKbG9hZCAyNwpsZW4KaXRvYgpleHRyYWN0IDYgMApsb2FkIDI3CmNvbmNhdApzdG9yZSAyNwpsb2FkIDI3CnJldHN1YgoKLy8gc2hhM18yNTYKc2hhMzI1Nl85OgpleHRyYWN0IDIgMApzaGEzXzI1NgpzdG9yZSAyOQpsb2FkIDI5CmxlbgppdG9iCmV4dHJhY3QgNiAwCmxvYWQgMjkKY29uY2F0CnN0b3JlIDI5CmxvYWQgMjkKcmV0c3ViCgovLyB2cmZfdmVyaWZ5CnZyZnZlcmlmeV8xMDoKc3RvcmUgMzUKc3RvcmUgMzQKZXh0cmFjdCAyIDAKbG9hZCAzNApsb2FkIDM1CnZyZl92ZXJpZnkgVnJmQWxnb3JhbmQKc3RvcmUgMzgKc3RvcmUgMzcKbG9hZCAzOAppbnRjXzEgLy8gMQo9PQphc3NlcnQKbG9hZCAzNwpzdG9yZSAzNgpwdXNoaW50IDY0IC8vIDY0CmxvYWQgMzYKbGVuCj09CmFzc2VydApsb2FkIDM2CnJldHN1Yg==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKcHVzaGludCAwIC8vIDAKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "b64decode", desc: "", args: [{ type: "string", name: "b64encoded", desc: "" }], returns: { type: "string", desc: "" } }),
        new algosdk.ABIMethod({ name: "block", desc: "", args: [{ type: "uint64", name: "round", desc: "" }], returns: { type: "(uint64,byte[32])", desc: "" } }),
        new algosdk.ABIMethod({ name: "ed25519verify_bare", desc: "", args: [{ type: "string", name: "msg", desc: "" }, { type: "address", name: "pubkey", desc: "" }, { type: "byte[64]", name: "sig", desc: "" }], returns: { type: "bool", desc: "" } }),
        new algosdk.ABIMethod({ name: "json_ref", desc: "", args: [{ type: "string", name: "json_str", desc: "" }], returns: { type: "(string,uint64,string)", desc: "" } }),
        new algosdk.ABIMethod({ name: "noop", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "replace", desc: "", args: [{ type: "string", name: "orig", desc: "" }, { type: "uint64", name: "start", desc: "" }, { type: "string", name: "replace_with", desc: "" }], returns: { type: "string", desc: "" } }),
        new algosdk.ABIMethod({ name: "sha3_256", desc: "", args: [{ type: "string", name: "to_hash", desc: "" }], returns: { type: "byte[]", desc: "" } }),
        new algosdk.ABIMethod({ name: "vrf_verify", desc: "", args: [{ type: "byte[]", name: "msg", desc: "" }, { type: "byte[80]", name: "proof", desc: "" }, { type: "address", name: "pub_key", desc: "" }], returns: { type: "byte[64]", desc: "" } })
    ];
    async b64decode(args: {
        b64encoded: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<string>> {
        const result = await this.execute(await this.compose.b64decode({ b64encoded: args.b64encoded }, txnParams));
        return new bkr.ABIResult<string>(result, result.returnValue as string);
    }
    async block(args: {
        round: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<BlockDetails>> {
        const result = await this.execute(await this.compose.block({ round: args.round }, txnParams));
        return new bkr.ABIResult<BlockDetails>(result, BlockDetails.decodeResult(result.returnValue));
    }
    async ed25519verify_bare(args: {
        msg: string;
        pubkey: string;
        sig: Uint8Array;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<boolean>> {
        const result = await this.execute(await this.compose.ed25519verify_bare({ msg: args.msg, pubkey: args.pubkey, sig: args.sig }, txnParams));
        return new bkr.ABIResult<boolean>(result, result.returnValue as boolean);
    }
    async json_ref(args: {
        json_str: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<JsonExampleResult>> {
        const result = await this.execute(await this.compose.json_ref({ json_str: args.json_str }, txnParams));
        return new bkr.ABIResult<JsonExampleResult>(result, JsonExampleResult.decodeResult(result.returnValue));
    }
    async noop(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.noop(txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async replace(args: {
        orig: string;
        start: bigint;
        replace_with: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<string>> {
        const result = await this.execute(await this.compose.replace({ orig: args.orig, start: args.start, replace_with: args.replace_with }, txnParams));
        return new bkr.ABIResult<string>(result, result.returnValue as string);
    }
    async sha3_256(args: {
        to_hash: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<Uint8Array>> {
        const result = await this.execute(await this.compose.sha3_256({ to_hash: args.to_hash }, txnParams));
        return new bkr.ABIResult<Uint8Array>(result, result.returnValue as Uint8Array);
    }
    async vrf_verify(args: {
        msg: Uint8Array;
        proof: Uint8Array;
        pub_key: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<Uint8Array>> {
        const result = await this.execute(await this.compose.vrf_verify({ msg: args.msg, proof: args.proof, pub_key: args.pub_key }, txnParams));
        return new bkr.ABIResult<Uint8Array>(result, result.returnValue as Uint8Array);
    }
    compose = {
        b64decode: async (args: {
            b64encoded: string;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "b64decode"), { b64encoded: args.b64encoded }, txnParams, atc);
        },
        block: async (args: {
            round: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "block"), { round: args.round }, txnParams, atc);
        },
        ed25519verify_bare: async (args: {
            msg: string;
            pubkey: string;
            sig: Uint8Array;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "ed25519verify_bare"), { msg: args.msg, pubkey: args.pubkey, sig: args.sig }, txnParams, atc);
        },
        json_ref: async (args: {
            json_str: string;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "json_ref"), { json_str: args.json_str }, txnParams, atc);
        },
        noop: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "noop"), {}, txnParams, atc);
        },
        replace: async (args: {
            orig: string;
            start: bigint;
            replace_with: string;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "replace"), { orig: args.orig, start: args.start, replace_with: args.replace_with }, txnParams, atc);
        },
        sha3_256: async (args: {
            to_hash: string;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "sha3_256"), { to_hash: args.to_hash }, txnParams, atc);
        },
        vrf_verify: async (args: {
            msg: Uint8Array;
            proof: Uint8Array;
            pub_key: string;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "vrf_verify"), { msg: args.msg, proof: args.proof, pub_key: args.pub_key }, txnParams, atc);
        }
    };
}
