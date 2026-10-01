import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { root, fail } from './lib.mjs';

let browser;
try {
  const executablePath = process.env.BROWSER_PATH || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
  if (!executablePath) throw new Error('Set BROWSER_PATH to a Chromium-based browser to run UI checks.');
  browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const origin = process.env.PREVIEW_URL || 'http://127.0.0.1:1313';
  const artifacts = join(root, '.local/screenshots'); mkdirSync(artifacts, { recursive: true });
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/', '/posts/', '/tags/', '/search/', '/posts/markdown-guide/']) {
      const response = await page.goto(origin + path);
      assert(response.ok(), `${path} did not load.`);
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
      assert(fits, `${path} overflows at ${width}px.`);
    }
    await page.screenshot({ path: join(artifacts, `article-${width}.png`), fullPage: true });
    await page.goto(origin + '/');
    await page.screenshot({ path: join(artifacts, `home-${width}.png`), fullPage: true });
  }
  await page.goto(origin + '/search/');
  await page.getByLabel('Search your writing').fill('mathematics');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('status').filter({ hasText: '1 note found.' }).waitFor();
  assert.equal(await page.locator('#search-results h2').count(), 1);
  await page.getByLabel('Search your writing').fill('no-such-note-xyz');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'No matching notes.' }).waitFor();
  await page.getByLabel('Search your writing').fill('');
  await page.getByRole('status').filter({ hasText: 'Enter a word' }).waitFor();
  await page.goto(origin + '/posts/markdown-guide/');
  assert.equal(await page.locator('.katex').count(), 2, 'Inline and block math must render.');
  assert(await page.locator('.prose img').evaluate(image => image.complete && image.naturalWidth > 0));
  await page.addStyleTag({ content: 'html{font-size:200%}' });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Enlarged text overflows.');
  await page.goto(origin + '/');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Skip to content');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.deepEqual(errors, [], 'Browser script errors.');
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJS.newPage();
  await staticPage.goto(origin + '/posts/markdown-guide/');
  assert(await staticPage.locator('.prose').isVisible(), 'Notes must be readable without JavaScript.');
  writeFileSync(join(root, '.local/ui-checks.json'), JSON.stringify({ passed: true, widths: [360, 768, 1440], search: true, math: true, images: true, enlargedText: true, keyboard: true, reducedMotion: true, readableWithoutJS: true }, null, 2));
  console.log('UI checks passed: responsive routes, search states, math, image, enlarged text, keyboard, reduced motion, and reading without JavaScript.');
} catch (error) { fail(error); } finally { await browser?.close(); }
