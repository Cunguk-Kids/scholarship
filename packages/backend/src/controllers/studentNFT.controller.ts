import { generateImage } from "@back/lib/ImageTemplateReSVG";
import path from 'path';
import Elysia from "elysia";
import type { StudentMetadata } from "@back/types/metadata.type";
import { publicDir } from "@back/utils/publicDirectory";

export const studentNFTController = new Elysia({ prefix: "/student-nft" })
  .post("/generate", ({ body, set }) => {
    const metadata = body as StudentMetadata;

    if (!metadata.studentID || !metadata.enrollDate) {
      set.status = 400;
      return { error: 'Missing required metadata fields' };
    }
    const outputPath = path.join(publicDir, 'output', `template-${Date.now()}.png`);
    const templatePath = path.join(publicDir, 'templates', 'template-two.svg');

    console.log(templatePath);

    generateImage(templatePath, outputPath, metadata);

    return { success: true, templatePath, path: outputPath };
  });
