import algosdk from 'algosdk';
import { Network, APIProvider, AlgodConfig } from './config';

type NetworkConfig = Record<Network, AlgodConfig | undefined>;

export const AlgodAPIs: Record<APIProvider, NetworkConfig> = {
  [APIProvider.Sandbox]: {
    [Network.SandNet]: {
      host: 'http://localhost',
      port: '4001',
      token: 'a'.repeat(64),
    },
    [Network.BetaNet]: undefined,
    [Network.MainNet]: undefined,
    [Network.TestNet]: undefined,
  },
  [APIProvider.AlgoNode]: {
    [Network.SandNet]: undefined,
    [Network.BetaNet]: {
      host: 'https://betanet-api.algonode.cloud',
      port: '',
    },
    [Network.MainNet]: {
      host: 'https://mainnet-api.algonode.cloud',
      port: '',
    },
    [Network.TestNet]: {
      host: 'https://testnet-api.algonode.cloud',
      port: '',
    },
  },
  [APIProvider.AlgoExplorer]: {
    [Network.SandNet]: undefined,
    [Network.BetaNet]: {
      host: 'https://node.betanet.algoexplorerapi.io/',
      port: '',
    },
    [Network.TestNet]: {
      host: 'https://node.testnet.algoexplorerapi.io/',
      port: '',
    },
    [Network.MainNet]: {
      host: 'https://node.algoexplorerapi.io/',
      port: '',
    },
  },
  [APIProvider.PureStake]: {
    [Network.SandNet]: undefined,
    [Network.BetaNet]: {
      host: 'https://betanet-algorand.api.purestake.io/ps1',
      port: '',
      tokenHeader: 'X-API-Key',
    },
    [Network.TestNet]: {
      host: 'https://testnet-algorand.api.purestake.io/ps1',
      port: '',
      tokenHeader: 'X-API-Key',
    },
    [Network.MainNet]: {
      host: 'https://mainnet-algorand.api.purestake.io/ps1',
      port: '',
      tokenHeader: 'X-API-Key',
    },
  },
};

export function getAlgodClient(
  provider: APIProvider,
  network: Network,
  token?: string,
): algosdk.Algodv2 {
  if (!(provider in AlgodAPIs))
    throw new Error(`Unrecognized provider: ${provider}`);
  const providerConf = AlgodAPIs[provider];

  if (!(network in providerConf))
    throw new Error(`Unrecognized network: ${network}`);
  const algodConf = providerConf[network];

  if (algodConf === undefined)
    throw new Error(
      `No config for the combination of  ${provider} and ${network}`,
    );

  let apiToken = token ? token : algodConf.token ? algodConf.token : '';

  // If we have a header specified for the token, use it
  if (algodConf.tokenHeader !== undefined) {
    return new algosdk.Algodv2(
      { [algodConf.tokenHeader]: apiToken },
      algodConf.host,
      algodConf.port,
    );
  }

  return new algosdk.Algodv2(apiToken, algodConf.host, algodConf.port);
}

export function sandboxAlgod(): algosdk.Algodv2 {
  return getAlgodClient(APIProvider.Sandbox, Network.SandNet);
}
