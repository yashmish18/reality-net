import { create } from 'ipfs-http-client'

const ipfs = create({
  url: process.env.IPFS_URL || 'https://ipfs.infura.io:5001/api/v0',
})

export async function uploadToIPFS(buffer: Buffer, filename: string): Promise<string> {
  const result = await ipfs.add({
    path: filename,
    content: buffer
  })
  return result.cid.toString()
}

export function getIPFSURL(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`
}

