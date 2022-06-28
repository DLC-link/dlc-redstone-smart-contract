import * as secrets from '../secrets';
import { StacksTestnet } from "@stacks/network";

export const network = new StacksTestnet();

export const senderAddress = secrets.publicKey;
export const senderKey = secrets.privateKey;
export const assetName = 'open-dlc';

export const contractAddress = "ST31H4TTX6TVMEE86TYV6PN6XPQ6J7NCS2DD0XFW0";
export const contractName = "discreet-log-storage-v5-1";

export const unixTimeStamp = 1653308114;

export const UUID = "uuid1";
