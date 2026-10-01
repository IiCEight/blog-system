import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import YAML from 'yaml';
import { root, fail } from './lib.mjs';
try {
  const { values } = parseArgs({ options: { title: { type: 'string' }, slug: { type: 'string' }, tag: { type: 'string', multiple: true } } });
  if (!values.title || !values.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) throw new Error('Usage: npm run new -- --title "My thought" --slug my-thought [--tag Learning]');
  const directory = join(root, 'content/posts', values.slug);
  if (existsSync(directory)) throw new Error('That post already exists. Edit its index.md in Typora.');
  mkdirSync(join(directory, 'images'), { recursive: true });
  writeFileSync(join(directory, 'index.md'), `---\n${YAML.stringify({ title: values.title, date: new Date().toISOString(), slug: values.slug, tags: values.tag || [], draft: true })}---\n\nWrite your first thought here.\n`);
  console.log(`Created ${join(directory, 'index.md')}. Open it in Typora; set draft: false when ready.`);
} catch (error) { fail(error); }
