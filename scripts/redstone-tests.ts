
import redstone from 'redstone-api';
import redstoneExtended from 'redstone-api-extended';
import { network, senderKey, contractAddress, contractName, UUID, assetName, tokenName } from './common'

import { unixTimeStamp } from './common';
import { makeContractCall, broadcastTransaction, bufferCV, uintCV, listCV, bufferCVFromString,tupleCV, makeContractNonFungiblePostCondition, createAssetInfo, NonFungibleConditionCode } from "@stacks/transactions";
import { Buffer } from '@stacks/common';
import { liteSignatureToStacksSignature, shiftPriceValue } from "../src/stacks-redstone";
import { PriceData } from 'redstone-api/lib/types';
import fetch from 'node-fetch';

const functionName = "close-dlc-internal";

const postConditionCode = NonFungibleConditionCode.DoesNotOwn;
const tokenAssetName = bufferCVFromString(UUID);
const nonFungibleAssetInfo = createAssetInfo(contractAddress, contractName, tokenName);

const contractNonFungiblePostCondition = makeContractNonFungiblePostCondition(
  contractAddress,
  contractName,
  postConditionCode,
  nonFungibleAssetInfo,
  tokenAssetName
);

function populateTxOptions(price: number, timestamp: number, signature: string, symbol: string) {
  const liteSig = liteSignatureToStacksSignature(signature);
  const sig = Buffer.from(liteSig);
  const tupCV = tupleCV({
    symbol: bufferCVFromString(symbol),
    value: uintCV(price),
  })

  return {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: [
      bufferCVFromString(UUID),
      uintCV(timestamp),
      listCV([tupCV]),
      bufferCV(sig)
    ],
    postConditions: [contractNonFungiblePostCondition],
    senderKey: senderKey,
    validateWithAbi: true,
    network,
    fee: 100000, //0.1STX
    anchorMode: 1,
  }
}

(async () => {

  interface PriceDataWithSig extends PriceData {
    liteEvmSignature: string;
  }

  // const dataPackageNow = await redstoneExtended.oracle.getFromDataFeed("redstone", assetName);
  // console.log("now: ", dataPackageNow.liteSignature, dataPackageNow.priceData.values[0]);

  // const historicalDataExtended = await redstoneExtended.getHistoricalPrice("BTC", {date: unixTimeStamp * 1000}) as PriceDataWithSig;
  // console.log("@closing ext: ", historicalDataExtended.liteEvmSignature, historicalDataExtended.value);

  // let dataPackage2 = await redstone.query().symbol(assetName).latest().exec() as PriceDataWithSig;
  // console.log("now w query:" , dataPackage2.liteEvmSignature, dataPackage2.value);

  // let dataPackage = await redstone.query().symbol(assetName).atDate(unixTimeStamp * 1000).exec() as PriceDataWithSig;
  // console.log("@closing: ", dataPackage.liteEvmSignature, dataPackage.value);

  let dataPackageNew: any;
  let liteEvmSignature: string;
  const symbol = assetName;
  let price: number;
  let actualClosingTime: number;

  // fetch(`https://api.redstone.finance/packages?provider=redstone&symbol=${assetName}&toTimestamp=${unixTimeStamp*1000}`)
  //   .then(res => res.json())
  //   .then(res => dataPackageNew = res)
  //   .then(() => {
  //     if (!dataPackageNew || !dataPackageNew.liteSignature || dataPackageNew.prices.length === 0) {
  //       console.error(`Invalid RedStone request for ${symbol} @ ${unixTimeStamp*1000}, skipping...`);
  //       return;
  //     }
  //     console.log("response new: ", dataPackageNew);
  //     liteEvmSignature = dataPackageNew.liteSignature;
  //     price = shiftPriceValue(dataPackageNew.prices[0].value);
  //     // price = parseInt((dataPackageNew.prices[0].value * 100000).toString());
  //     actualClosingTime = dataPackageNew.timestamp;
  //   })
  //   .finally(async () => {
  //     // const transaction = await makeContractCall(populateTxOptions(price, actualClosingTime, liteEvmSignature, symbol));
  //     // console.log(transaction);
  //     // const broadcastResponse = await broadcastTransaction(transaction, network);
  //     // console.log("2: ", broadcastResponse);
  //   })

  // console.log(dataPackageNew);

  // const liteEvmSignature = dataPackage["liteEvmSignature"];
  // const liteEvmSignature = dataPackage.liteEvmSignature;
  // const symbol = assetName;
  // const price = dataPackage.value  * 10000000;
  // const actualClosingTime = dataPackage.timestamp;

  // console.log(liteSignatureToStacksSignature(dataPackageNow.liteSignature), liteSignatureToStacksSignature(historicalDataExtended.liteEvmSignature), liteSignatureToStacksSignature( dataPackage2.liteEvmSignature), liteSignatureToStacksSignature(dataPackage.liteEvmSignature))

  // console.log(liteEvmSignature, symbol, price, actualClosingTime)

  // const transaction = await makeContractCall(populateTxOptions(price, actualClosingTime, liteEvmSignature, symbol));
  // console.log(transaction);
  // const broadcastResponse = await broadcastTransaction(transaction, network);
  // console.log("2: ", broadcastResponse);

  const dataPackage = await fetch(`https://api.redstone.finance/packages?provider=redstone&symbol=${symbol}&toTimestamp=${unixTimeStamp*1000}`)
    .then(res => res.json())
    .catch(error => console.error(error));
  
  if (!dataPackage || !dataPackage.liteSignature || dataPackage.prices.length === 0) {
    console.error(`Invalid RedStone request for ${symbol} @ ${unixTimeStamp*1000}, skipping...`);
    return;
  }
  console.log("RedStone historic data package:", dataPackage);


})();

