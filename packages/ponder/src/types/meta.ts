export type AttributeItem = {
  [key: string]: string | number | boolean | null | undefined;
};

export type IPFSMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: AttributeItem[];
};