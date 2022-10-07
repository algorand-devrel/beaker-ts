import algosdk from 'algosdk';
import { Network, APIProvider, IndexerConfig } from './config';

type NetworkConfig = Record<Network, IndexerConfig | undefined>;

export const IndexerAPIs: Record<APIProvider, NetworkConfig> = {
  [APIProvider.Sandbox]: {
    [Network.SandNet]: {
      host: 'http://localhost',
      port: '8980',
      token: 'a'.repeat(64),
    },
    [Network.BetaNet]: undefined,
    [Network.MainNet]: undefined,
    [Network.TestNet]: undefined,
  },
  [APIProvider.AlgoNode]: {
    [Network.SandNet]: undefined,
    [Network.BetaNet]: {
      host: 'https://betanet-idx.algonode.cloud',
      port: '',
    },
    [Network.MainNet]: {
      host: 'https://mainnet-idx.algonode.cloud',
      port: '',
    },
    [Network.TestNet]: {
      host: 'https://testnet-idx.algonode.cloud',
      port: '',
    },
  },
  [APIProvider.AlgoExplorer]: {
    [Network.SandNet]: undefined,
    [Network.BetaNet]: {
      host: 'https://algoindexer.betanet.algoexplorerapi.io/',
      port: '',
    },
    [Network.TestNet]: {
      host: 'https://algoindexer.testnet.algoexplorerapi.io/',
      port: '',
    },
    [Network.MainNet]: {
      host: 'https://algoindexer.algoexplorerapi.io/',
      port: '',
    },
  },
  [APIProvider.PureStake]: {
    [Network.SandNet]: undefined,
    [Network.BetaNet]: {
      host: 'https://betanet-algorand.api.purestake.io/idx2',
      port: '',
      tokenHeader: 'X-API-Key',
    },
    [Network.TestNet]: {
      host: 'https://testnet-algorand.api.purestake.io/idx2',
      port: '',
      tokenHeader: 'X-API-Key',
    },
    [Network.MainNet]: {
      host: 'https://mainnet-algorand.api.purestake.io/idx2',
      port: '',
      tokenHeader: 'X-API-Key',
    },
  },
};

export function getIndexerClient(
  provider: APIProvider,
  network: Network,
  token?: string,
): algosdk.Indexer {
  if (!(provider in IndexerAPIs))
    throw new Error(`Unrecognized provider: ${provider}`);
  const providerConf = IndexerAPIs[provider];

  if (!(network in providerConf))
    throw new Error(`Unrecognized network: ${network}`);
  const indexerConf = providerConf[network];

  if (indexerConf === undefined)
    throw new Error(
      `No config for the combination of  ${provider} and ${network}`,
    );

  let apiToken = token ? token : indexerConf.token ? indexerConf.token : '';

  // If we have a header specified for the token, use it
  if (indexerConf.tokenHeader !== undefined) {
    return new algosdk.Indexer(
      { [indexerConf.tokenHeader]: apiToken },
      indexerConf.host,
      indexerConf.port,
    );
  }

  return new algosdk.Indexer(apiToken, indexerConf.host, indexerConf.port);
}

export function sandboxIndexer(): algosdk.Indexer {
  return getIndexerClient(APIProvider.Sandbox, Network.SandNet);
}
