import { existsSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, walk, parsePost, imageTokens, fail } from './lib.mjs';

export function validate() {
  const slugs = new Set();
  const files = walk(join(root, 'content/posts')).filter(file => file.endsWith('.md') && !file.endsWith('_index.md'));
  for (const file of files) {
    const { metadata: meta, body } = parsePost(file);
    if (typeof meta.title !== 'string' || !meta.title.trim()) throw new Error(`${file}: title is required.`);
    if (typeof meta.date !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(meta.date) || Number.isNaN(Date.parse(meta.date))) throw new Error(`${file}: date must be an ISO timestamp with timezone.`);
    if (meta.lastmod && (Number.isNaN(Date.parse(meta.lastmod)) || !/(Z|[+-]\d{2}:\d{2})$/.test(meta.lastmod) || Date.parse(meta.lastmod) < Date.parse(meta.date))) throw new Error(`${file}: lastmod must be a timezone-aware date at or after creation.`);
    if (typeof meta.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) throw new Error(`${file}: slug must contain lowercase letters, numbers, and single hyphens.`);
    if (slugs.has(meta.slug)) throw new Error(`${file}: duplicate slug ${meta.slug}.`); slugs.add(meta.slug);
    if (meta.tags !== undefined && (!Array.isArray(meta.tags) || meta.tags.some(tag => typeof tag !== 'string' || !tag.trim()))) throw new Error(`${file}: tags must be a list of nonempty strings.`);
    if (meta.draft !== undefined && typeof meta.draft !== 'boolean') throw new Error(`${file}: draft must be true or false.`);
    if (file.split(/[\\/]/).at(-1) !== 'index.md') throw new Error(`${file}: posts must use an index.md page bundle.`);
    for (const source of imageTokens(body)) {
      let image;
      try { image = decodeURIComponent(source.split(/[?#]/)[0]); } catch { throw new Error(`${file}: invalid image URL ${source}.`); }
      if (/^(?:[a-z]+:|\/|\\)/i.test(image)) throw new Error(`${file}: use a bundled relative image instead of ${source}.`);
      const path = resolve(dirname(file), image);
      const local = relative(dirname(file), path);
      if (local.startsWith('..') || isAbsolute(local) || !existsSync(path)) throw new Error(`${file}: missing or out-of-bundle image ${source}.`);
    }
  }
  console.log(`Validated ${files.length} Markdown post bundles.`);
  return files;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { validate(); } catch (error) { fail(error); }
}
