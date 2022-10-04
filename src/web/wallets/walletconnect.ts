import algosdk, { Transaction } from 'algosdk';
import { SignedTxn, Wallet } from './wallet';

import WalletConnect from '@walletconnect/client';
import WalletConnectQRCodeModal from 'algorand-walletconnect-qrcode-modal';
import { formatJsonRpcRequest } from '@json-rpc-tools/utils';

const logo =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIwSDE3LjUwNDdMMTUuODY5MyAxMy45NkwxMi4zNjI1IDIwSDkuNTYzNzVMMTQuOTc1OCAxMC42NDU2TDE0LjA5OTEgNy4zODE3TDYuNzk4NzQgMjBINEwxMy4yNTYxIDRIMTUuNzE3NkwxNi43Nzk4IDcuOTg3MzhIMTkuMzA4N0wxNy41ODkgMTAuOTgyMUwyMCAyMFoiIGZpbGw9IiMyQjJCMkYiLz4KPC9zdmc+Cg==';

class WC extends Wallet {
  connector: WalletConnect;

  constructor(network: string) {
    super(network);
    const bridge = 'https://bridge.walletconnect.org';
    this.connector = new WalletConnect({
      bridge,
      qrcodeModal: WalletConnectQRCodeModal,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async connect(cb: any): Promise<boolean> {
    // Check if connection is already established
    if (this.connector.connected) return true;

    this.connector.createSession();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.connector.on('connect', (error: Error | null, payload: any) => {
      if (error) {
        throw error;
      }
      const { accounts } = payload.params[0];
      cb(accounts);
      this.accounts = accounts;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.connector.on('session_update', (error: Error | null, payload: any) => {
      if (error) {
        throw error;
      }
      const { accounts } = payload.params[0];
      cb(accounts);
      this.accounts = accounts;
    });

    this.connector.on('disconnect', (error: Error | null) => {
      if (error) throw error;
    });

    return await this.waitForConnected();
  }

  async waitForConnected(): Promise<boolean> {
    return new Promise((resolve) => {
      const reconn = setInterval(() => {
        if (this.connector.connected) {
          clearInterval(reconn);
          resolve(true);
          return;
        }
        this.connector.connect();
      }, 100);
    });
  }

  static override displayName(): string {
    return 'Wallet Connect';
  }

  displayName(): string {
    return WC.displayName();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static override img(_inverted: boolean): string {
    return logo;
  }
  img(inverted: boolean): string {
    return WC.img(inverted);
  }

  override isConnected(): boolean {
    return this.connector.connected;
  }

  override disconnect(): void {
    this.connector.killSession();
  }

  async signTxn(txns: Transaction[]): Promise<SignedTxn[]> {
    const defaultAddress = this.getDefaultAccount();
    const txnsToSign = txns.map((txn) => {
      const encodedTxn = Buffer.from(
        algosdk.encodeUnsignedTransaction(txn),
      ).toString('base64');

      if (algosdk.encodeAddress(txn.from.publicKey) !== defaultAddress)
        return { txn: encodedTxn, signers: [] };
      return { txn: encodedTxn };
    });

    const request = formatJsonRpcRequest('algo_signTxn', [txnsToSign]);

    const result: string[] = await this.connector.sendCustomRequest(request);

    return result.map((element, idx) => {
      const txn = txns[idx];

      if (txn === undefined) return { txID: '', blob: new Uint8Array() };

      return element
        ? {
            txID: txn.txID(),
            blob: new Uint8Array(Buffer.from(element, 'base64')),
          }
        : {
            txID: txn.txID(),
            blob: new Uint8Array(),
          };
    });
  }
}

export default WC;
