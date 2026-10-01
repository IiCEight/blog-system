import { hugo, run, fail } from './lib.mjs';
import { validate } from './validate.mjs';
import { prepareAssets } from './prepare-assets.mjs';

try {
  validate();
  prepareAssets();
  run(hugo(), ['--gc', '--minify', '--cleanDestinationDir', ...process.argv.slice(2)]);
} catch (error) { fail(error); }
