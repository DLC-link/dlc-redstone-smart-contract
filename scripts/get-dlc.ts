import { network, contractAddress, contractName, UUID } from './common'
import {
  bufferCVFromString,
  callReadOnlyFunction,
  cvToValue
} from "@stacks/transactions";

const functionName = "get-dlc";

const txOptions = {
  contractAddress: contractAddress,
  contractName: contractName,
  functionName: functionName,
  functionArgs: [
    bufferCVFromString(UUID),
  ],
  senderAddress: contractAddress,
  network,
};

async function main(){
  const transaction: any = await callReadOnlyFunction(txOptions);
  console.log(cvToValue(transaction.value));
}

main();
