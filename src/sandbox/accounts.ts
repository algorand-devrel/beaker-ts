import algosdk from 'algosdk';

const kmd_token = 'a'.repeat(64);
const kmd_host = 'http://localhost';
const kmd_port = '4002';
const kmd_wallet = 'unencrypted-default-wallet';
const kmd_password = '';

export type SandboxAccount = {
  addr: string;
  privateKey: Buffer;
  signer: algosdk.TransactionSigner;
};

export async function getAccounts(): Promise<SandboxAccount[]> {
  const kmdClient = new algosdk.Kmd(kmd_token, kmd_host, kmd_port);

  const wallets = await kmdClient.listWallets();

  let walletId;
  for (const wallet of wallets['wallets']) {
    if (wallet['name'] === kmd_wallet) walletId = wallet['id'];
  }

  if (walletId === undefined) throw Error('No wallet named: ' + kmd_wallet);

  const handleResp = await kmdClient.initWalletHandle(walletId, kmd_password);
  const handle = handleResp['wallet_handle_token'];

  const addresses = await kmdClient.listKeys(handle);
  const acctPromises: Promise<{ private_key: Buffer }>[] = [];
  for (const addr of addresses['addresses']) {
    acctPromises.push(kmdClient.exportKey(handle, kmd_password, addr));
  }
  const keys = await Promise.all(acctPromises);

  // Don't need to wait for it
  kmdClient.releaseWalletHandle(handle);

  return keys.map((k) => {
    const addr = algosdk.encodeAddress(k.private_key.slice(32));
    const acct = { sk: k.private_key, addr: addr } as algosdk.Account;
    const signer = algosdk.makeBasicAccountTransactionSigner(acct);
    return {
      addr: acct.addr,
      privateKey: acct.sk,
      signer: signer,
    } as SandboxAccount;
  });
}
