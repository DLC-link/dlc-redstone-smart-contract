import fetch from "node-fetch";
import { apiBase, contractAddress, contractName } from "./common";

const principal = contractAddress;
const asset_identifiers = contractAddress + "." + contractName + "::registered-contract";

const URLAPI = `${apiBase}/extended/v1/tokens/nft/holdings?asset_identifiers=${asset_identifiers}&principal=${principal}`;
let data: any = null;

function setData(dt: any) {
  data = dt;
}

function extractAddress(data: any): string {
  return data.value.repr;
}

function getRegisteredContracts() {
  fetch(URLAPI)
    .then((response) => response.json())
    .then((json) => setData(json))
    .catch((error) => console.error(error))
    .finally(() => {
      data.results.map((res: any) => console.log((extractAddress(res))));
    });
}

getRegisteredContracts();
