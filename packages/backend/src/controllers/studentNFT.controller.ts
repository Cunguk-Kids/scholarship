import { generateImage } from "@back/lib/ImageTemplateReSVG";
import path from 'path';
import Elysia, { t } from "elysia";
import type { IMetadata } from "@back/types/metadata.type";
import { publicDir } from "@back/utils/publicDirectory";
import fs from "fs";
import { ipfs, ipfsHost } from "@back/lib/ipfs";

export const studentNFTController = new Elysia({ prefix: "/student-nft" })
  .post("/generate", async ({ body, set }) => {
    const metadata = body as IMetadata;

    if (!metadata.studentID || !metadata.enrollDate) {
      set.status = 400;
      return { error: 'Missing required metadata' };
    }
    const outputPath = path.join(publicDir, 'output', `template-${Date.now()}.png`);
    const templatePath = path.join(publicDir, 'templates', 'student', 'test.svg');

    // generate image
    generateImage(templatePath, outputPath, metadata);

    const imageBuffer = fs.readFileSync(outputPath);
    const base64String = imageBuffer.toString('base64');
    // const uploadedMedia = await pinata.upload.public.base64(base64String);

    // ipfs
    const result = await ipfs.add(imageBuffer);
    const imageUri = `${result.path}`;

    // delete file
    // fs.unlinkSync(outputPath);

    const finalProcess = {
      ...metadata,
      imageCID: imageUri,
    };

    const jsonMetadata = await ipfs.add(JSON.stringify(finalProcess));

    const finalResult = {
      metadataURL: `${ipfsHost}/${jsonMetadata.cid}`,
      imageURL: `${ipfsHost}/${imageUri}`,
      metadata: { ...finalProcess, cid: jsonMetadata.cid }
    };

    return { success: true, finalResult };
  }, {
    body: t.Object({
      studentID: t.String(),
      enrollDate: t.String()
    })
  });
