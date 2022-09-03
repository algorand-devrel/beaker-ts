import { isUint8Array } from "util/types";
import { getAccounts, getAlgodClient } from "../../";
import { Order, Structer } from "./structer_client";

(async function () {
  const acct = (await getAccounts()).pop();

  if(acct === undefined) return

  const appClient = new Structer({
    client: getAlgodClient(),
    signer: acct.signer,
    sender: acct.addr,
  });

  const [appId, appAddr, txId] = await appClient.create();
  console.log(`Created app ${appId} with address ${appAddr} in tx ${txId}`);

  await appClient.optIn();

  const result = await appClient.place_order({
    order_number: BigInt(1),
    order: { item: "cubes", quantity: BigInt(1) },
  });
  console.log(result.txID);

  const result2 = await appClient.increase_quantity({
    order_number: BigInt(1),
  });
  console.log("Result: ", result2.value);
  console.log("Or: ", Order.decodeResult(result2.returnValue));

  const state = await appClient.getAccountState(acct.addr, true);
  for (const k in state) {
    // appease ts
    const val = state[k];
    if (!isUint8Array(val)) continue;

    console.log(Order.decodeBytes(val));
  }
})();
