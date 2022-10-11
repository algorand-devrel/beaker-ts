import * as bkr from "../../src";
import {HelloBeaker} from "./hellobeaker_client";

(async function () {
  const acct = (await bkr.sandbox.getAccounts()).pop();
  if (acct === undefined) return

  const appClient = new HelloBeaker({
    client: bkr.clients.sandboxAlgod(),
    signer: acct.signer,
    sender: acct.addr,
  });

  const {appId, appAddress, txId} = await appClient.create();
  console.log(`Created app ${appId} with address ${appAddress} in tx ${txId}`);

  const result = await appClient.hello({name: "Beaker"});
  console.log(result.returnValue); // Hello, Beaker
})();
