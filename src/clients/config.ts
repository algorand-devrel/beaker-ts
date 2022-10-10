export interface AlgodConfig {
  host: string;
  port: string;
  token?: string;
  tokenHeader?: string;
}

export interface IndexerConfig {
  host: string;
  port: string;
  token?: string;
  tokenHeader?: string;
}

export enum APIProvider {
  AlgoNode = 'algonode',
  AlgoExplorer = 'algoexplorer',
  PureStake = 'purestake',
  Sandbox = 'sandbox',
}

export enum Network {
  BetaNet = 'BetaNet',
  TestNet = 'TestNet',
  MainNet = 'MainNet',
  SandNet = 'SandNet',
}
