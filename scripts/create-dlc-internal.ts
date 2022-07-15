import {
  network,
  senderKey,
  contractAddress,
  contractName,
  UUID,
  unixTimeStamp,
  assetName
} from "./common";
import {
  makeContractCall,
  broadcastTransaction,
  bufferCVFromString,
  uintCV,
  standardPrincipalCV,
} from "@stacks/transactions";

const functionName = "create-dlc-internal";

const txOptions = {
  contractAddress: contractAddress,
  contractName: contractName,
  functionName: functionName,
  functionArgs: [
    bufferCVFromString(UUID), // uuid
    bufferCVFromString(assetName), // asset
    uintCV(unixTimeStamp), // closing-time
    uintCV(unixTimeStamp), // emergency-refund-time
    standardPrincipalCV("ST12S2DB1PKRM1BJ1G5BQS0AB0QPKHRVHWXDBJ27R"), // creator
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
