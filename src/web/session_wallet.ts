import AlgoSignerWallet from './wallets/algosigner';
import InsecureWallet from './wallets/insecure';
import MyAlgoConnectWallet from './wallets/myalgoconnect';
import WC from './wallets/walletconnect';
import type { Wallet, WalletData, SignedTxn } from './wallets/wallet';
import type { Transaction, TransactionSigner } from 'algosdk';
import { KMDWallet } from './wallets/kmd';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const sessionStorage: any;

// lambda to add network to the key so we dont cross streams 
const walletDataKey = (network: string): string => `bkr-${network}-wallet-data`;

// If you implement a new wallet, add it here and to `ImplementedWallets`
export enum WalletName {
  WalletConnect = 'wallet-connect',
  AlgoSigner = 'algo-signer',
  MyAlgoConnect = 'my-algo-connect',
  InsecureWallet = 'insecure-wallet',
  KMDWallet = 'kmd-wallet',
}

export const ImplementedWallets: Record<string, typeof Wallet> = {
  [WalletName.WalletConnect]: WC,
  [WalletName.AlgoSigner]: AlgoSignerWallet,
  [WalletName.MyAlgoConnect]: MyAlgoConnectWallet,
  [WalletName.InsecureWallet]: InsecureWallet,
  [WalletName.KMDWallet]: KMDWallet,
};


// Stuff we return from the hook
interface SessionWalletProps {
  wallet: SessionWallet;
  connected: boolean;
}

// hook for react stuff to return a SessionWallet
export function useSessionWallet(network: string): SessionWalletProps {
  const wallet = SessionWallet.fromSession(network);
  const connected = wallet.connected();
  return { wallet, connected };
}

// Serialized obj to store in session storage
interface SessionWalletData  {
  walletPreference: WalletName
  data: WalletData
}

export class SessionWallet {
  wallet: Wallet;
  data: SessionWalletData;
  network: string;

  constructor(network: string, data: SessionWalletData) {
    this.network = network;
    this.data = data;

    // Get type to initialize
    const wtype = (ImplementedWallets[data.walletPreference] ||= InsecureWallet);
    // Load from session storage into memory
    this.wallet = new wtype(network, SessionWallet.getWalletData(network).data);
  }

  async connect(): Promise<boolean> {
    if (this.wallet === undefined) return false;

    switch (this.data.walletPreference) {

      case 'insecure-wallet':
        if (await this.wallet.connect()) return true;
        break;
      case 'wallet-connect':
        if(await this.wallet.connect((_acctList: string[]) => {  })) return true;
        break;
      default:
        if (await this.wallet.connect())  return true;
        break;
    }

    // Fail
    this.disconnect();
    return false;
  }

  disconnect(): void {
    if (this.wallet !== undefined) this.wallet.disconnect();
    SessionWallet.setWalletData(this.network, {} as SessionWalletData);
  }

  connected(): boolean {
    return this.wallet !== undefined && this.wallet.isConnected();
  }

  // 
  address(): string {
    return this.wallet.getDefaultAddress();
  }

  signer(): TransactionSigner {
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


  async signTxn(txns: Transaction[]): Promise<SignedTxn[]> {
    if (!this.connected() && !(await this.connect())) return [];
    return this.wallet.signTxns(txns);
  }

  // Static methods

  static fromSession(network: string): SessionWallet {
    const data = SessionWallet.getWalletData(network);
    return new SessionWallet(network, data);
  }

  static getWalletData(network: string): SessionWalletData {
    const data = sessionStorage.getItem(walletDataKey(network));
    return (data === null || data === '' ? {data:{acctList: [], defaultAcctIdx: 0}} : JSON.parse(data)) as SessionWalletData;
  }

  static setWalletData(network: string, data: SessionWalletData): void {
    sessionStorage.setItem(walletDataKey(network), JSON.stringify(data));
  }
}
