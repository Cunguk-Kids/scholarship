import { create } from 'ipfs-http-client';

export const ipfs = create({
  host: '139.59.232.68',
  port: 5001,
  protocol: 'http'
});

export const ipfsHost = "https://camping-programmes-annex-gorgeous.trycloudflare.com/ipfs";