import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const outDir = path.resolve("output/playwright");
const targetUrl = process.env.GAME_URL || "http://127.0.0.1:4173";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

await page.goto(targetUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(outDir, "01-home.png"), fullPage: true });

await page.click("#start-btn");
await page.waitForTimeout(300);
await page.keyboard.press("1");
await page.waitForTimeout(180);
await page.keyboard.press("2");
await page.waitForTimeout(180);
await page.keyboard.press("q");

for (let index = 0; index < 36; index += 1) {
  await page.evaluate(() => window.advanceTime(500));
  if (index % 6 === 0) {
    await page.keyboard.press("1");
  }
  if (index % 10 === 0) {
    await page.keyboard.press("3");
  }
}

const stateDump = await page.evaluate(() => window.render_game_to_text());
fs.writeFileSync(path.join(outDir, "state.json"), stateDump);
await page.screenshot({ path: path.join(outDir, "02-battle.png"), fullPage: true });

await browser.close();
console.log(stateDump);
