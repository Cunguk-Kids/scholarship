import { create } from 'ipfs-http-client';
import { PinataSDK } from 'pinata';

if (!process.env.PINATA_JWT) throw new Error('PINATA_JWT is not set');
if (!process.env.PINATA_GATEWAY) throw new Error('PINATA_GATEWAY is not set');

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

export const ipfsPinataGateway = `https://${process.env.PINATA_GATEWAY}/ipfs`;

export const ipfs = create({
  host: process.env.IPFS_HOST,
  port: 5001,
  protocol: 'http'
});

export const ipfsHost = "https://camping-programmes-annex-gorgeous.trycloudflare.com/ipfs";