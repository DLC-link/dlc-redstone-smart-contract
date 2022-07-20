import { network, senderKey, contractAddress, contractName, UUID, testCreatorKey } from './common'
import { makeContractCall, broadcastTransaction, bufferCVFromString } from "@stacks/transactions";

const functionName = "close-dlc";

function populateTxOptions() {
  return {
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: [
      bufferCVFromString(UUID)
    ],
    senderKey: testCreatorKey,
    validateWithAbi: true,
    network,
    fee: 100000, //0.1STX
    anchorMode: 1,
  }
}

async function main() {
  const transaction = await makeContractCall(populateTxOptions());
  console.log(transaction);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  console.log("2: ", broadcastResponse);
}

main()
