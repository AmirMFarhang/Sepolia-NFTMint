"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const nftContract1Address = "0xdD4CaB05C6D1F4aC4649D8C7fbdB277802d93BFE"; // Replace after first deployment
    const NFTContract2 = await hardhat_1.ethers.getContractFactory("NFTContract2");
    const nft2 = await NFTContract2.deploy(nftContract1Address); // Deploys the contract (returns a Promise<Contract>)
    // Wait for the contract to be deployed
    await nft2.waitForDeployment();
    // Get the deployed contract address
    const contractAddress = await nft2.getAddress();
    console.log("NFTContract2 deployed at:", contractAddress);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
