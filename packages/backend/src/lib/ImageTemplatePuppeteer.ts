import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { isArray } from "lodash";

export interface Metadata {
  id?: number;
  eventName?: string;
  ticketNumber: number[];
  enrollDate: string;
  startDate?: string;
  endDate?: string;
}

const puppeteerLaunchOptions = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ]
};

function replaceTemplatePlaceholders(templateContent: string, metadata: Metadata): string {
  let updatedContent = templateContent;

  for (const [key, value] of Object.entries(metadata)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    updatedContent = updatedContent.replace(
      regex,
      isArray(value) ? value.join("") : String(value)
    );
  }

  if (metadata.ticketNumber) {
    metadata.ticketNumber.forEach((value, index) => {
      const numRegex = new RegExp(`{{num${index}}}`, "g");
      updatedContent = updatedContent.replace(numRegex, String(value));
    });
  }

  return updatedContent;
}

export async function htmlToPng(
  templatePath: string,
  outputPath = "output/output.png",
  metadata: Metadata
) {
  let browser;
  try {
    const templateContent = fs.readFileSync(templatePath, "utf8");
    const populatedContent = replaceTemplatePlaceholders(templateContent, metadata);

    browser = await puppeteer.launch(puppeteerLaunchOptions);
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 700 });
    await page.setContent(populatedContent, { waitUntil: 'networkidle0' });

    await page.waitForSelector('#ticket', { timeout: 5000 });
    const ticketElement = await page.$('#ticket');

    if (!ticketElement) throw new Error("Element #ticket not found.");

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await ticketElement.screenshot({ path: outputPath as `${string}.webp` });
    console.log(`screenshot saved at: ${outputPath}`);

    return outputPath;

  } catch (error) {
    console.error("error in htmlToPng:", error);
    throw error;
  } finally {
    if (browser) {
      try {
        const pages = await browser.pages();
        await Promise.all(pages.map(page => page.close()));
      } catch (e) {
        console.error("error closing browser pages:", e);
      }
      await browser.close().catch(e => console.error("error closing browser:", e));
    }
  }
}

export async function htmlToWebp(
  templatePath: string,
  outputPath = "output/output.webp",
  metadata: Metadata
) {
  let browser;
  try {
    const templateContent = fs.readFileSync(templatePath, "utf8");
    const populatedContent = replaceTemplatePlaceholders(templateContent, metadata);

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    browser = await puppeteer.launch(puppeteerLaunchOptions);
    const page = await browser.newPage();
    await page.addStyleTag({ content: 'body { background: transparent; margin: 0; padding: 0; }' });
    await page.setContent(populatedContent, { waitUntil: "networkidle0" });

    await page.waitForSelector('#ticket', { timeout: 5000 });
    const ticketElement = await page.$('#ticket');

    if (!ticketElement) throw new Error("Element #ticket not found.");

    await ticketElement.screenshot({ path: outputPath as `${string}.webp` });
    console.log(`WEBP image created at: ${outputPath}`);

    return outputPath;

  } catch (error) {
    console.error("error in htmlToWebp:", error);
    throw error;
  } finally {
    if (browser) {
      try {
        const pages = await browser.pages();
        await Promise.all(pages.map(page => page.close()));
      } catch (e) {
        console.error("error closing browser pages:", e);
      }
      await browser.close().catch(e => console.error("error closing browser:", e));
    }
  }
}
