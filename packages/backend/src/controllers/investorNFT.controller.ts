import { generateImage } from "@back/lib/ImageTemplateReSVG";
import path from 'path';
import Elysia from "elysia";
import type { StudentMetadata } from "@back/types/metadata.type";
import { publicDir } from "@back/utils/publicDirectory";
import fs from "fs";
import { pinata } from "@back/lib/pinata";

export const investorNFTController = new Elysia({ prefix: "/investor-nft" })
  .post("/generate", async ({ body, set }) => {
    const metadata = body as StudentMetadata;

    if (!metadata.studentID || !metadata.enrollDate) {
      set.status = 400;
      return { error: 'Missing required metadata' };
    }
    const outputPath = path.join(publicDir, 'output', `template-${Date.now()}.png`);
    const templatePath = path.join(publicDir, 'templates', 'investor', 'template-two.svg');

    // generate image
    generateImage(templatePath, outputPath, metadata);

    const imageBuffer = fs.readFileSync(outputPath);
    const base64String = imageBuffer.toString('base64');
    const uploadedMedia = await pinata.upload.public.base64(base64String);

    // ipfs
    // const result = await ipfs.add(imageBuffer);
    // const imageUri = `${result.path}`;

    // delete file
    // fs.unlinkSync(outputPath);

    const finalProcess = {
      ...metadata,
      imageCID: uploadedMedia.cid,
    };

    const jsonMetadata = await pinata.upload.public.json(finalProcess);

    const finalResult = {
      metadataURL: `${process.env.IPFS_URL}/${jsonMetadata.cid}`,
      imageURL: `${process.env.IPFS_URL}/${uploadedMedia.cid}`,
      metadata: { ...finalProcess, cid: jsonMetadata.cid }
    };

    return { success: true, finalResult };
  });
