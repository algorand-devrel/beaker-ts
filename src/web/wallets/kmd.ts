import algosdk from 'algosdk';
import { WalletData, Wallet, SignedTxn } from './wallet';
import type { KMDConfig } from '../../sandbox/accounts';
import { sandbox } from '../..';

export class KMDWallet extends Wallet {
  pkToSk: Record<string, algosdk.Account>;

  constructor(network: string, data: WalletData) {
    super(network, data);
    this.pkToSk = {};
  }

  override async connect(config: KMDConfig): Promise<boolean> {
    this.accounts = [];
    const accts = await sandbox.getAccounts(config);
    for (const sba of accts) {
      this.pkToSk[sba.addr] = {
        sk: sba.privateKey,
        addr: sba.addr,
      } as algosdk.Account;
      this.accounts.push(sba.addr);
    }
    return true;
  }

  static override displayName(): string {
    return 'KMD Wallet';
  }

  displayName(): string {
    return KMDWallet.displayName();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static override img(_inverted: boolean): string {
    return '';
  }

  img(inverted: boolean): string {
    return KMDWallet.img(inverted);
  }

  override async sign(txns: algosdk.Transaction[]): Promise<SignedTxn[]> {
    const signed = [];
    const defaultAddr = this.getDefaultAddress();
    for (const txidx in txns) {
      const txn = txns[txidx];
      if (txn === undefined) continue;

      const addr = algosdk.encodeAddress(txn.from.publicKey);
      
      const acct = this.pkToSk[addr];

      if (acct !== undefined && addr === defaultAddr) {
        signed.push({ txID: txn.txID(), blob: txn.signTxn(acct.sk) });
      } else {
        signed.push({ txID: '', blob: new Uint8Array() });
      }
    }
    return signed;
  }
}
