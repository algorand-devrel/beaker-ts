import type { Transaction } from 'algosdk';

export interface SignedTxn {
  txID: string;
  blob: Uint8Array;
}

// Meant for wallets that require a popup (MyAlgo Connect)
//  In most browsers triggering a popup requires the the user
//  to have taken an action (like clicking something)
//  so `request` this should trigger a popup where the click event
//  is passed back into the sign functions
export interface PermissionResult {
  approved(): Promise<SignedTxn[]>;
  declined(): Promise<SignedTxn[]>;
}

export interface PermissionCallback {
  request(pr: PermissionResult): Promise<SignedTxn[]>;
}

export class Wallet {
  accounts: string[];
  defaultAccount: number;
  network: string;
  permissionCallback?: PermissionCallback;

  constructor(network: string) {
    this.accounts = [];
    this.defaultAccount = 0;
    this.network = network;
  }

  static displayName(): string {
    return '';
  }

  static img(inverted: boolean): string {
    return '';
  }

  async connect(settings?: any): Promise<boolean> {
    return new Promise(() => {
      false;
    });
  }

  isConnected(): boolean {
    return this.accounts && this.accounts.length > 0;
  }

  disconnect(): void {
    return;
  }

  getDefaultAccount(): string {
    if (!this.isConnected()) throw new Error('No default account set');

    const defaultAcct = this.accounts[this.defaultAccount];
    if (defaultAcct === undefined) throw new Error('No default account set');
    return defaultAcct;
  }

  signTxns(txns: Transaction[]): Promise<SignedTxn[]> {
    return new Promise(() => {
      [];
    });
  }
}
