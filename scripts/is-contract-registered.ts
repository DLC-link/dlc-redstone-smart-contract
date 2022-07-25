import { network, contractAddress, contractName} from './common'
import {
  callReadOnlyFunction,
  contractPrincipalCV,
  cvToValue
} from "@stacks/transactions";

const functionName = "is-contract-registered";
const protocolContractName = "protocol-contract"

const txOptions = {
  contractAddress: contractAddress,
  contractName: contractName,
  functionName: functionName,
  functionArgs: [
    contractPrincipalCV(contractAddress, protocolContractName)
  ],
  senderAddress: contractAddress,
  network,
};

async function main(){
  const transaction: any = await callReadOnlyFunction(txOptions);
  console.log(cvToValue(transaction));
}

main();
