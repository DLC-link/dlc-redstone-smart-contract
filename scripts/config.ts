import dotenv from 'dotenv';
dotenv.config();

import { StacksMainnet, StacksMocknet, StacksTestnet } from "@stacks/network";

const env = process.env.NODE_ENV as 'development' | 'testnet' | 'production';

const development = {
  network: new StacksMocknet(),
  contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  privateKey: '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601',
  mnemonic: 'twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw'
};

const testnet = {
  network: new StacksTestnet(),
  contractAddress: "ST12S2DB1PKRM1BJ1G5BQS0AB0QPKHRVHWXDBJ27R",
  privateKey: process.env.PRIVATE_KEY as string,
  mnemonic: process.env.MNEMONIC as string
}

const production = {
  network: new StacksMainnet(),
  contractAddress: "",
  privateKey: process.env.PRIVATE_KEY as string,
  mnemonic: process.env.MNEMONIC as string
}

const environments = {
  development,
  testnet,
  production
}

export const config = environments[env];
