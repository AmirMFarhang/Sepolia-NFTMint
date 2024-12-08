import express from 'express';
import Web3 from 'web3';
import NFTContract1JSON from './contracts/NFTContract1.json';
import NFTContract2JSON from './contracts/NFTContract2.json';
import { startEventListener } from './eventListener';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const web3 = new Web3(process.env.RPC_URL_SEPOLIA!);
const account = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY!);
web3.eth.defaultAccount = account.address;

const contract1 = new web3.eth.Contract(
    NFTContract1JSON.abi as any,
    process.env.CONTRACT1_ADDRESS
);
const contract2 = new web3.eth.Contract(
    NFTContract2JSON.abi as any,
    process.env.CONTRACT2_ADDRESS
);

// Endpoint to mint from Contract 1 (backend pays gas)
app.post('/mint-contract1', async (req, res) => {
    try {
        const userAddress: string = req.body.userAddress;

        const tx = contract1.methods.mint();
        const gas = await tx.estimateGas({ from: account.address });
        const txData = tx.encodeABI();

        const signedTx = await web3.eth.accounts.signTransaction({
            to: process.env.CONTRACT1_ADDRESS,
            data: txData,
            gas,
        }, process.env.PRIVATE_KEY!);

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);
        return res.json({ status: 'success', txHash: receipt.transactionHash });
    } catch (err: any) {
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
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

async function estimateContract2Price(quantity: number, names: string[]) {
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
        } else {
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
    startEventListener();
});
