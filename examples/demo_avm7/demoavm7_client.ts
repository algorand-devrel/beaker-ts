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
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKaW50Y2Jsb2NrIDAgMQpieXRlY2Jsb2NrIDB4MTUxZjdjNzUKdHhuIE51bUFwcEFyZ3MKaW50Y18wIC8vIDAKPT0KYm56IG1haW5fbDE4CnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4MmU5ODU1ZWMgLy8gInJlcGxhY2Uoc3RyaW5nLHVpbnQ2NCxzdHJpbmcpc3RyaW5nIgo9PQpibnogbWFpbl9sMTcKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHhlNjA5NTViOCAvLyAic2hhM18yNTYoc3RyaW5nKWJ5dGVbXSIKPT0KYm56IG1haW5fbDE2CnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4ZTgzYTg3YWIgLy8gIm5vb3AoKXZvaWQiCj09CmJueiBtYWluX2wxNQp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweDM3ZjI5Mzg4IC8vICJibG9jayh1aW50NjQpKHVpbnQ2NCxieXRlWzMyXSkiCj09CmJueiBtYWluX2wxNAp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweDFkZmE3MjRkIC8vICJlZDI1NTE5dmVyaWZ5X2JhcmUoc3RyaW5nLGJ5dGVbNjRdKWJvb2wiCj09CmJueiBtYWluX2wxMwp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweGE1Yjc5NjVkIC8vICJiNjRkZWNvZGUoc3RyaW5nKXN0cmluZyIKPT0KYm56IG1haW5fbDEyCnR4bmEgQXBwbGljYXRpb25BcmdzIDAKcHVzaGJ5dGVzIDB4ZTgwZTI4YmEgLy8gImpzb25fcmVmKHN0cmluZykoc3RyaW5nLHVpbnQ2NCxzdHJpbmcpIgo9PQpibnogbWFpbl9sMTEKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHgyNTNmMzk4MiAvLyAidnJmX3ZlcmlmeShieXRlW10sYnl0ZVs4MF0sYWRkcmVzcylieXRlWzY0XSIKPT0KYm56IG1haW5fbDEwCmVycgptYWluX2wxMDoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQpzdG9yZSAyOAp0eG5hIEFwcGxpY2F0aW9uQXJncyAyCnN0b3JlIDI5CnR4bmEgQXBwbGljYXRpb25BcmdzIDMKc3RvcmUgMzAKbG9hZCAyOApsb2FkIDI5CmxvYWQgMzAKY2FsbHN1YiB2cmZ2ZXJpZnlfMTAKc3RvcmUgMzEKYnl0ZWNfMCAvLyAweDE1MWY3Yzc1CmxvYWQgMzEKY29uY2F0CmxvZwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sMTE6CnR4biBPbkNvbXBsZXRpb24KaW50Y18wIC8vIE5vT3AKPT0KdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KJiYKYXNzZXJ0CnR4bmEgQXBwbGljYXRpb25BcmdzIDEKY2FsbHN1YiBqc29ucmVmXzkKc3RvcmUgMTkKYnl0ZWNfMCAvLyAweDE1MWY3Yzc1CmxvYWQgMTkKY29uY2F0CmxvZwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sMTI6CnR4biBPbkNvbXBsZXRpb24KaW50Y18wIC8vIE5vT3AKPT0KdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KJiYKYXNzZXJ0CnR4bmEgQXBwbGljYXRpb25BcmdzIDEKY2FsbHN1YiBiNjRkZWNvZGVfOApzdG9yZSAxNwpieXRlY18wIC8vIDB4MTUxZjdjNzUKbG9hZCAxNwpjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2wxMzoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQpzdG9yZSAxMwp0eG5hIEFwcGxpY2F0aW9uQXJncyAyCnN0b3JlIDE0CmxvYWQgMTMKbG9hZCAxNApjYWxsc3ViIGVkMjU1MTl2ZXJpZnliYXJlXzcKc3RvcmUgMTUKYnl0ZWNfMCAvLyAweDE1MWY3Yzc1CnB1c2hieXRlcyAweDAwIC8vIDB4MDAKaW50Y18wIC8vIDAKbG9hZCAxNQpzZXRiaXQKY29uY2F0CmxvZwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sMTQ6CnR4biBPbkNvbXBsZXRpb24KaW50Y18wIC8vIE5vT3AKPT0KdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KJiYKYXNzZXJ0CnR4bmEgQXBwbGljYXRpb25BcmdzIDEKYnRvaQpjYWxsc3ViIGJsb2NrXzYKc3RvcmUgOQpieXRlY18wIC8vIDB4MTUxZjdjNzUKbG9hZCA5CmNvbmNhdApsb2cKaW50Y18xIC8vIDEKcmV0dXJuCm1haW5fbDE1Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydApjYWxsc3ViIG5vb3BfNQppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sMTY6CnR4biBPbkNvbXBsZXRpb24KaW50Y18wIC8vIE5vT3AKPT0KdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KJiYKYXNzZXJ0CnR4bmEgQXBwbGljYXRpb25BcmdzIDEKY2FsbHN1YiBzaGEzMjU2XzQKc3RvcmUgNwpieXRlY18wIC8vIDB4MTUxZjdjNzUKbG9hZCA3CmNvbmNhdApsb2cKaW50Y18xIC8vIDEKcmV0dXJuCm1haW5fbDE3Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCnN0b3JlIDAKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgpidG9pCnN0b3JlIDEKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMwpzdG9yZSAyCmxvYWQgMApsb2FkIDEKbG9hZCAyCmNhbGxzdWIgcmVwbGFjZV8zCnN0b3JlIDMKYnl0ZWNfMCAvLyAweDE1MWY3Yzc1CmxvYWQgMwpjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2wxODoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQpibnogbWFpbl9sMjIKdHhuIE9uQ29tcGxldGlvbgpwdXNoaW50IDUgLy8gRGVsZXRlQXBwbGljYXRpb24KPT0KYm56IG1haW5fbDIxCmVycgptYWluX2wyMToKdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KYXNzZXJ0CmNhbGxzdWIgZGVsZXRlXzIKaW50Y18xIC8vIDEKcmV0dXJuCm1haW5fbDIyOgp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAo9PQphc3NlcnQKY2FsbHN1YiBjcmVhdGVfMAppbnRjXzEgLy8gMQpyZXR1cm4KCi8vIGNyZWF0ZQpjcmVhdGVfMDoKaW50Y18xIC8vIDEKcmV0dXJuCgovLyBhdXRoX29ubHkKYXV0aG9ubHlfMToKZ2xvYmFsIENyZWF0b3JBZGRyZXNzCj09CnJldHN1YgoKLy8gZGVsZXRlCmRlbGV0ZV8yOgp0eG4gU2VuZGVyCmNhbGxzdWIgYXV0aG9ubHlfMQovLyB1bmF1dGhvcml6ZWQKYXNzZXJ0CmludGNfMSAvLyAxCnJldHVybgoKLy8gcmVwbGFjZQpyZXBsYWNlXzM6CnN0b3JlIDUKc3RvcmUgNApleHRyYWN0IDIgMApsb2FkIDQKbG9hZCA1CmV4dHJhY3QgMiAwCnJlcGxhY2UzCnN0b3JlIDYKbG9hZCA2CmxlbgppdG9iCmV4dHJhY3QgNiAwCmxvYWQgNgpjb25jYXQKc3RvcmUgNgpsb2FkIDYKcmV0c3ViCgovLyBzaGEzXzI1NgpzaGEzMjU2XzQ6CmV4dHJhY3QgMiAwCnNoYTNfMjU2CnN0b3JlIDgKbG9hZCA4CmxlbgppdG9iCmV4dHJhY3QgNiAwCmxvYWQgOApjb25jYXQKc3RvcmUgOApsb2FkIDgKcmV0c3ViCgovLyBub29wCm5vb3BfNToKaW50Y18xIC8vIDEKcmV0dXJuCgovLyBibG9jawpibG9ja182OgpzdG9yZSAxMApsb2FkIDEwCmJsb2NrIEJsa1RpbWVzdGFtcApzdG9yZSAxMQpsb2FkIDEwCmJsb2NrIEJsa1NlZWQKc3RvcmUgMTIKcHVzaGludCAzMiAvLyAzMgpsb2FkIDEyCmxlbgo9PQphc3NlcnQKbG9hZCAxMQppdG9iCmxvYWQgMTIKY29uY2F0CnJldHN1YgoKLy8gZWQyNTUxOXZlcmlmeV9iYXJlCmVkMjU1MTl2ZXJpZnliYXJlXzc6CnN0b3JlIDE2CmV4dHJhY3QgMiAwCmxvYWQgMTYKdHhuIFNlbmRlcgplZDI1NTE5dmVyaWZ5X2JhcmUKIQohCnJldHN1YgoKLy8gYjY0ZGVjb2RlCmI2NGRlY29kZV84OgpleHRyYWN0IDIgMApiYXNlNjRfZGVjb2RlIFN0ZEVuY29kaW5nCnN0b3JlIDE4CmxvYWQgMTgKbGVuCml0b2IKZXh0cmFjdCA2IDAKbG9hZCAxOApjb25jYXQKc3RvcmUgMTgKbG9hZCAxOApyZXRzdWIKCi8vIGpzb25fcmVmCmpzb25yZWZfOToKc3RvcmUgMjAKbG9hZCAyMApleHRyYWN0IDIgMApwdXNoYnl0ZXMgMHg3Mzc0NzI2OTZlNjc1ZjZiNjU3OSAvLyAic3RyaW5nX2tleSIKanNvbl9yZWYgSlNPTlN0cmluZwpzdG9yZSAyMQpsb2FkIDIxCmxlbgppdG9iCmV4dHJhY3QgNiAwCmxvYWQgMjEKY29uY2F0CnN0b3JlIDIxCmxvYWQgMjAKZXh0cmFjdCAyIDAKcHVzaGJ5dGVzIDB4NzU2OTZlNzQ1ZjZiNjU3OSAvLyAidWludF9rZXkiCmpzb25fcmVmIEpTT05VaW50NjQKc3RvcmUgMjIKbG9hZCAyMApleHRyYWN0IDIgMApwdXNoYnl0ZXMgMHg2ZjYyNmE1ZjZiNjU3OSAvLyAib2JqX2tleSIKanNvbl9yZWYgSlNPTk9iamVjdApzdG9yZSAyMwpsb2FkIDIzCmxlbgppdG9iCmV4dHJhY3QgNiAwCmxvYWQgMjMKY29uY2F0CnN0b3JlIDIzCmxvYWQgMjEKc3RvcmUgMjcKbG9hZCAyNwpzdG9yZSAyNgpwdXNoaW50IDEyIC8vIDEyCnN0b3JlIDI0CmxvYWQgMjQKbG9hZCAyNwpsZW4KKwpzdG9yZSAyNQpsb2FkIDI1CnB1c2hpbnQgNjU1MzYgLy8gNjU1MzYKPAphc3NlcnQKbG9hZCAyNAppdG9iCmV4dHJhY3QgNiAwCmxvYWQgMjIKaXRvYgpjb25jYXQKbG9hZCAyMwpzdG9yZSAyNwpsb2FkIDI2CmxvYWQgMjcKY29uY2F0CnN0b3JlIDI2CmxvYWQgMjUKc3RvcmUgMjQKbG9hZCAyNAppdG9iCmV4dHJhY3QgNiAwCmNvbmNhdApsb2FkIDI2CmNvbmNhdApyZXRzdWIKCi8vIHZyZl92ZXJpZnkKdnJmdmVyaWZ5XzEwOgpzdG9yZSAzMwpzdG9yZSAzMgpleHRyYWN0IDIgMApsb2FkIDMyCmxvYWQgMzMKdnJmX3ZlcmlmeSBWcmZBbGdvcmFuZApzdG9yZSAzNgpzdG9yZSAzNQpsb2FkIDM2CmludGNfMSAvLyAxCj09CmFzc2VydApsb2FkIDM1CnN0b3JlIDM0CnB1c2hpbnQgNjQgLy8gNjQKbG9hZCAzNApsZW4KPT0KYXNzZXJ0CmxvYWQgMzQKcmV0c3Vi";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKcHVzaGludCAwIC8vIDAKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "replace", desc: "", args: [{ type: "string", name: "orig", desc: "" }, { type: "uint64", name: "start", desc: "" }, { type: "string", name: "replace_with", desc: "" }], returns: { type: "string", desc: "" } }),
        new algosdk.ABIMethod({ name: "sha3_256", desc: "", args: [{ type: "string", name: "to_hash", desc: "" }], returns: { type: "byte[]", desc: "" } }),
        new algosdk.ABIMethod({ name: "noop", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "block", desc: "", args: [{ type: "uint64", name: "round", desc: "" }], returns: { type: "(uint64,byte[32])", desc: "" } }),
        new algosdk.ABIMethod({ name: "ed25519verify_bare", desc: "", args: [{ type: "string", name: "msg", desc: "" }, { type: "byte[64]", name: "sig", desc: "" }], returns: { type: "bool", desc: "" } }),
        new algosdk.ABIMethod({ name: "b64decode", desc: "", args: [{ type: "string", name: "b64encoded", desc: "" }], returns: { type: "string", desc: "" } }),
        new algosdk.ABIMethod({ name: "json_ref", desc: "", args: [{ type: "string", name: "json_str", desc: "" }], returns: { type: "(string,uint64,string)", desc: "" } }),
        new algosdk.ABIMethod({ name: "vrf_verify", desc: "", args: [{ type: "byte[]", name: "msg", desc: "" }, { type: "byte[80]", name: "proof", desc: "" }, { type: "address", name: "pub_key", desc: "" }], returns: { type: "byte[64]", desc: "" } })
    ];
    async replace(args: {
        orig: string;
        start: bigint;
        replace_with: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<string>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "replace"), { orig: args.orig, start: args.start, replace_with: args.replace_with }, txnParams);
        return new bkr.ABIResult<string>(result, result.returnValue as string);
    }
    async sha3_256(args: {
        to_hash: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<Uint8Array>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "sha3_256"), { to_hash: args.to_hash }, txnParams);
        return new bkr.ABIResult<Uint8Array>(result, result.returnValue as Uint8Array);
    }
    async noop(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "noop"), {}, txnParams);
        return new bkr.ABIResult<void>(result);
    }
    async block(args: {
        round: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<BlockDetails>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "block"), { round: args.round }, txnParams);
        return new bkr.ABIResult<BlockDetails>(result, BlockDetails.decodeResult(result.returnValue));
    }
    async ed25519verify_bare(args: {
        msg: string;
        sig: Uint8Array;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<boolean>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "ed25519verify_bare"), { msg: args.msg, sig: args.sig }, txnParams);
        return new bkr.ABIResult<boolean>(result, result.returnValue as boolean);
    }
    async b64decode(args: {
        b64encoded: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<string>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "b64decode"), { b64encoded: args.b64encoded }, txnParams);
        return new bkr.ABIResult<string>(result, result.returnValue as string);
    }
    async json_ref(args: {
        json_str: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<JsonExampleResult>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "json_ref"), { json_str: args.json_str }, txnParams);
        return new bkr.ABIResult<JsonExampleResult>(result, JsonExampleResult.decodeResult(result.returnValue));
    }
    async vrf_verify(args: {
        msg: Uint8Array;
        proof: Uint8Array;
        pub_key: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<Uint8Array>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "vrf_verify"), { msg: args.msg, proof: args.proof, pub_key: args.pub_key }, txnParams);
        return new bkr.ABIResult<Uint8Array>(result, result.returnValue as Uint8Array);
    }
}
