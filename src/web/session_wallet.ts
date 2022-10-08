import AlgoSignerWallet from './wallets/algosigner';
import MyAlgoConnectWallet from './wallets/myalgoconnect';
import InsecureWallet from './wallets/insecure';
import WC from './wallets/walletconnect';
import type { Wallet, SignedTxn } from './wallets/wallet';
import type { Transaction, TransactionSigner } from 'algosdk';
import { KMDWallet } from './wallets/kmd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const sessionStorage: any;

export const ImplementedWallets: Record<string, typeof Wallet> = {
  'wallet-connect': WC,
  'algo-signer': AlgoSignerWallet,
  'my-algo-connect': MyAlgoConnectWallet,
  'insecure-wallet': InsecureWallet,
  'kmd-wallet': KMDWallet,
};

const walletPreferenceKey = (network: string) : string=> `beaker-${network}-wallet-preference`;
const acctListKey = (network: string) : string=> `beaker-${network}-acct-list`;
const acctPreferenceKey = (network: string) : string=> `beaker-${network}-acct-preference`;
const mnemonicKey = (network: string) : string=> `beaker-${network}-mnemonic`;

// Return session wallet and isConnected
interface WalletProps {
  wallet: SessionWallet,
  isConnected: boolean,
}
export function useWallet(network: string): WalletProps {
  return {wallet: SessionWallet.from_session(network), isConnected: false};
}

export class SessionWallet {
  wallet: Wallet;
  wname: string;
  network: string;

  constructor(network: string, wname: string) {
    this.wname = wname;
    this.network = network;

    const wtype = ImplementedWallets[wname];
    if (wtype === undefined)
      throw new Error(`Unrecognized wallet option: ${wname}`);

    this.wallet = new wtype(network);
    this.wallet.accounts = SessionWallet.getAccountList(this.network);
    this.wallet.defaultAccount = SessionWallet.getAccountIndex(this.network);
    SessionWallet.setWalletPreference(this.network,this.wname);
  }

  static from_session(network: string): SessionWallet {
    const wname = SessionWallet.getWalletPreference(network);
    return new SessionWallet(network, wname)
  }

  async connect(): Promise<boolean> {
    if (this.wallet === undefined) return false;

    switch (this.wname) {
      case 'insecure-wallet':
        const mnemonic = SessionWallet.getMnemonic(this.network);
        if (await this.wallet.connect(mnemonic)) {
          SessionWallet.setMnemonic(this.network, mnemonic);
          SessionWallet.setAccountList(this.network, this.wallet.accounts);
          this.wallet.defaultAccount = SessionWallet.getAccountIndex(this.network);
          return true;
        }

        break;
      case 'wallet-connect':
        await this.wallet.connect((acctList: string[]) => {
          SessionWallet.setAccountList(this.network, acctList);
          this.wallet.defaultAccount = SessionWallet.getAccountIndex(this.network);
        });

        return true;

      default:
        if (await this.wallet.connect()) {
          SessionWallet.setAccountList(this.network, this.wallet.accounts);
          this.wallet.defaultAccount = SessionWallet.getAccountIndex(this.network);
          return true;
        }

        break;
    }

    // Fail
    this.disconnect();
    return false;
  }

  connected(): boolean {
    return this.wallet !== undefined && this.wallet.isConnected();
  }

  getSigner(): TransactionSigner {
    return (txnGroup: Transaction[], indexesToSign: number[]) => {
      return Promise.resolve(this.signTxn(txnGroup)).then(
        (txns: SignedTxn[]) => {
          return txns
            .map((tx) => {
              return tx.blob;
            })
            .filter((_, index) => indexesToSign.includes(index));
        },
      );
    };
  }

  disconnect(): void {
    if (this.wallet !== undefined) this.wallet.disconnect();

    SessionWallet.setWalletPreference(this.network, '');
    SessionWallet.setAccountIndex(this.network, 0);
    SessionWallet.setAccountList(this.network, []);
    SessionWallet.setMnemonic(this.network, '');
  }

  getDefaultAccount(): string {
    if (!this.connected()) return '';
    return this.wallet.getDefaultAccount();
  }

  async signTxn(txns: Transaction[]): Promise<SignedTxn[]> {
    if (!this.connected() && !(await this.connect())) return [];
    return this.wallet.signTxns(txns);
  }

  // Static methods for interacting with session state

  static setAccountList(network: string, accts: string[]): void {
    sessionStorage.setItem(acctListKey(network), JSON.stringify(accts));
  }
  static getAccountList(network: string): string[] {
    const accts = sessionStorage.getItem(acctListKey(network));
    return accts === '' || accts === null ? [] : JSON.parse(accts);
  }

  static setAccountIndex(network: string, idx: number): void {
    sessionStorage.setItem(acctPreferenceKey(network), idx.toString());
  }

  static getAccountIndex(network: string): number {
    const idx = sessionStorage.getItem(acctPreferenceKey(network));
    return idx === null || idx === '' ? 0 : parseInt(idx, 10);
  }

  static setWalletPreference(network: string, wname: string): void {
    sessionStorage.setItem(walletPreferenceKey(network), wname);
  }
  static getWalletPreference(network: string): string {
    const wp = sessionStorage.getItem(walletPreferenceKey(network));
    return wp === null ? '' : wp;
  }

  static setMnemonic(network: string, m: string): void {
    sessionStorage.setItem(mnemonicKey(network), m);
  }
  static getMnemonic(network: string): string {
    const mn = sessionStorage.getItem(mnemonicKey(network));
    return mn === null ? '' : mn;
  }

}
