import algosdk from "algosdk";
import * as bkr from "../../src";
import { ConstantProductAMM } from "./constantproductamm_client";

(async function () {
  const acct = (await bkr.getAccounts()).pop();
  if (acct === undefined) throw new Error("No accounts in sandbox");

  //
  // Instantiate a CP-AMM client
  //
  const appClient = new ConstantProductAMM({
    client: bkr.getAlgodClient(),
    signer: acct.signer,
    sender: acct.addr,
  });

  //
  // Create assets for demo that we'll want to use to create a pool
  //
  const assetA = await createAsset(appClient, "A");
  const assetB = await createAsset(appClient, "B");
  console.log(`created ${assetA}, ${assetB}`);

  //
  // Deploy App on chain
  //
  const [appId, appAddr, txId] = await appClient.create();
  console.log(
    `Created app with ID: ${appId} and address: ${appAddr} in tx ${txId}`
  );

  //
  // Bootstrap the app with assets we're using
  //
  const bootstrapResult = await appClient.bootstrap({
    seed: algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: appAddr,
      suggestedParams: await appClient.getSuggestedParams(),
      amount: BigInt(1e6),
    }),
    a_asset: assetA,
    b_asset: assetB,
  });
  if (bootstrapResult?.value === undefined)
    throw new Error("Bootstrap failed?");

  const poolToken = bootstrapResult.value;

  //
  // Opt user into new pool token
  //
  const optInToAsset =
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: acct.addr,
      suggestedParams: await appClient.getSuggestedParams(),
      amount: 0,
      assetIndex: Number(poolToken),
    });
  appClient.client
    .sendRawTransaction(optInToAsset.signTxn(acct.privateKey))
    .do();
  await algosdk.waitForConfirmation(appClient.client, optInToAsset.txID(), 4);

  //
  // Fund the pool with initial liquidity
  //
  let result = await appClient.mint({
    a_xfer: algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: appAddr,
      suggestedParams: await appClient.getSuggestedParams(),
      amount: BigInt(1e8),
      assetIndex: Number(assetA),
    }),
    b_xfer: algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: appAddr,
      suggestedParams: await appClient.getSuggestedParams(),
      amount: BigInt(1e6),
      assetIndex: Number(assetB),
    }),
  });
  console.log(`Received ${result.inners[0]?.txn.amount} pool tokens`);

  //
  // Try to swap A for B
  //
  result = await appClient.swap({
    swap_xfer: algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: appAddr,
      suggestedParams: await appClient.getSuggestedParams(),
      amount: BigInt(1e3),
      assetIndex: Number(assetA),
    }),
  });
  console.log(`Received ${result.inners[0]?.txn.amount} B tokens`);

  //
  // Try to swap B for A
  //
  result = await appClient.swap({
    swap_xfer: algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: appAddr,
      suggestedParams: await appClient.getSuggestedParams(),
      amount: BigInt(1e3),
      assetIndex: Number(assetB),
    }),
  });
  console.log(`Received ${result.inners[0]?.txn.amount} A tokens`);

  //
  // Burn some pool tokens
  //
  result = await appClient.burn({
    pool_xfer: algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: appAddr,
      suggestedParams: await appClient.getSuggestedParams(),
      amount: BigInt(10),
      assetIndex: Number(poolToken),
    }),
  });
  console.log(
    `Received ${result.inners[0]?.txn.amount} A tokens and ${result.inners[1]?.txn.amount} B tokens`
  );
})();

async function createAsset(
  client: bkr.ApplicationClient,
  unitName: string
): Promise<bigint> {
  const create = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: client.sender,
    suggestedParams: await client.getSuggestedParams(),
    total: BigInt(1e10),
    decimals: 0,
    defaultFrozen: false,
    assetName: `Asset ${unitName}`,
    unitName: unitName,
  });
  await client.client
    .sendRawTransaction(await client.signer([create], [0]))
    .do();
  const result = await algosdk.waitForConfirmation(
    client.client,
    create.txID(),
    4
  );

  return BigInt(result["asset-index"]);
}
