import algosdk from 'algosdk';

export function getAlgodClient(): algosdk.Algodv2 {
  return new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
}

export function getIndexerClient(): algosdk.Indexer {
  return new algosdk.Indexer('a'.repeat(64), 'http://localhost', 8980);
}
