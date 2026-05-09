import { create } from 'ipfs-http-client';

const ipfsUrl = process.env.IPFS_API_URL || 'http://localhost:5001/api/v0';
const client = create({ url: ipfsUrl });

export async function uploadToIPFS(data: Buffer): Promise<string> {
  const result = await client.add(data);
  return result.path; // This is the IPFS CID
}

export async function downloadFromIPFS(cid: string): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of client.cat(cid)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
