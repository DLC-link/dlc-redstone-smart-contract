// @ts-nocheck
import * as secrets from '../secrets';
import { StacksMocknet, StacksTestnet } from "@stacks/network";

const env = secrets.env;
const isProd = env == 'production';

export const network = isProd ? new StacksTestnet() : new StacksMocknet();

export const senderAddress = secrets.publicKey;
export const senderKey = secrets.privateKey;
export const assetName = 'BTC';
export const tokenName = 'open-dlc';
export const strikePrice = 22000;

export const contractAddress = isProd ? "ST12S2DB1PKRM1BJ1G5BQS0AB0QPKHRVHWXDBJ27R" : "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
export const contractName = "discreet-log-storage-v5";

export const unixTimeStamp = 1656421534;

export const UUID = "uuid71";
