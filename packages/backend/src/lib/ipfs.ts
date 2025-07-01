import { create } from 'ipfs-http-client';

export const ipfs = create({
  host: '127.0.0.1',
  port: 5001,
  protocol: 'http'
});

export const ipfsHost = "http://127.0.0.1:8081/ipfs";