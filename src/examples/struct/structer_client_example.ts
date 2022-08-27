import { getAccounts, getAlgodClient } from "../../sandbox/";
import {Order, Structer} from "./structer_client";

(async function () {
  const acct = (await getAccounts()).pop();

  const appClient = new Structer({
    client: getAlgodClient(),
    signer: acct.signer,
    sender: acct.addr,
  });

  const [appId, appAddr, txId] = await appClient.create();
  console.log(`Created app ${appId} with address ${appAddr} in tx ${txId}`);

  await appClient.optIn()

  const result = await appClient.place_order(1, {item: "cubes", quantity: 1} as Order);
  console.log(result.txID); 

  const result2 = await appClient.increase_quantity(1);
  result2.value
  console.log("Result: ", result2.value); 
})();
