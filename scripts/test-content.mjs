import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, fail } from './lib.mjs';

const slug = 'acceptance-import-check';
const bundle = join(root, 'content/posts', slug);
const fixture = join(root, '.local/import-fixture');
let created = false;
try {
  assert(!existsSync(bundle), 'Acceptance-test slug already exists; refusing to overwrite.');
  mkdirSync(join(fixture, 'images'), { recursive: true });
  writeFileSync(join(fixture, 'images/example.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="pink"/></svg>');
  const original = '# Import example\n\n![Inline](images/example.svg)\n\n![Reference][photo]\n\n[photo]: images/example.svg\n\n```md\n![Literal](images/example.svg)\n```\n';
  const source = join(fixture, 'example.md'); writeFileSync(source, original);
  function command(script, args = []) { return spawnSync(process.execPath, [join(root, 'scripts', script), ...args], { cwd: root, encoding: 'utf8' }); }
  const imported = command('import.mjs', [source, '--title', 'Acceptance import check', '--date', '2026-10-01T12:00:00+08:00', '--slug', slug]);
  created = existsSync(bundle);
  assert.equal(imported.status, 0, imported.stderr);
  assert.equal(readFileSync(source, 'utf8'), original, 'Importer modified the original.');
  assert(existsSync(join(bundle, 'images/example.svg')));
  const markdown = readFileSync(join(bundle, 'index.md'), 'utf8');
  assert(markdown.includes('![Inline](images/example.svg)'));
  assert(markdown.includes('[photo]: images/example.svg'));
  assert(markdown.endsWith(original), 'Importer changed the Markdown body.');
  assert(markdown.includes('```md\n![Literal](images/example.svg)\n```'), 'Code example was rewritten.');
  assert.notEqual(command('import.mjs', [source, '--title', 'Overwrite', '--date', '2026-10-01T12:00:00+08:00', '--slug', slug]).status, 0, 'Importer overwrote an existing post.');
  writeFileSync(join(bundle, 'index.md'), markdown + '\n![Missing](images/missing.png)\n');
  assert.notEqual(command('validate.mjs').status, 0, 'Missing image passed validation.');
  writeFileSync(join(bundle, 'index.md'), markdown);
  const build = command('build.mjs'); assert.equal(build.status, 0, build.stderr);
  assert(!existsSync(join(root, 'public/posts', slug, 'index.html')), 'Draft appeared in production.');
  assert(!readFileSync(join(root, 'public/index.json'), 'utf8').includes('Acceptance import check'), 'Draft appeared in search.');
  console.log('Content checks passed: import with relative/reference images, source preservation, overwrite refusal, missing-image rejection, draft exclusion.');
} catch (error) { fail(error); }
finally {
  if (created) {
    // Only remove the fixture bundle created by this test, after checking its absolute workspace location.
    assert.equal(relative(join(root, 'content/posts'), bundle), slug);
    rmSync(bundle, { recursive: true });
  }
}
