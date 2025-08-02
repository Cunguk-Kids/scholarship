import { Context } from "hono";
import { uploadERCToIPFS, uploadToIPFS } from "../service/ipfs.service";
import { isArray, isObject } from "lodash";

export const uploadController = async (c: Context) => {
  const body = await c.req.parseBody();
  const file = body.file as File;

  const rawAttributes = body;
  let parsedAttributes: Record<string, any>[] = [];

  if (isArray(rawAttributes) && rawAttributes.every((item) => typeof item === 'object' && item !== null)) {
    parsedAttributes = [...rawAttributes];
  } else if (isObject(rawAttributes) && rawAttributes !== null) {
    parsedAttributes = [rawAttributes];
  } else {
    return c.json({ error: 'Attributes must be object or array of objects' }, 400);
  }

  const metadata = {
    name: typeof body.name === 'string' ? body.name : 'Untitled',
    description: typeof body.description === 'string' ? body.description : '',
    attributes: parsedAttributes,
  };

  const result = await uploadToIPFS(file, metadata);
  return c.json(result);
};


export const uploadERC721Controller = async (c: Context) => {
  const body = await c.req.parseBody();
  const file = body.file as File;

  if (!(file instanceof File)) {
    return c.json({ error: "File is required and must be a valid image." }, 400);
  }

  const name = typeof body.name === "string" ? body.name : "Untitled";
  const description = typeof body.description === "string" ? body.description : "";
  const external_url = typeof body.external_url === "string" ? body.external_url : "";
  const imageURL = typeof body.image === "string" ? body.image : "";
  const attributesRaw = body.attributes;

  let parsedAttributes: Record<string, any>[] = [];

  try {
    if (typeof attributesRaw === "string") {
      const parsed = JSON.parse(attributesRaw);
      if (isArray(parsed)) {
        parsedAttributes = parsed;
      } else if (isObject(parsed)) {
        parsedAttributes = [parsed];
      }
    } else if (isArray(attributesRaw)) {
      parsedAttributes = attributesRaw;
    } else if (isObject(attributesRaw)) {
      parsedAttributes = [attributesRaw];
    }
  } catch (e) {
    return c.json({ error: "Invalid JSON for attributes." }, 400);
  }

  const metadata = {
    name,
    description,
    external_url,
    image: imageURL,
    attributes: parsedAttributes,
  };

  const result = await uploadERCToIPFS(file, metadata);
  return c.json(result);
};
