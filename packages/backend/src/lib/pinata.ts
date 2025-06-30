import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_TOKEN,
  pinataGateway: process.env.PINATA_GATEWAY,
});
