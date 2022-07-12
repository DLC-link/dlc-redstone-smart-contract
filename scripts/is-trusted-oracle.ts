import {
  network,
  senderKey,
  contractAddress,
  contractName,
} from "./common";
import redstone from "redstone-api";
import {
  bufferCVFromString,
  callReadOnlyFunction,
  bufferCV,
} from "@stacks/transactions";

const functionName = "is-trusted-oracle";

const buffer = Buffer.from(
  "03009dd87eb41d96ce8ad94aa22ea8b0ba4ac20c45e42f71726d6b180f93c3f298",
  "hex"
);

const txOptions = {
  contractAddress: contractAddress,
  contractName: contractName,
  functionName: functionName,
  functionArgs: [bufferCV(buffer)],
  senderAddress: contractAddress,
  network,
};

async function main() {
  const transaction = await callReadOnlyFunction(txOptions);
  console.log(transaction);
}

main();
