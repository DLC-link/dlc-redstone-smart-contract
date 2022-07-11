// once you started the script run the create-dlc script which will emit a print event

import { connectWebSocketClient } from "@stacks/blockchain-api-client";
import fetch from "node-fetch";
import { deserializeCV, cvToValue } from "@stacks/transactions";
import { contractAddress, contractName } from "./common";

const URLAPI = "https://stacks-node-api.testnet.stacks.co/extended/v1/tx/";

let tx: any = null;

function setTx(_tx: any) {
  tx = _tx;
}
async function main() {
  const client = await connectWebSocketClient(
    "wss://stacks-node-api.testnet.stacks.co/"
  );

  const sub = await client.subscribeAddressTransactions(
    contractAddress + "." + contractName,
    function (transactionInfo) {
      if (transactionInfo.tx_status == "success") {
        const tx = fetchTxAndExtractPrintEvent(transactionInfo.tx_id);
      } else {
        console.log("Failed transaction....");
      }
    }
  );
}

//wait sub.unsubscribe();

function fetchTxAndExtractPrintEvent(txId: string) {
  fetch(URLAPI + txId)
    .then((response) => response.json())
    .then((json) => setTx(json))
    .catch((error) => console.error(error))
    .finally(() => {
      // extracting print event (it can have multiple print events,
      //but since we know we only have 1 currently we can safely access it at 0 index)
      const event = tx.events[0].contract_log.value.hex;
      const tuple = deserializeCV(event);
      console.log(cvToValue(tuple));
    });
}

main();
