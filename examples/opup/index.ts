import algosdk from "algosdk";
import * as bkr from "../../src";
import { ExpensiveApp } from "./expensiveapp_client";

(async function () {
  const acct = (await bkr.sandbox.getAccounts()).pop();

  if(acct === undefined) return

  const appClient = new ExpensiveApp({
    client: bkr.sandbox.getAlgodClient(),
    signer: acct.signer,
    sender: acct.addr,
  });

  const [appId, appAddr, txId] = await appClient.create();
  console.log(`Created app ${appId} with address ${appAddr} in tx ${txId}`);

  const sp = await appClient.getSuggestedParams();
  sp.flatFee = true;
  sp.fee = 1e6;

  await appClient.opup_bootstrap({
    ptxn: algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      suggestedParams: sp,
      to: appAddr,
      amount: BigInt(1e6),
    }),
  });

  const result = await appClient.hash_it({ input: "asdf", iters: BigInt(100) }, {suggestedParams:sp});
  console.log(result.returnValue);
})();
