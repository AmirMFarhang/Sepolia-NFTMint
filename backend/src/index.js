"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const web3_1 = __importDefault(require("web3"));
const NFTContract1_json_1 = __importDefault(require("./contracts/NFTContract1.json"));
const NFTContract2_json_1 = __importDefault(require("./contracts/NFTContract2.json"));
const eventListener_1 = require("./eventListener");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const web3 = new web3_1.default(process.env.RPC_URL_SEPOLIA);
const account = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
web3.eth.defaultAccount = account.address;
const contract1 = new web3.eth.Contract(NFTContract1_json_1.default.abi, process.env.CONTRACT1_ADDRESS);
const contract2 = new web3.eth.Contract(NFTContract2_json_1.default.abi, process.env.CONTRACT2_ADDRESS);
// Endpoint to mint from Contract 1 (backend pays gas)
app.post('/mint-contract1', async (req, res) => {
    try {
        const userAddress = req.body.userAddress;
        const tx = contract1.methods.mint();
        const gas = await tx.estimateGas({ from: account.address });
        const txData = tx.encodeABI();
        const signedTx = await web3.eth.accounts.signTransaction({
            to: process.env.CONTRACT1_ADDRESS,
            data: txData,
            gas,
        }, process.env.PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return res.json({ status: 'success', txHash: receipt.transactionHash });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// Endpoint to prepare minting from Contract 2
app.post('/mint-contract2', async (req, res) => {
    try {
        const { userAddress, quantity, names } = req.body;
        const tx = contract2.methods.mint(quantity, names);
        const gas = await tx.estimateGas({ from: userAddress });
        const price = await estimateContract2Price(quantity, names);
        return res.json({ to: process.env.CONTRACT2_ADDRESS, data: tx.encodeABI(), value: price, gas });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
async function estimateContract2Price(quantity, names) {
    const EARLY_PRICE = BigInt(50);
    const REGULAR_PRICE = BigInt("600000000000000");
    const NAME_CHANGE_FEE = BigInt("400000000000000");
    const EARLY_BATCH = 15;
    const totalSupply = BigInt(await contract2.methods.totalSupply().call());
    let price = BigInt(0);
    for (let i = 0; i < quantity; i++) {
        const currentId = Number(totalSupply) + 1 + i;
        if (currentId <= EARLY_BATCH) {
            price += EARLY_PRICE;
        }
        else {
            price += REGULAR_PRICE;
        }
        if (names[i] && names[i].length > 0) {
            price += NAME_CHANGE_FEE;
        }
    }
    return price.toString();
}
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    (0, eventListener_1.startEventListener)();
});
