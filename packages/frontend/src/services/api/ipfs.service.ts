/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/util/api";
import type { Address } from "viem";

type UploadPayload = {
  file?: File;
  meta?: Record<string, any>;
};

type UploadResponse = {
  imageCID: string;
  metaCID: string;
  imageURL: string;
  metadataURL: string;
};

export async function uploadToIPFS({
  file,
  meta,
  type = "metadata",
}: UploadPayload & { type?: string }): Promise<UploadResponse> {
  const formData = new FormData();

  // Enforce Skoolchein naming convention for Pinata/IPFS metadata
  const fileName = `skoolchein-${type}-${Date.now()}`;
  formData.append("name", fileName);

  if (file) {
    formData.append("file", file);
  }

  if (meta) {
    for (const [key, value] of Object.entries(meta)) {
      formData.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : String(value)
      );
    }
  }

  const response = await api.post("/ipfs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function uploadToIPFSNFT(props: {
  file: File;
  name: string;
  description: string;
  owner: Address;
}): Promise<UploadResponse> {
  const form = new FormData();
  form.set("file", props.file);
  
  // Enforce Skoolchein naming convention for NFT naming
  const nftName = props.name.startsWith("skoolchein-") 
    ? props.name 
    : `skoolchein-nft-${props.name}`;
    
  form.set("name", nftName);
  form.set("description", props.description);
  form.set("external_url", "https://skoolchain.edu/");
  form.set(
    "attributes",
    JSON.stringify([
      {
        trait_type: "Owner",
        value: props.owner,
      },
    ])
  );
  return (
    await api.post("/ipfs/upload/erc-721", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  ).data;
}
