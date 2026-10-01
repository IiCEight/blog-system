import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import MarkdownIt from 'markdown-it';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const markdown = new MarkdownIt();
export function hugo() {
  const local = join(root, '.tools', 'hugo', process.platform === 'win32' ? 'hugo.exe' : 'hugo');
  return existsSync(local) ? local : 'hugo';
}
export function run(command, args, options = {}) {
  const temp = join(root, '.cache/tmp'); mkdirSync(temp, { recursive: true });
  const env = { ...process.env, HUGO_CACHEDIR: join(root, '.cache/hugo'), TMP: temp, TEMP: temp, TMPDIR: temp };
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
  return result;
}
export function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
export function parsePost(file) {
  const text = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${file}: YAML metadata is missing. Use npm run import or add title, date, and slug.`);
  const metadata = YAML.parse(match[1]);
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error(`${file}: metadata must be an object.`);
  return { metadata, body: text.slice(match[0].length) };
}
export function imageTokens(body) {
  const images = [];
  function visit(tokens) {
    for (const token of tokens) {
      if (token.type === 'image') images.push(token.attrGet('src'));
      if (token.children) visit(token.children);
    }
  }
  visit(markdown.parse(body, {}));
  return images;
}
export function fail(error) { console.error(error.message); process.exitCode = 1; }
