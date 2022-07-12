import { config } from './config';

export const network = config.network;
export const senderKey = config.privateKey;
export const contractAddress = config.contractAddress;
export const tokenName = 'open-dlc';

// Generally only changing these for the scripts:
export const contractName = "dlc-manager-pricefeed-v1";
export const assetName = 'BTC';
export const strikePrice = 20222;
export const unixTimeStamp = 1657554601;
export const UUID = "uuid03";
