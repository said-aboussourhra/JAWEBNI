// Rebuilds vendor/ from composer.lock using GitHub zipballs (no Packagist, no Composer).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const PROJECT = '/home/user/JAWEBNI';
const VENDOR = path.join(PROJECT, 'vendor');
const TMP = '/tmp/jawebni-vendor';

const lock = JSON.parse(fs.readFileSync(path.join(PROJECT, 'composer.lock'), 'utf8'));
const packages = [...(lock.packages || []), ...(lock['packages-dev'] || [])];

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(VENDOR, { recursive: true });

function githubRepo(pkg) {
  // Package names are not repository paths: e.g. nesbot/carbon now lives at
  // CarbonPHP/carbon. Always trust the source URL from composer.lock.
  const match = String(pkg.source?.url || '').match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?\/?$/i);
  return match ? match[1] : pkg.name;
}

async function download(pkg, index) {
  const zip = path.join(TMP, `${index}.zip`);
  const repo = githubRepo(pkg);
  const ref = pkg.source.reference;
  const urls = [
    `https://api.github.com/repos/${repo}/zipball/${ref}`,
    `https://github.com/${repo}/archive/${ref}.zip`,
    `https://codeload.github.com/${repo}/legacy.zip/${ref}`,
  ];
  let lastError;
  for (const url of urls) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const res = await fetch(url, {
          headers: { Accept: 'application/zip', 'User-Agent': 'jawebni-sandbox' },
          redirect: 'follow',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length < 100) throw new Error('empty archive');
        fs.writeFileSync(zip, buffer);
        return zip;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }
  }
  throw new Error(`${pkg.name} (${repo}): ${lastError?.message ?? lastError}`);
}

function extract(zip, pkg) {
  const out = path.join(TMP, `x-${path.basename(zip, '.zip')}`);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  execFileSync('unzip', ['-q', '-o', zip, '-d', out]);
  const [root] = fs.readdirSync(out);
  const dest = path.join(VENDOR, pkg.name);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(path.join(out, root), dest);
  fs.rmSync(out, { recursive: true, force: true });
}

let done = 0;
const queue = packages
  .map((pkg, index) => ({ pkg, index }))
  .filter(({ pkg }) => !fs.existsSync(path.join(VENDOR, pkg.name, 'composer.json')));

console.log(`installing ${queue.length}/${packages.length} packages`);

async function worker(items) {
  for (const { pkg, index } of items) {
    try {
      const zip = await download(pkg, index);
      extract(zip, pkg);
      done += 1;
      if (done % 10 === 0) console.log(`  ${done}/${queue.length}`);
    } catch (error) {
      console.error(`  FAILED ${pkg.name}: ${error.message}`);
    }
  }
}

const WORKERS = 8;
const size = Math.ceil(queue.length / WORKERS);
await Promise.all(
  Array.from({ length: WORKERS }, (_, w) => worker(queue.slice(w * size, (w + 1) * size)))
);

const installed = packages.filter((pkg) =>
  fs.existsSync(path.join(VENDOR, pkg.name, 'composer.json'))
).length;
console.log(`vendor ready: ${installed}/${packages.length} packages`);
process.exit(installed === packages.length ? 0 : 1);
