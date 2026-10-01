import { mkdirSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib.mjs';
export function prepareAssets() {
  const katex = join(root, 'node_modules/katex/dist');
  if (!existsSync(katex)) throw new Error('Run npm ci first to install local math styles.');
  mkdirSync(join(root, 'static/vendor/katex'), { recursive: true });
  cpSync(join(katex, 'katex.min.css'), join(root, 'static/vendor/katex/katex.min.css'));
  cpSync(join(katex, 'fonts'), join(root, 'static/vendor/katex/fonts'), { recursive: true });
  cpSync(join(root, 'node_modules/katex/LICENSE'), join(root, 'static/vendor/katex/LICENSE'));
}
