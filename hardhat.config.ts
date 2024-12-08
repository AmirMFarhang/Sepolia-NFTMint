import { HardhatUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv';

dotenv.config();

const { PRIVATE_KEY, RPC_URL_SEPOLIA } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: RPC_URL_SEPOLIA || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    }
  }
};

export default config;
