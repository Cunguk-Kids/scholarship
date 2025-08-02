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
}: UploadPayload): Promise<UploadResponse> {
  const formData = new FormData();

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
  form.set("name", props.name);
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
