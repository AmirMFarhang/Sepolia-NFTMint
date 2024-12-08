import axios from 'axios';

const pinataJWT = process.env.PINATA_JWT || "";

export async function pinJSONToIPFS(jsonBody: any): Promise<string> {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const res = await axios.post(url, jsonBody, {
        maxBodyLength: Infinity,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': pinataJWT
        }
    });
    return `ipfs://${res.data.IpfsHash}`;
}
