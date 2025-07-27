import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

function replaceSvgPlaceholders<T extends Record<string, unknown>>(svgContent: string, metadata: T): string {
  let updatedContent = svgContent;
  for (const [key, value] of Object.entries(metadata)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    updatedContent = updatedContent.replace(regex, String(value));
  }
  return updatedContent;
}

export function generateImage<T extends Record<string, unknown>>(
  templatePath: string,
  outputPath: string,
  metadata: T
) {
  const svgContent = fs.readFileSync(templatePath, 'utf8');
  const populatedSvg = replaceSvgPlaceholders(svgContent, metadata);

  const resvg = new Resvg(populatedSvg, {
    fitTo: { mode: 'width', value: 400 }
  });

  const pngBuffer = resvg.render().asPng();

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, pngBuffer);
}
