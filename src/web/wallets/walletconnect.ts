import algosdk, { Transaction, TransactionParams } from "algosdk";
import { PermissionCallback, SignedTxn, Wallet } from "./wallet";

import WalletConnect from "@walletconnect/client";
import WalletConnectQRCodeModal from "algorand-walletconnect-qrcode-modal";

import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

const logo =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIwSDE3LjUwNDdMMTUuODY5MyAxMy45NkwxMi4zNjI1IDIwSDkuNTYzNzVMMTQuOTc1OCAxMC42NDU2TDE0LjA5OTEgNy4zODE3TDYuNzk4NzQgMjBINEwxMy4yNTYxIDRIMTUuNzE3NkwxNi43Nzk4IDcuOTg3MzhIMTkuMzA4N0wxNy41ODkgMTAuOTgyMUwyMCAyMFoiIGZpbGw9IiMyQjJCMkYiLz4KPC9zdmc+Cg==";

class WC implements Wallet {
  accounts: string[];
  defaultAccount: number;
  network: string;
  connector: WalletConnect;
  permissionCallback?: PermissionCallback;

  constructor(network: string) {
    this.accounts = [];
    this.defaultAccount = 0;
    this.network = network;
    const bridge = "https://bridge.walletconnect.org";
    this.connector = new WalletConnect({
      bridge,
      qrcodeModal: WalletConnectQRCodeModal,
    });
  }

  async connect(cb: any): Promise<boolean> {
    // Check if connection is already established
    if (this.connector.connected) return true;

    this.connector.createSession();

    this.connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }
      const { accounts } = payload.params[0];
      cb(accounts);
      this.accounts = accounts;
    });

    this.connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }
      const { accounts } = payload.params[0];
      cb(accounts);
      this.accounts = accounts;
    });

    this.connector.on("disconnect", (error, payload) => {
      if (error) throw error;
    });

    return await this.waitForConnected()
  }

  async waitForConnected(): Promise<boolean> {
    return new Promise(resolve=>{
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

  static displayName(): string {
    return "Wallet Connect";
  }
  displayName(): string {
    return WC.displayName();
  }

  static img(inverted: boolean): string {
    return logo;
  }
  img(inverted: boolean): string {
    return WC.img(inverted);
  }

  isConnected(): boolean {
    return this.connector.connected;
  }

  disconnect() {
    this.connector.killSession();
  }

  getDefaultAccount(): string {
    if (!this.isConnected()) return "";
    return this.accounts[this.defaultAccount];
  }

  async signTxn(txns: Transaction[]): Promise<SignedTxn[]> {
    const defaultAddress = this.getDefaultAccount();
    const txnsToSign = txns.map((txn) => {
      const encodedTxn = Buffer.from(
        algosdk.encodeUnsignedTransaction(txn)
      ).toString("base64");

      if (algosdk.encodeAddress(txn.from.publicKey) !== defaultAddress)
        return { txn: encodedTxn, signers: [] };
      return { txn: encodedTxn };
    });

    const request = formatJsonRpcRequest("algo_signTxn", [txnsToSign]);

    const result: string[] = await this.connector.sendCustomRequest(request);

    return result.map((element, idx) => {
      return element
        ? {
            txID: txns[idx].txID(),
            blob: new Uint8Array(Buffer.from(element, "base64")),
          }
        : {
            txID: txns[idx].txID(),
            blob: new Uint8Array(),
          };
    });
  }

  async sign(txn: TransactionParams): Promise<SignedTxn> {
    throw new Error("Method not implemented.");
  }

  async signBytes(b: Uint8Array): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }

  async signTeal(teal: Uint8Array): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }
}

export default WC;
