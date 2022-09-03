import algosdk from "algosdk";
import * as bkr from "../../src/";
export class Order {
    item: string = "";
    quantity: bigint = BigInt(0);
    static codec: algosdk.ABIType = algosdk.ABIType.from("(string,uint16)");
    static fields: string[] = ["item", "quantity"];
    static decodeResult(val: algosdk.ABIValue | undefined): Order {
        return bkr.decodeNamedTuple(val, Order.fields) as Order;
    }
    static decodeBytes(val: Uint8Array): Order {
        return bkr.decodeNamedTuple(Order.codec.decode(val), Order.fields) as Order;
    }
}
export class Structer extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, dynamic: {} };
    override acctSchema: bkr.Schema = { declared: {}, dynamic: { orders: { type: bkr.AVMType.bytes, desc: "", max_keys: 16 } } };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKaW50Y2Jsb2NrIDAgMQpieXRlY2Jsb2NrIDB4MDAgMHgxNTFmN2M3NQp0eG4gTnVtQXBwQXJncwppbnRjXzAgLy8gMAo9PQpibnogbWFpbl9sOAp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweDNmY2EzYTQ5IC8vICJyZWFkX2l0ZW0odWludDgpKHN0cmluZyx1aW50MTYpIgo9PQpibnogbWFpbl9sNwp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweGE0ZThkNzk1IC8vICJwbGFjZV9vcmRlcih1aW50OCwoc3RyaW5nLHVpbnQxNikpdm9pZCIKPT0KYm56IG1haW5fbDYKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHhmNGIwNTdkOSAvLyAiaW5jcmVhc2VfcXVhbnRpdHkodWludDgpKHN0cmluZyx1aW50MTYpIgo9PQpibnogbWFpbl9sNQplcnIKbWFpbl9sNToKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQppbnRjXzAgLy8gMApnZXRieXRlCmNhbGxzdWIgaW5jcmVhc2VxdWFudGl0eV80CnN0b3JlIDQKYnl0ZWNfMSAvLyAweDE1MWY3Yzc1CmxvYWQgNApjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2w2Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCmludGNfMCAvLyAwCmdldGJ5dGUKc3RvcmUgMgp0eG5hIEFwcGxpY2F0aW9uQXJncyAyCnN0b3JlIDMKbG9hZCAyCmxvYWQgMwpjYWxsc3ViIHBsYWNlb3JkZXJfMwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sNzoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQppbnRjXzAgLy8gMApnZXRieXRlCmNhbGxzdWIgcmVhZGl0ZW1fMgpzdG9yZSAwCmJ5dGVjXzEgLy8gMHgxNTFmN2M3NQpsb2FkIDAKY29uY2F0CmxvZwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sODoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQpibnogbWFpbl9sMTIKdHhuIE9uQ29tcGxldGlvbgppbnRjXzEgLy8gT3B0SW4KPT0KYm56IG1haW5fbDExCmVycgptYWluX2wxMToKdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KYXNzZXJ0CmNhbGxzdWIgb3B0aW5fMQppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sMTI6CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCj09CmFzc2VydApjYWxsc3ViIGNyZWF0ZV8wCmludGNfMSAvLyAxCnJldHVybgoKLy8gY3JlYXRlCmNyZWF0ZV8wOgppbnRjXzEgLy8gMQpyZXR1cm4KCi8vIG9wdF9pbgpvcHRpbl8xOgpyZXRzdWIKCi8vIHJlYWRfaXRlbQpyZWFkaXRlbV8yOgpzdG9yZSAxCnR4biBTZW5kZXIKYnl0ZWNfMCAvLyAweDAwCmludGNfMCAvLyAwCmxvYWQgMQpzZXRieXRlCmFwcF9sb2NhbF9nZXQKcmV0c3ViCgovLyBwbGFjZV9vcmRlcgpwbGFjZW9yZGVyXzM6CnN0b3JlIDEwCnN0b3JlIDkKdHhuIFNlbmRlcgpieXRlY18wIC8vIDB4MDAKaW50Y18wIC8vIDAKbG9hZCA5CnNldGJ5dGUKbG9hZCAxMAphcHBfbG9jYWxfcHV0CnJldHN1YgoKLy8gaW5jcmVhc2VfcXVhbnRpdHkKaW5jcmVhc2VxdWFudGl0eV80OgpzdG9yZSA1CnR4biBTZW5kZXIKYnl0ZWNfMCAvLyAweDAwCmludGNfMCAvLyAwCmxvYWQgNQpzZXRieXRlCmFwcF9sb2NhbF9nZXQKc3RvcmUgNgpsb2FkIDYKcHVzaGludCAyIC8vIDIKZXh0cmFjdF91aW50MTYKc3RvcmUgNwpsb2FkIDcKaW50Y18xIC8vIDEKKwpzdG9yZSA3CmxvYWQgNwpwdXNoaW50IDY1NTM2IC8vIDY1NTM2CjwKYXNzZXJ0CmxvYWQgNgpsb2FkIDYKaW50Y18wIC8vIDAKZXh0cmFjdF91aW50MTYKZGlnIDEKbGVuCnN1YnN0cmluZzMKc3RvcmUgOApwdXNoaW50IDQgLy8gNAppdG9iCmV4dHJhY3QgNiAwCmxvYWQgNwppdG9iCmV4dHJhY3QgNiAwCmNvbmNhdApsb2FkIDgKY29uY2F0CnN0b3JlIDYKdHhuIFNlbmRlcgpieXRlY18wIC8vIDB4MDAKaW50Y18wIC8vIDAKbG9hZCA1CnNldGJ5dGUKbG9hZCA2CmFwcF9sb2NhbF9wdXQKbG9hZCA2CnJldHN1Yg==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKcHVzaGludCAwIC8vIDAKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "read_item", desc: "", args: [{ type: "uint8", name: "order_number", desc: "" }], returns: { type: "(string,uint16)", desc: "" } }),
        new algosdk.ABIMethod({ name: "place_order", desc: "", args: [{ type: "uint8", name: "order_number", desc: "" }, { type: "(string,uint16)", name: "order", desc: "" }], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "increase_quantity", desc: "", args: [{ type: "uint8", name: "order_number", desc: "" }], returns: { type: "(string,uint16)", desc: "" } })
    ];
    async read_item(args: {
        order_number: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<Order>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "read_item"), { order_number: args.order_number }, txnParams);
        return new bkr.ABIResult<Order>(result, Order.decodeResult(result.returnValue));
    }
    async place_order(args: {
        order_number: bigint;
        order: Order;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "place_order"), { order_number: args.order_number, order: args.order }, txnParams);
        return new bkr.ABIResult<void>(result);
    }
    async increase_quantity(args: {
        order_number: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<Order>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "increase_quantity"), { order_number: args.order_number }, txnParams);
        return new bkr.ABIResult<Order>(result, Order.decodeResult(result.returnValue));
    }
}
