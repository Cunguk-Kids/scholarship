import { Context } from "hono";
import { uploadToIPFS } from "../service/ipfs.service";
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
