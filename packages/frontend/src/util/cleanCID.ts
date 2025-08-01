import type { Address } from "viem";

export function cleanCID(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw.trim().replace(/^['"]+|['"]+$/g, "");
}

export function createMetadataNFT(props: {
  description: string;
  imageURL: string;
  name: string;
  owner: Address;
}) {
  return {
    description: props.description,
    external_url: "https://skoolcein.edu/",
    image: props.imageURL,
    name: props.name,
    attributes: [
      {
        trait_type: "Owner",
        value: props.owner,
      },
    ],
  } as const;
}
