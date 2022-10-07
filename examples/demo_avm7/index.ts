import nacl from "tweetnacl";
import * as bkr from "../../src";
import { DemoAVM7 } from "./demoavm7_client";

(async function () {
  const acct = (await bkr.sandbox.getAccounts()).pop();

  if (acct === undefined) return;

  const appClient = new DemoAVM7({
    client: bkr.clients.sandboxAlgod(),
    signer: acct.signer,
    sender: acct.addr,
  });

  const [appId, appAddr, txId] = await appClient.create();
  console.log(`Created app ${appId} with address ${appAddr} in tx ${txId}`);

  // 
  // Use JSON ref opcodes
  // 
  const json_ref_result = await appClient.json_ref({
    json_str: JSON.stringify({
      string_key: "In Xanadu did Kubla Khan",
      uint_key: 42,
      obj_key: { lol: "lmao" },
    }),
  });
  console.log(json_ref_result.value);

  //
  // Get block params
  //
  const sp = await appClient.client.getTransactionParams().do();
  const block_result = await appClient.block({
    round: BigInt(sp.firstRound - 1),
  });
  console.log(block_result.value);

  //
  // ED25519 Verify Bare
  // 
  function bytesigner(sk: Uint8Array, msg: string): Uint8Array {
    const sig = nacl.sign.detached(Buffer.from(msg), sk);
    return new Uint8Array(sig.buffer);
  }

  const message = "Sign me please";
  const sig = bytesigner(new Uint8Array(acct.privateKey), message);

  // Let the client make us a new ATC that we can pass to the next calls to compose methods
  const atc = await appClient.compose.ed25519verify_bare({ msg: message, pubkey: acct.addr, sig: sig })

  // Add noop calls to increase our opcode budget since ed25519 is expensive
  await appClient.compose.noop({note: new Uint8Array(Buffer.from("noncey1"))}, atc);
  await appClient.compose.noop({note: new Uint8Array(Buffer.from("noncey2"))}, atc);

  console.log(atc.buildGroup())

  const result = await appClient.execute(atc)
  console.log(result.returnValue);

})();
