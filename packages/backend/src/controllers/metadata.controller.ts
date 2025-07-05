import { pinata } from "@back/lib/pinata";
import Elysia, { t } from "elysia";

export const metadataController = new Elysia({ prefix: "/metadata" }).post(
  "/",
  async ({ body }) => {
    const response = await pinata.upload.public.base64(
      Buffer.from(await body.file.arrayBuffer()).toBase64()
    );
    const json = await pinata.upload.public.json({
      description: body.description,
      imageCID: response.cid,
    });

    return {
      metadataURL: `${process.env.IPFS_URL}/${json.cid}`,
      imageURL: `${process.env.IPFS_URL}/${response.cid}`,
      json,
    };
  },
  {
    body: t.Object({
      file: t.File(),
      description: t.String(),
    }),
  }
);
