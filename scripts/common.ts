// @ts-nocheck
import * as secrets from '../secrets';
import { StacksMocknet, StacksTestnet } from "@stacks/network";

const env = secrets.env;
const isProd = env == 'production';

export const network = isProd ? new StacksTestnet() : new StacksMocknet();

export const senderAddress = secrets.publicKey;
export const senderKey = secrets.privateKey;
export const tokenName = 'open-dlc';

export const contractAddress = isProd ? "ST12S2DB1PKRM1BJ1G5BQS0AB0QPKHRVHWXDBJ27R" : "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
export const contractName = "dlc-manager-pricefeed-v1";

// Generally only changing these for the scripts:
export const assetName = 'BTC';
export const strikePrice = 20222;
export const unixTimeStamp = 1657554601;
export const UUID = "uuid03";
