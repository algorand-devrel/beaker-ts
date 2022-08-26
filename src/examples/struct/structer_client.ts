import algosdk from "algosdk";
import {ApplicationClient, ABIResult} from "../../application_client/";
import {Schema,AVMType} from "../../generate/";
export class Order  {
    item: string = "";
    quantity: number = 0;
};
export class Structer extends ApplicationClient {
    desc: string = "";
    appSchema: Schema = { declared: {}, dynamic: {} };
    acctSchema: Schema = { declared: {}, dynamic: { orders: { type: AVMType.bytes, desc: "", max_keys: 16 } } };
    approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKaW50Y2Jsb2NrIDAgMQpieXRlY2Jsb2NrIDB4MDAgMHgxNTFmN2M3NQp0eG4gTnVtQXBwQXJncwppbnRjXzAgLy8gMAo9PQpibnogbWFpbl9sOAp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweGE0ZThkNzk1IC8vICJwbGFjZV9vcmRlcih1aW50OCwoc3RyaW5nLHVpbnQxNikpdm9pZCIKPT0KYm56IG1haW5fbDcKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMApwdXNoYnl0ZXMgMHhmNGIwNTdkOSAvLyAiaW5jcmVhc2VfcXVhbnRpdHkodWludDgpKHN0cmluZyx1aW50MTYpIgo9PQpibnogbWFpbl9sNgp0eG5hIEFwcGxpY2F0aW9uQXJncyAwCnB1c2hieXRlcyAweDNmY2EzYTQ5IC8vICJyZWFkX2l0ZW0odWludDgpKHN0cmluZyx1aW50MTYpIgo9PQpibnogbWFpbl9sNQplcnIKbWFpbl9sNToKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQppbnRjXzAgLy8gMApnZXRieXRlCmNhbGxzdWIgcmVhZGl0ZW1fNApzdG9yZSA3CmJ5dGVjXzEgLy8gMHgxNTFmN2M3NQpsb2FkIDcKY29uY2F0CmxvZwppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sNjoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQp0eG4gQXBwbGljYXRpb25JRAppbnRjXzAgLy8gMAohPQomJgphc3NlcnQKdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQppbnRjXzAgLy8gMApnZXRieXRlCmNhbGxzdWIgaW5jcmVhc2VxdWFudGl0eV8zCnN0b3JlIDIKYnl0ZWNfMSAvLyAweDE1MWY3Yzc1CmxvYWQgMgpjb25jYXQKbG9nCmludGNfMSAvLyAxCnJldHVybgptYWluX2w3Ogp0eG4gT25Db21wbGV0aW9uCmludGNfMCAvLyBOb09wCj09CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCiE9CiYmCmFzc2VydAp0eG5hIEFwcGxpY2F0aW9uQXJncyAxCmludGNfMCAvLyAwCmdldGJ5dGUKc3RvcmUgMAp0eG5hIEFwcGxpY2F0aW9uQXJncyAyCnN0b3JlIDEKbG9hZCAwCmxvYWQgMQpjYWxsc3ViIHBsYWNlb3JkZXJfMgppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sODoKdHhuIE9uQ29tcGxldGlvbgppbnRjXzAgLy8gTm9PcAo9PQpibnogbWFpbl9sMTIKdHhuIE9uQ29tcGxldGlvbgppbnRjXzEgLy8gT3B0SW4KPT0KYm56IG1haW5fbDExCmVycgptYWluX2wxMToKdHhuIEFwcGxpY2F0aW9uSUQKaW50Y18wIC8vIDAKIT0KYXNzZXJ0CmNhbGxzdWIgb3B0aW5fMQppbnRjXzEgLy8gMQpyZXR1cm4KbWFpbl9sMTI6CnR4biBBcHBsaWNhdGlvbklECmludGNfMCAvLyAwCj09CmFzc2VydApjYWxsc3ViIGNyZWF0ZV8wCmludGNfMSAvLyAxCnJldHVybgoKLy8gY3JlYXRlCmNyZWF0ZV8wOgppbnRjXzEgLy8gMQpyZXR1cm4KCi8vIG9wdF9pbgpvcHRpbl8xOgpyZXRzdWIKCi8vIHBsYWNlX29yZGVyCnBsYWNlb3JkZXJfMjoKc3RvcmUgMTAKc3RvcmUgOQp0eG4gU2VuZGVyCmJ5dGVjXzAgLy8gMHgwMAppbnRjXzAgLy8gMApsb2FkIDkKc2V0Ynl0ZQpsb2FkIDEwCmFwcF9sb2NhbF9wdXQKcmV0c3ViCgovLyBpbmNyZWFzZV9xdWFudGl0eQppbmNyZWFzZXF1YW50aXR5XzM6CnN0b3JlIDMKdHhuIFNlbmRlcgpieXRlY18wIC8vIDB4MDAKaW50Y18wIC8vIDAKbG9hZCAzCnNldGJ5dGUKYXBwX2xvY2FsX2dldApzdG9yZSA0CmxvYWQgNApwdXNoaW50IDIgLy8gMgpleHRyYWN0X3VpbnQxNgpzdG9yZSA1CmxvYWQgNQppbnRjXzEgLy8gMQorCnN0b3JlIDUKbG9hZCA1CnB1c2hpbnQgNjU1MzYgLy8gNjU1MzYKPAphc3NlcnQKbG9hZCA0CmxvYWQgNAppbnRjXzAgLy8gMApleHRyYWN0X3VpbnQxNgpkaWcgMQpsZW4Kc3Vic3RyaW5nMwpzdG9yZSA2CnB1c2hpbnQgNCAvLyA0Cml0b2IKZXh0cmFjdCA2IDAKbG9hZCA1Cml0b2IKZXh0cmFjdCA2IDAKY29uY2F0CmxvYWQgNgpjb25jYXQKc3RvcmUgNAp0eG4gU2VuZGVyCmJ5dGVjXzAgLy8gMHgwMAppbnRjXzAgLy8gMApsb2FkIDMKc2V0Ynl0ZQpsb2FkIDQKYXBwX2xvY2FsX3B1dApsb2FkIDQKcmV0c3ViCgovLyByZWFkX2l0ZW0KcmVhZGl0ZW1fNDoKc3RvcmUgOAp0eG4gU2VuZGVyCmJ5dGVjXzAgLy8gMHgwMAppbnRjXzAgLy8gMApsb2FkIDgKc2V0Ynl0ZQphcHBfbG9jYWxfZ2V0CnJldHN1Yg==";
    clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDcKcHVzaGludCAwIC8vIDAKcmV0dXJu";
    methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "place_order", desc: "", args: [{ type: "uint8", name: "order_number", desc: "" }, { type: "(string,uint16)", name: "order", desc: "" }], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "increase_quantity", desc: "", args: [{ type: "uint8", name: "order_number", desc: "" }], returns: { type: "(string,uint16)", desc: "" } }),
        new algosdk.ABIMethod({ name: "read_item", desc: "", args: [{ type: "uint8", name: "order_number", desc: "" }], returns: { type: "(string,uint16)", desc: "" } })
    ];
    async place_order(order_number: number, order: Order): Promise<ABIResult<void>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "place_order"), { order_number: order_number, order: order });
        return new ABIResult<void>(result, undefined as void);
    }
    async increase_quantity(order_number: number): Promise<ABIResult<Order>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "increase_quantity"), { order_number: order_number });
        return new ABIResult<Order>(result, new Order());
    }
    async read_item(order_number: number): Promise<ABIResult<Order>> {
        const result = await this.call(algosdk.getMethodByName(this.methods, "read_item"), { order_number: order_number });
        return new ABIResult<Order>(result, new Order());
    }
}
