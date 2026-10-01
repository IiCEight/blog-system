import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { root, walk, parsePost, fail } from './lib.mjs';

try {
  const output = join(root, 'public');
  assert(existsSync(join(output, 'index.html')), 'Build the site before verifying it.');
  const index = JSON.parse(readFileSync(join(output, 'index.json'), 'utf8'));
  const files = walk(join(root, 'content/posts')).filter(file => file.endsWith('index.md') && !file.endsWith('_index.md'));
  const posts = files.map(parsePost);
  const published = posts.filter(({ metadata }) => !metadata.draft && Date.parse(metadata.date) <= Date.now());
  assert.equal(index.length, published.length, 'Search index must contain exactly the published posts.');
  for (const { metadata } of posts) {
    const page = join(output, 'posts', metadata.slug, 'index.html');
    if (metadata.draft || Date.parse(metadata.date) > Date.now()) {
      assert(!existsSync(page), `Unpublished post leaked: ${metadata.slug}`);
      assert(!index.some(entry => entry.url === `/posts/${metadata.slug}/`));
    } else {
      assert(existsSync(page), `Missing post: ${metadata.slug}`);
      const html = readFileSync(page, 'utf8');
      assert(html.includes('datetime='), 'Creation dates need machine-readable values.');
      assert(index.some(entry => entry.title === metadata.title && entry.url === `/posts/${metadata.slug}/`));
    }
  }
  for (const file of walk(output).filter(file => file.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    assert(!/<(?:script|link)[^>]+(?:src|href)=["']?https?:\/\//i.test(html), `External runtime asset in ${file}`);
    for (const match of html.matchAll(/\b(?:href|src)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      const value = (match[1] || match[2] || match[3] || '').replaceAll('&amp;', '&');
      if (!value || value.startsWith('#') || /^(?:https?:|mailto:|data:)/i.test(value)) continue;
      const path = decodeURIComponent(new URL(value, `http://localhost/${relative(output, file).replaceAll('\\', '/')}`).pathname);
      let target = resolve(output, '.' + path);
      assert(!relative(output, target).startsWith('..'), 'Asset escaped output directory.');
      if (path.endsWith('/')) target = join(target, 'index.html');
      assert(existsSync(target), `${relative(output, file)} has a broken local link: ${value}`);
    }
  }
  for (const forbidden of ['index.xml', 'sitemap.xml', '.git', 'hugo.toml', 'package.json']) assert(!existsSync(join(output, forbidden)), `Unexpected published file: ${forbidden}`);
  console.log(`Verified ${index.length} published posts, internal links, local assets, and production exclusions.`);
} catch (error) { fail(error); }
