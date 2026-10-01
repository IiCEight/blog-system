import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { root, run, fail } from './lib.mjs';

try {
  const version = readFileSync(join(root, '.hugo-version'), 'utf8').trim();
  const binary = join(root, '.tools/hugo', process.platform === 'win32' ? 'hugo.exe' : 'hugo');
  if (existsSync(binary)) {
    const result = run(binary, ['version'], { stdio: 'pipe', encoding: 'utf8' });
    if (!result.stdout.startsWith(`hugo v${version}-`) && !result.stdout.startsWith(`hugo v${version} `)) throw new Error(`Existing Hugo does not match pinned version ${version}.`);
    console.log(result.stdout.trim()); process.exit(0);
  }
  const os = { win32: 'windows', linux: 'linux', darwin: 'darwin' }[process.platform];
  const arch = { x64: 'amd64', arm64: 'arm64' }[process.arch];
  if (!os || !arch) throw new Error('Install the pinned Hugo version manually on this platform.');
  const name = `hugo_${version}_${os}-${arch}.${os === 'windows' ? 'zip' : 'tar.gz'}`;
  const prefix = `https://github.com/gohugoio/hugo/releases/download/v${version}/`;
  async function get(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status} ${url}`);
    return Buffer.from(await response.arrayBuffer());
  }
  const [archive, checksums] = await Promise.all([get(prefix + name), get(prefix + `hugo_${version}_checksums.txt`)]);
  const expected = checksums.toString().split(/\r?\n/).find(line => line.trim().endsWith(name))?.split(/\s+/)[0];
  if (!expected || createHash('sha256').update(archive).digest('hex') !== expected) throw new Error('Hugo checksum verification failed.');
  const toolRoot = join(root, '.tools'); mkdirSync(join(toolRoot, 'hugo'), { recursive: true });
  const archivePath = join(toolRoot, name); writeFileSync(archivePath, archive);
  if (os === 'windows') {
    const quote = value => "'" + value.replaceAll("'", "''") + "'";
    run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `Expand-Archive -LiteralPath ${quote(archivePath)} -DestinationPath ${quote(join(toolRoot, 'hugo'))} -Force`]);
  } else { run('tar', ['-xzf', archivePath, '-C', join(toolRoot, 'hugo')]); chmodSync(binary, 0o755); }
  run(binary, ['version']);
} catch (error) { fail(error); }
