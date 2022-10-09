import type { Transaction } from 'algosdk';

export interface SignedTxn {
  txID: string;
  blob: Uint8Array;
}

export interface WalletData {
  acctList: string[];
  defaultAcctIdx: number;
}


export class Wallet {
  accounts: string[];
  defaultAccount: number;
  network: string;

  constructor(network: string, data: WalletData) {
    this.accounts = data? data.acctList : [] ;
    this.defaultAccount = data?data.defaultAcctIdx:0;
    this.network = network;
  }

  static displayName(): string {
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static img(_inverted: boolean): string {
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  async connect(_settings?: any): Promise<boolean> {
    return new Promise(() => { false; });
  }

  isConnected(): boolean {
    return this.accounts && this.accounts.length > 0;
  }

  disconnect(): void {
    return;
  }

  getDefaultAddress(): string {
    if (!this.isConnected()) throw new Error('Not connected');

    const defaultAcct = this.accounts[this.defaultAccount];
    if (defaultAcct === undefined) throw new Error('No default account set');

    return defaultAcct;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signTxns(_txns: Transaction[]): Promise<SignedTxn[]> {
    return new Promise(() => { []; });
  }
}
