import { create } from 'ipfs-http-client';

export const ipfs = create({
  host: process.env.IPFS_HOST,
  port: 5001,
  protocol: 'http'
});

export const ipfsHost = "https://camping-programmes-annex-gorgeous.trycloudflare.com/ipfs";