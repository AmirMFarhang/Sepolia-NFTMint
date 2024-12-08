import Web3 from 'web3';
import NFTContract2JSON from './contracts/NFTContract2.json';
import { pinJSONToIPFS } from './pinata';

const web3 = new Web3(process.env.RPC_URL_SEPOLIA!);
const contract2 = new web3.eth.Contract(
    NFTContract2JSON.abi as any,
    process.env.CONTRACT2_ADDRESS
);

export function startEventListener() {
    contract2.events.TokenNameSet()
        .on('data', async (event: any) => {
            const { tokenId, newName } = event.returnValues;
            console.log(`Name changed for tokenId ${tokenId}: ${newName}`);

            const updatedMetadata = {
                name: newName,
                description: "An NFT from the second collection with a custom name.",
                image: "ipfs://<some_image_hash>",
                attributes: []
            };
            const newURI = await pinJSONToIPFS(updatedMetadata);

            // If needed, call a function to update token URI on-chain (not implemented above)
        })
        .on('error', (error: any) => console.error(error));
}
