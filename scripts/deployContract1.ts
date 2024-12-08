import { ethers } from "hardhat";

async function main() {
    const NFTContract1 = await ethers.getContractFactory("NFTContract1");
    const nft1 = await NFTContract1.deploy(); // Deploys the contract (returns a Promise<Contract>)

    // Wait for the contract to be deployed
    await nft1.waitForDeployment();

    // Get the deployed contract address
    const contractAddress = await nft1.getAddress();
    console.log("NFTContract1 deployed at:", contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
