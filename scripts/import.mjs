import { existsSync, readFileSync, mkdirSync, cpSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join, extname, relative, isAbsolute } from 'node:path';
import { parseArgs } from 'node:util';
import YAML from 'yaml';
import { root, parsePost, imageTokens, fail } from './lib.mjs';
try {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { title: { type: 'string' }, date: { type: 'string' }, slug: { type: 'string' }, tag: { type: 'string', multiple: true } } });
  if (positionals.length !== 1 || extname(positionals[0]).toLowerCase() !== '.md') throw new Error('Usage: npm run import -- "path/to/note.md" --title "My note" --date 2026-10-01T16:41:00+08:00 --slug my-note');
  const source = resolve(positionals[0]);
  const original = readFileSync(source, 'utf8').replace(/^\uFEFF/, '');
  let metadata = {}; let body = original;
  if (/^---\r?\n/.test(original)) ({ metadata, body } = parsePost(source));
  metadata = { ...metadata, title: values.title || metadata.title, date: values.date || metadata.date, slug: values.slug || metadata.slug, tags: values.tag || metadata.tags || [], draft: metadata.draft ?? true };
  if (typeof metadata.title !== 'string' || !metadata.title.trim() || typeof metadata.date !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(metadata.date) || Number.isNaN(Date.parse(metadata.date)) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.slug || '')) throw new Error('Provide a title, timezone-aware creation date, and lowercase slug. The source file is never changed.');
  if (!Array.isArray(metadata.tags) || metadata.tags.some(tag => typeof tag !== 'string' || !tag.trim()) || typeof metadata.draft !== 'boolean') throw new Error('Tags must be a list of strings and draft must be true or false.');
  const target = join(root, 'content/posts', metadata.slug);
  if (existsSync(target)) throw new Error('That post already exists. Edit its imported index.md; import never overwrites a post.');
  const imageMap = new Map();
  for (const href of imageTokens(body)) {
    if (imageMap.has(href)) continue;
    if (/^(?:[a-z]+:|\/|\\)/i.test(href)) throw new Error(`Use a local relative image: ${href}`);
    const asset = resolve(dirname(source), decodeURIComponent(href.split(/[?#]/)[0]));
    if (!existsSync(asset) || !/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(asset)) throw new Error(`Image is missing or unsupported: ${href}`);
    const path = relative(dirname(source), asset);
    if (path.startsWith('..') || isAbsolute(path)) throw new Error(`Keep images inside the note's folder before importing: ${href}`);
    imageMap.set(href, { source: asset, path });
  }
  // Preserve the body byte-for-byte and copy assets to identical relative paths.
  // This handles reference images and leaves inline/fenced code examples untouched.
  mkdirSync(join(target, 'images'), { recursive: true });
  for (const asset of imageMap.values()) { mkdirSync(dirname(join(target, asset.path)), { recursive: true }); cpSync(asset.source, join(target, asset.path)); }
  writeFileSync(join(target, 'index.md'), `---\n${YAML.stringify(metadata)}---\n\n${body}`);
  console.log(`Imported ${join(target, 'index.md')} with ${imageMap.size} images. The original is unchanged; drafts stay private until you set draft: false.`);
} catch (error) { fail(error); }
