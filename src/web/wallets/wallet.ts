import {Transaction } from 'algosdk';

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
    approved(): Promise<SignedTxn[]>
    declined(): Promise<SignedTxn[]>
}

export interface PermissionCallback {
    request(PermissionResult): Promise<SignedTxn[]>
}

export interface Wallet {
    accounts: string[];
    defaultAccount: number;
    network: string;
    permissionCallback?: PermissionCallback;

    displayName(): string;

    img(inverted: boolean): string;

    connect(settings?: any): Promise<boolean>;
    isConnected(): boolean;

    disconnect()

    getDefaultAccount(): string;

    signTxn(txns: Transaction[]): Promise<SignedTxn[]>;
    signBytes(b: Uint8Array): Promise<Uint8Array>;
    signTeal(teal: Uint8Array): Promise<Uint8Array>;
}
