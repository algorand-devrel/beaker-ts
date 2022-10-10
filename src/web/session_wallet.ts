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

// If you just need a placeholder signer
export const PlaceHolderSigner: TransactionSigner = (
  _txnGroup: Transaction[],
  _indexesToSign: number[],
): Promise<Uint8Array[]> => {
  return Promise.resolve([]);
};

// Serialized obj to store in session storage
export interface SessionWalletData {
  walletPreference: WalletName;
  data: WalletData;
}

export class SessionWallet {
  wallet: Wallet;
  data: SessionWalletData;
  network: string;

  constructor(network: string, data: SessionWalletData) {
    this.network = network;
    this.data = data;

    // Get type to initialize
    const wtype = (ImplementedWallets[data.walletPreference] ||=
      InsecureWallet);

    this.wallet = new wtype(network, data.data);
  }

  async connect(): Promise<boolean> {
    if (await this.wallet.connect()) {
      this.save();
      return true;
    }

    // Fail
    this.disconnect();
    return false;
  }

  disconnect(): void {
    if (this.wallet !== undefined) this.wallet.disconnect();
    this.save()
  }

  connected(): boolean {
    return this.wallet !== undefined && this.wallet.isConnected();
  }

  setAcctIdx(idx: number): void {
    this.wallet.defaultAccount = idx
    this.save()
  }

  // Persist the current state to session storage
  save(): void {
    SessionWallet.setWalletData(this.network, {
      walletPreference: this.data.walletPreference,
      data: {
        acctList: this.wallet.accounts,
        defaultAcctIdx: this.wallet.defaultAccount,
      }
    } as SessionWalletData)
  }

  //
  address(): string {
    return this.wallet.getDefaultAddress();
  }

  signer(): TransactionSigner {
    return (txnGroup: Transaction[], indexesToSign: number[]) => {
      return Promise.resolve(this.sign(txnGroup)).then(
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

  async sign(txns: Transaction[]): Promise<SignedTxn[]> {
    if (!this.connected() && !(await this.connect())) return [];
    return this.wallet.sign(txns);
  }

  // Static methods

  static fromSession(network: string): SessionWallet {
    const data = SessionWallet.getWalletData(network);
    return new SessionWallet(network, data);
  }

  static getWalletData(network: string): SessionWalletData {
    const data = sessionStorage.getItem(walletDataKey(network));
    return (
      data === null || data === ''
        ? { data: { acctList: [], defaultAcctIdx: 0 } }
        : JSON.parse(data)
    ) as SessionWalletData;
  }

  static setWalletData(network: string, data: SessionWalletData): void {
    sessionStorage.setItem(walletDataKey(network), JSON.stringify(data));
  }
}
