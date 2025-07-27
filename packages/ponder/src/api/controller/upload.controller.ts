import { Context } from "hono";
import { uploadToIPFS } from "../service/ipfs.service";

export const uploadController = async (c: Context) => {
  const body = await c.req.parseBody();
  const file = body.file as File;

  if (!file) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  const rawAttributes = body.attributes;
  let parsedAttributes: Record<string, any>[] = [];

  if (typeof rawAttributes === 'string') {
    try {
      const temp = JSON.parse(rawAttributes);

      if (Array.isArray(temp) && temp.every((item) => typeof item === 'object' && item !== null)) {
        parsedAttributes = [...temp];
      } else if (typeof temp === 'object' && temp !== null) {
        parsedAttributes = [temp];
      } else {
        return c.json({ error: 'Attributes must be object or array of objects' }, 400);
      }

    } catch {
      return c.json({ error: 'Invalid JSON in attributes' }, 400);
    }
  }

  const metadata = {
    name: typeof body.name === 'string' ? body.name : 'Untitled',
    description: typeof body.description === 'string' ? body.description : '',
    attributes: parsedAttributes,
  };

  const result = await uploadToIPFS(file, metadata);
  return c.json(result);
};
