"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToIPFS = uploadToIPFS;
exports.downloadFromIPFS = downloadFromIPFS;
const ipfs_http_client_1 = require("ipfs-http-client");
const ipfsUrl = process.env.IPFS_API_URL || 'http://localhost:5001/api/v0';
const client = (0, ipfs_http_client_1.create)({ url: ipfsUrl });
async function uploadToIPFS(data) {
    const result = await client.add(data);
    return result.path; // This is the IPFS CID
}
async function downloadFromIPFS(cid) {
    const chunks = [];
    for await (const chunk of client.cat(cid)) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}
