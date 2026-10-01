import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { root, fail } from './lib.mjs';

let server;
try {
  const caddy = process.env.CADDY_PATH || join(root, '.tools/caddy', process.platform === 'win32' ? 'caddy.exe' : 'caddy');
  if (!existsSync(caddy)) throw new Error('Set CADDY_PATH to a Caddy executable for local access-control checks.');
  const password = randomBytes(24).toString('hex');
  const hash = spawnSync(caddy, ['hash-password', '--plaintext', password], { encoding: 'utf8' });
  assert.equal(hash.status, 0, 'Password hashing failed.');
  const config = '{\n admin off\n auto_https off\n}\n' + readFileSync(join(root, 'deploy/Caddyfile.example'), 'utf8')
    .replace('notes.example.com {', 'http://127.0.0.1:1413 {')
    .replace('/srv/fieldnotes/current', `"${join(root, 'public').replaceAll('\\', '/')}"`);
  const local = join(root, '.local'); mkdirSync(local, { recursive: true });
  const file = join(local, 'Caddyfile.test'); writeFileSync(file, config);
  const env = { ...process.env, BLOG_USER: 'test-reader', BLOG_PASSWORD_HASH: hash.stdout.trim() };
  const validated = spawnSync(caddy, ['validate', '--config', file, '--adapter', 'caddyfile'], { env, encoding: 'utf8' });
  assert.equal(validated.status, 0, validated.stderr);
  let diagnostics = '';
  server = spawn(caddy, ['run', '--config', file, '--adapter', 'caddyfile'], { env, stdio: ['ignore', 'ignore', 'pipe'] });
  server.stderr.on('data', data => { diagnostics += data; });
  const origin = 'http://127.0.0.1:1413';
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { if ((await fetch(origin, { signal: AbortSignal.timeout(500) })).status === 401) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert(ready, `Local Caddy did not start: ${diagnostics}`);
  const html = readFileSync(join(root, 'public/index.html'), 'utf8');
  const css = html.match(/href=["']?([^\s"'>]+\.css)/)?.[1];
  const paths = ['/', '/posts/markdown-guide/', '/posts/markdown-guide/images/workflow.svg', '/index.json', css, '/missing-note/'];
  for (const path of paths) {
    assert(path, 'CSS path missing.');
    const anonymous = await fetch(origin + path);
    assert.equal(anonymous.status, 401, `${path}: anonymous access must be denied.`);
    assert(anonymous.headers.get('www-authenticate')?.startsWith('Basic'), 'Browser must receive an auth challenge.');
    assert(!(await anonymous.text()).includes('Your Markdown'), 'Private content leaked.');
    const authorized = await fetch(origin + path, { headers: { Authorization: `Basic ${Buffer.from(`test-reader:${password}`).toString('base64')}` } });
    assert.equal(authorized.status, path === '/missing-note/' ? 404 : 200, `${path}: authenticated access failed.`);
    if (authorized.ok) assert.equal(authorized.headers.get('cache-control'), 'private, no-store');
  }
  const wrong = await fetch(origin + '/', { headers: { Authorization: `Basic ${Buffer.from('test-reader:wrong').toString('base64')}` } });
  assert.equal(wrong.status, 401);
  console.log('Local Caddy checks passed: HTML, image, CSS, search data, and missing routes require authentication; wrong credentials are denied. Production HTTPS remains unverified.');
} catch (error) { fail(error); }
finally { server?.kill(); }
