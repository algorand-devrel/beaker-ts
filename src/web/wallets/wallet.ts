import type { Transaction } from 'algosdk';

export interface SignedTxn {
  txID: string;
  blob: Uint8Array;
}

export interface WalletData {
  acctList: string[];
  defaultAcctIdx: number;
  extra: Record<string, any>;
}

export class Wallet {

  // List of account addresses
  accounts: string[];
  // Default account index
  defaultAccountIdx: number;
  // Which network we're connected to
  network: string;

  constructor(network: string, data: WalletData) {
    this.accounts = data ? data.acctList : [];
    this.defaultAccountIdx = data ? data.defaultAcctIdx : 0;
    this.network = network;
  }

  isConnected(): boolean {
    return this.accounts && this.accounts.length > 0;
  }

  setDefaultIdx(idx: number): void {
    this.defaultAccountIdx = idx
  }

  getDefaultAddress(): string {
    if (!this.isConnected()) throw new Error('Not connected');

    const defaultAcct = this.accounts[this.defaultAccountIdx];
    if (defaultAcct === undefined) throw new Error('No default account set');
    return defaultAcct;
  }

  // Implement in the child class
  static displayName(): string {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static img(_inverted: boolean): string {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  async connect(_settings?: any): Promise<boolean> {
    throw new Error('Not implemented');
  }

  disconnect(): void {
    this.accounts = []
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sign(_txns: Transaction[]): Promise<SignedTxn[]> {
    throw new Error('Not implemented');
  }

  serialize(): WalletData {
    return {
        acctList: this.accounts,
        defaultAcctIdx: this.defaultAccountIdx,
    } as WalletData
  }

}
