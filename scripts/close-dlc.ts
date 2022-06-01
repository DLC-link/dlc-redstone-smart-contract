import { network, senderAddress, senderKey, contractAddress, contractName, UUID, assetName } from './common'
import redstone from 'redstone-api-extended';
import { makeContractCall, broadcastTransaction, bufferCV, trueCV, uintCV, listCV, bufferCVFromString,tupleCV, makeContractNonFungiblePostCondition, createAssetInfo, NonFungibleConditionCode } from "@stacks/transactions";
import { Buffer } from '@stacks/common';
import { liteSignatureToBufferCV, liteSignatureToStacksSignature, pricePackageToCV } from "../src/stacks-redstone";

const functionName = "close-dlc";

const postConditionCode = NonFungibleConditionCode.DoesNotOwn;
const tokenAssetName = bufferCVFromString(UUID);
const nonFungibleAssetInfo = createAssetInfo(contractAddress, contractName, assetName);

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

async function main() {
  const dataPackage = await redstone.oracle.getFromDataFeed("redstone", "ETH");
  console.log(dataPackage);
  
  //these values needs to be passed uppon close to set the close price of the asset in the DLC 
  const liteEvmSignature = dataPackage.liteSignature;
  //const symbol = dataPackage.priceData.symbols[0];
  const symbol = "ETH";
  const price = dataPackage.priceData.values[0];
  const timestamp = dataPackage.priceData.timestamp

  const transaction = await makeContractCall(populateTxOptions(price, timestamp, liteEvmSignature, symbol));
  console.log(transaction);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  console.log("2: ", broadcastResponse);
}

main()
