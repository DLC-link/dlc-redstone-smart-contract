import {
  network,
  senderAddress,
  senderKey,
  contractAddress,
  contractName,
  UUID,
  assetName,
  unixTimeStamp
} from "./common";

import {
  makeContractCall,
  broadcastTransaction,
  bufferCVFromString,
  uintCV,
} from "@stacks/transactions";

const functionName = "create-dlc";

// Replace this with the options required for your contract.
const txOptions = {
  contractAddress: contractAddress,
  contractName: contractName,
  functionName: functionName,
  functionArgs: [
    bufferCVFromString(UUID),
    bufferCVFromString(assetName), // asset
    uintCV(unixTimeStamp), // closing-time
    uintCV(unixTimeStamp), // emergency-refund-time
  ],
  senderKey: senderKey,
  validateWithAbi: true,
  network,
  fee: 100000,
  anchorMode: 1,
};

async function main() {
  const transaction = await makeContractCall(txOptions);
  console.log(transaction);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  console.log("2: ", broadcastResponse);
}

main();
