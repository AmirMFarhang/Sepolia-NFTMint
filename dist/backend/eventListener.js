"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEventListener = startEventListener;
const web3_1 = __importDefault(require("web3"));
const NFTContract2_json_1 = __importDefault(require("./contracts/NFTContract2.json"));
const pinata_1 = require("./pinata");
const web3 = new web3_1.default(process.env.RPC_URL_SEPOLIA);
const contract2 = new web3.eth.Contract(NFTContract2_json_1.default.abi, process.env.CONTRACT2_ADDRESS);
function startEventListener() {
    contract2.events.TokenNameSet()
        .on('data', async (event) => {
        const { tokenId, newName } = event.returnValues;
        console.log(`Name changed for tokenId ${tokenId}: ${newName}`);
        const updatedMetadata = {
            name: newName,
            description: "An NFT from the second collection with a custom name.",
            image: "ipfs://<some_image_hash>",
            attributes: []
        };
        const newURI = await (0, pinata_1.pinJSONToIPFS)(updatedMetadata);
        // If needed, call a function to update token URI on-chain (not implemented above)
    })
        .on('error', (error) => console.error(error));
}
