import type algosdk from 'algosdk';

export interface AppSpec {
  hints: HintSpec;
  schema: SchemaSpec;
  source: AppSources;
  contract: algosdk.ABIContract;
}

export type HintSpec = Record<string, Hint>;

export interface SchemaSpec {
  local: Schema;
  global: Schema;
}

export interface AppSources {
  approval: string;
  clear: string;
}

export interface Hint {
  structs: Record<string, Struct>;
  readonly: boolean;
  default_arguments: Record<string, DefaultArgument>;
}

type StructElement = [string, string];
export interface Struct {
  name: string;
  elements: StructElement[];
}

export interface DefaultArgument {
  source: string;
  data: string | bigint | number;
}

export enum AVMType {
  uint64,
  bytes,
}
export interface DeclaredSchemaValueSpec {
  type: AVMType;
  key: string;
  desc: string;
  static: boolean;
}

export interface ReservedSchemaValueSpec {
  type: AVMType;
  desc: string;
  max_keys: number;
}

export interface Schema {
  declared: Record<string, DeclaredSchemaValueSpec>;
  reserved: Record<string, ReservedSchemaValueSpec>;
}

export type StateSchema = {
  uints: number;
  bytes: number;
};

export function getStateSchema(s: Schema): StateSchema {
  let uints = 0;
  let bytes = 0;

  for (const item of Object.entries(s.declared)) {
    if (item[1].type == AVMType.bytes) bytes += 1;
    if (item[1].type == AVMType.uint64) uints += 1;
  }

  for (const item of Object.entries(s.reserved)) {
    if (item[1].type == AVMType.bytes) bytes += item[1].max_keys;
    if (item[1].type == AVMType.uint64) uints += item[1].max_keys;
  }

  return { uints: uints, bytes: bytes };
}
