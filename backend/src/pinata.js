"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinJSONToIPFS = pinJSONToIPFS;
const axios_1 = __importDefault(require("axios"));
const pinataJWT = process.env.PINATA_JWT || "";
async function pinJSONToIPFS(jsonBody) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const res = await axios_1.default.post(url, jsonBody, {
        maxBodyLength: Infinity,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': pinataJWT
        }
    });
    return `ipfs://${res.data.IpfsHash}`;
}
