import { hugo, run, fail } from './lib.mjs';
import { prepareAssets } from './prepare-assets.mjs';
try { if (process.argv[2] === 'server') prepareAssets(); run(hugo(), process.argv.slice(2)); } catch (error) { fail(error); }
