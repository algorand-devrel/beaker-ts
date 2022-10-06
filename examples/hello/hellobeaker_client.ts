import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class HelloBeaker extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, dynamic: {} };
    override acctSchema: bkr.Schema = { declared: {}, dynamic: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKaW50Y2Jsb2NrIDAgMQpieXRlY2Jsb2NrIDB4NDg2NTZjNmM2ZjJjMjAKdHhuIE51bUFwcEFyZ3MKaW50Y18wIC8vIDAKPT0KYm56IG1haW5fbDQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHgwMmJlY2UxMSAvLyAiaGVsbG8oc3RyaW5nKXN0cmluZyIKPT0KYm56IG1haW5fbDMKZXJyCm1haW5fbDM6CnR4biBPbkNvbXBsZXRpb24KaW50Y18wIC8vIE5vT3AKPT0KdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KJiYKYXNzZXJ0CnR4bmEgQXBwbGljYXRpb25BcmdzIDEKY2FsbHN1YiBoZWxsb18xCnN0b3JlIDAKcHVzaGJ5dGVzIDB4MTUxZjdjNzUgLy8gMHgxNTFmN2M3NQpsb2FkIDAKY29uY2F0CmxvZwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sNDoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQpibnogbWFpbl9sNgplcnIKbWFpbl9sNjoKdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKPT0KYXNzZXJ0CmNhbGxzdWIgY3JlYXRlXzAKaW50Y18xIC8vIDEKcmV0dXJuCgovLyBjcmVhdGUKY3JlYXRlXzA6CmludGNfMSAvLyAxCnJldHVybgoKLy8gaGVsbG8KaGVsbG9fMToKc3RvcmUgMQpieXRlY18wIC8vICJIZWxsbywgIgpsb2FkIDEKZXh0cmFjdCAyIDAKY29uY2F0CmxlbgppdG9iCmV4dHJhY3QgNiAwCmJ5dGVjXzAgLy8gIkhlbGxvLCAiCmxvYWQgMQpleHRyYWN0IDIgMApjb25jYXQKY29uY2F0CnJldHN1Yg==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKcHVzaGludCAwIC8vIDAKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "hello", desc: "", args: [{ type: "string", name: "name", desc: "" }], returns: { type: "string", desc: "" } })
    ];
    async hello(args: {
        name: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<string>> {
        const result = await this.execute(await this.compose.hello({ name: args.name }, txnParams));
        return new bkr.ABIResult<string>(result, result.returnValue as string);
    }
    compose = {
        hello: async (args: {
            name: string;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "hello"), { name: args.name }, txnParams, atc);
        }
    };
}
