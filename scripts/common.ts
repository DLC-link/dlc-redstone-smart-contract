import * as secrets from '../secrets';
import { StacksMocknet, StacksTestnet } from "@stacks/network";

// const env = 'production';
const env = secrets.env;
// const isProd = env == 'production';
const isProd = true;

export const network = isProd ? new StacksTestnet() : new StacksMocknet();

export const senderAddress = secrets.publicKey;
export const senderKey = secrets.privateKey;
export const assetName = 'BTC';
export const tokenName = 'open-dlc';

export const contractAddress = "ST12S2DB1PKRM1BJ1G5BQS0AB0QPKHRVHWXDBJ27R";
export const contractName = "discreet-log-storage-v5";

export const unixTimeStamp = 1656085064;

export const UUID = "uuid70";
