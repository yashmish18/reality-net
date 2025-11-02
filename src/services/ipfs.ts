import { create, IPFSHTTPClient } from 'ipfs-http-client'

let ipfsClient: IPFSHTTPClient | null = null

export async function getIPFSClient(): Promise<IPFSHTTPClient> {
  if (!ipfsClient) {
    ipfsClient = create({
      url: 'https://ipfs.infura.io:5001/api/v0',
    })
  }
  return ipfsClient
}

export async function uploadToIPFS(file: File): Promise<string> {
  const client = await getIPFSClient()
  const result = await client.add(file)
  return result.cid.toString()
}

export async function uploadBufferToIPFS(buffer: ArrayBuffer): Promise<string> {
  const client = await getIPFSClient()
  const result = await client.add(buffer)
  return result.cid.toString()
}

export function getIPFSURL(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`
}

