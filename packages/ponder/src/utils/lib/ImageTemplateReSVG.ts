import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';
import { publicDir } from '../publicDirectory';

function replaceSvgPlaceholders<T extends Record<string, unknown>>(svgContent: string, metadata: T): string {
  let updatedContent = svgContent;
  for (const [key, value] of Object.entries(metadata)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    updatedContent = updatedContent.replace(regex, String(value));
  }
  return updatedContent;
}

function generateStarFills(stars: number, max = 5) {
  const fills: Record<string, string> = {};
  for (let i = 1; i <= max; i++) {
    fills[`star${i}`] = i <= stars ? '#FFD700' : '#d1d5db';
  }
  return fills;
}

export function generateImage<T extends Record<string, unknown>>(
  templatePath: string,
  outputPath: string,
  metadata: T
) {
  const svgContent = fs.readFileSync(templatePath, 'utf8');
  const starFills = generateStarFills(metadata?.stars ? Number(metadata?.stars) : 0);
  const fullMetadata = {
    ...metadata,
    ...starFills
  };

  const populatedSvg = replaceSvgPlaceholders(svgContent, fullMetadata);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, populatedSvg, 'utf8');

  // untuk render png
  // const resvg = new Resvg(populatedSvg, {
  //   fitTo: { mode: 'width', value: 400 }
  // });

  // const pngBuffer = resvg.render().asPng();

  // const dir = path.dirname(outputPath);
  // if (!fs.existsSync(dir)) {
  //   fs.mkdirSync(dir, { recursive: true });
  // }

  // fs.writeFileSync(outputPath, pngBuffer);
}


const outputPath = path.join(publicDir, 'output', `template-${Date.now()}.svg`);
const templatePath = path.join(publicDir, 'templates', 'nft-template.svg');

// generate image
generateImage(templatePath, outputPath, { id: "#001", name: "raihan", programName: "Program 1", stars: 3 });