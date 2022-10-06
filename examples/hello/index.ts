import {sandbox} from "../../src";
import {HelloBeaker} from "./hellobeaker_client";

(async function () {
  const acct = (await sandbox.getAccounts()).pop();
  if (acct === undefined) return

  const appClient = new HelloBeaker({
    client: sandbox.getAlgodClient(),
    signer: acct.signer,
    sender: acct.addr,
  });

  const [appId, appAddr, txId] = await appClient.create();
  console.log(`Created app ${appId} with address ${appAddr} in tx ${txId}`);

  const result = await appClient.hello({name: "Beaker"});
  console.log(result.returnValue); // Hello, Beaker
})();
