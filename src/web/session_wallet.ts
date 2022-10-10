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

export class SessionWalletManager {

  static setWalletPreference(network: string, pref: WalletName): void {
    const walletData = SessionWalletManager.read(network)
    if(!(pref in ImplementedWallets)) throw new Error(`Unknown wallet preference: ${pref}`)
    SessionWalletManager.write(network, {...walletData, walletPreference: pref})
  }

  static getWallet(network: string, swd: SessionWalletData): Wallet {
    const w = ImplementedWallets[swd.walletPreference]
    if(w === undefined) throw new Error("Unknown wallet preference")
    return new w(network, swd.data)
  }

  static async connect(network: string): Promise<boolean> {
    const swd = SessionWalletManager.read(network)
    const wallet = SessionWalletManager.getWallet(network, swd)

    if (await wallet.connect()) {
      // Persist state in session storage
      SessionWalletManager.write(network, {...swd, data:wallet.serialize()})
      return true;
    }
    // Fail
    wallet.disconnect();
    return false;
  }

  static disconnect(network: string): void {
    const swd = SessionWalletManager.read(network)
    const wallet = SessionWalletManager.getWallet(network, swd)

    if (wallet !== undefined) wallet.disconnect();
    SessionWalletManager.write(network, {...swd, data:wallet.serialize()})
  }

  static connected(network: string): boolean {
    const swd = SessionWalletManager.read(network)
    const wallet = SessionWalletManager.getWallet(network, swd)
    return wallet !== undefined && wallet.isConnected();
  }

  static setAcctIdx(network: string, idx: number): void {
    const swd = SessionWalletManager.read(network)
    const wallet = SessionWalletManager.getWallet(network, swd)

    wallet.setDefaultIdx(idx)
    SessionWalletManager.write(network, {...swd, data:wallet.serialize()})
  }

  //
  static wallet(network: string): Wallet {
    return SessionWalletManager.getWallet(network, SessionWalletManager.read(network))
  }
  static address(network: string): string {
    const swd = SessionWalletManager.read(network)
    const wallet = SessionWalletManager.getWallet(network, swd)
    return wallet.getDefaultAddress();
  }

  static signer(network: string): TransactionSigner {
    const swd = SessionWalletManager.read(network)
    const wallet = SessionWalletManager.getWallet(network, swd)
    return (txnGroup: Transaction[], indexesToSign: number[]) => {
      return Promise.resolve(wallet.sign(txnGroup)).then(
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

  // Static methods
  static read(network: string): SessionWalletData {
    const data = sessionStorage.getItem(walletDataKey(network));
    return (
      data === null || data === ''
        ? { data: { acctList: [], defaultAcctIdx: 0 } }
        : JSON.parse(data)
    ) as SessionWalletData;
  }

  static write(network: string, data: SessionWalletData): void {
    sessionStorage.setItem(walletDataKey(network), JSON.stringify(data));
  }
}
