import { getAccounts, getAlgodClient } from "../../src";
import { DemoAVM7 } from "./demoavm7_client";

(async function () {
  const acct = (await getAccounts()).pop();

  if(acct === undefined) return

  const appClient = new DemoAVM7({
    client: getAlgodClient(),
    signer: acct.signer,
    sender: acct.addr,
  });

  const [appId, appAddr, txId] = await appClient.create();
  console.log(`Created app ${appId} with address ${appAddr} in tx ${txId}`);

  const json_ref_result = await appClient.json_ref({
    json_str: JSON.stringify({
      string_key: "In Xanadu did Kubla Khan",
      uint_key: 42,
      obj_key: { lol: "lmao" },
    }),
  });
  console.log(json_ref_result.value);

  const sp = await appClient.client.getTransactionParams().do();
  const block_result = await appClient.block({
    round: BigInt(sp.firstRound - 1),
  });
  console.log(block_result.value);
})();
