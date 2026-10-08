// Generates vendor/autoload.php without Composer (proc_open is unavailable in WebAssembly).
import fs from 'node:fs';
import path from 'node:path';

const PROJECT = '/home/user/JAWEBNI';
const VENDOR = path.join(PROJECT, 'vendor');
const lock = JSON.parse(fs.readFileSync(path.join(PROJECT, 'composer.lock'), 'utf8'));
const rootComposer = JSON.parse(fs.readFileSync(path.join(PROJECT, 'composer.json'), 'utf8'));

const psr4 = {};
const psr0 = {};
const classMap = {};
const files = [];

const PHP_FILE = /\.(php|inc)$/i;

function addPsr4(target, prefix, paths) {
  const list = Array.isArray(paths) ? paths : [paths];
  for (const p of list) {
    target[prefix] = target[prefix] || [];
    target[prefix].push(p);
  }
}

function* walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Composer's classmap generator does not skip anything: PHPUnit ships
      // real classes under src/Event/Events/Test/, which a naive "skip test
      // directories" rule would drop from the map.
      yield* walk(full);
    } else if (PHP_FILE.test(entry.name)) {
      yield full;
    }
  }
}

function classesInFile(file) {
  let source = fs.readFileSync(file, 'utf8');
  if (source.length > 400000) return [];
  const nsMatch = source.match(/^\s*namespace\s+([^;{\s]+)\s*[;{]/m);
  const namespace = nsMatch ? nsMatch[1] + '\\' : '';
  const found = [];
  const re = /^\s*(?:(?:final|abstract|readonly)\s+)*(?:class|interface|trait|enum)\s+(\w+)/gm;
  let match;
  while ((match = re.exec(source)) !== null) found.push(namespace + match[1]);
  return found;
}

function scanClassMapDir(absDir, mapTo) {
  for (const file of walk(absDir)) {
    for (const fqcn of classesInFile(file)) {
      if (!classMap[fqcn]) classMap[fqcn] = mapTo(file);
    }
  }
}

function toPhpPath(absPath) {
  const rel = path.relative(PROJECT, absPath);
  if (rel.startsWith('vendor' + path.sep)) {
    return "$vendorDir . '/' . " + JSON.stringify(rel.slice('vendor/'.length));
  }
  return "$baseDir . '/' . " + JSON.stringify(rel);
}

function autoloadOf(pkgDir, spec) {
  if (!spec) return;
  for (const [prefix, paths] of Object.entries(spec['psr-4'] || {})) {
    addPsr4(psr4, prefix, (Array.isArray(paths) ? paths : [paths]).map((p) =>
      toPhpPath(path.join(pkgDir, p))
    ));
  }
  for (const [prefix, paths] of Object.entries(spec['psr-0'] || {})) {
    if (prefix === '') {
      for (const p of Array.isArray(paths) ? paths : [paths]) {
        psr0[''] = psr0[''] || [];
        psr0[''].push(toPhpPath(path.join(pkgDir, p)));
      }
    } else {
      addPsr4(psr0, prefix, (Array.isArray(paths) ? paths : [paths]).map((p) =>
        toPhpPath(path.join(pkgDir, p))
      ));
    }
  }
  for (const p of spec.classmap || []) {
    scanClassMapDir(path.join(pkgDir, p), (file) => toPhpPath(file));
  }
  for (const p of spec.files || []) {
    files.push(toPhpPath(path.join(pkgDir, p)));
  }
}

// 1. Application (root) autoload, including autoload-dev.
autoloadOf(PROJECT, rootComposer.autoload);
autoloadOf(PROJECT, rootComposer['autoload-dev']);

// 2. Every installed dependency.
for (const pkg of [...(lock.packages || []), ...(lock['packages-dev'] || [])]) {
  const dir = path.join(VENDOR, pkg.name);
  if (!fs.existsSync(path.join(dir, 'composer.json'))) continue;
  const json = JSON.parse(fs.readFileSync(path.join(dir, 'composer.json'), 'utf8'));
  autoloadOf(dir, json.autoload);
}

// 3. Laravel package discovery data (PackageManifest reads installed.json).
const installedPackages = [...(lock.packages || []), ...(lock['packages-dev'] || [])].map((pkg) => ({
  ...pkg,
  'install-path': '../' + pkg.name,
}));
fs.mkdirSync(path.join(VENDOR, 'composer'), { recursive: true });
fs.writeFileSync(
  path.join(VENDOR, 'composer', 'installed.json'),
  JSON.stringify(
    {
      packages: installedPackages,
      dev: true,
      'dev-package-names': (lock['packages-dev'] || []).map((p) => p.name),
    },
    null,
    1
  )
);

// 4. installed.php (Composer\InstalledVersions data).
const versions = {};
for (const pkg of installedPackages) {
  versions[pkg.name] = {
    pretty_version: pkg.version,
    version: pkg.version.replace(/^v/, ''),
    reference: pkg.source?.reference ?? null,
    type: pkg.type || 'library',
    install_path: `$vendorDir/${pkg.name}`,
    aliases: [],
    dev_requirement: (lock['packages-dev'] || []).some((p) => p.name === pkg.name),
  };
}
const rootPkg = {
  name: rootComposer.name || 'jawebni/jawebni',
  pretty_version: 'dev-main',
  version: 'dev-main',
  reference: null,
  type: 'project',
  install_path: '$baseDir',
  aliases: [],
  dev: true,
};
versions[rootPkg.name] = { ...rootPkg, dev_requirement: false, install_path: '$baseDir' };

fs.writeFileSync(
  path.join(VENDOR, 'composer', 'installed.php'),
  `<?php return ${phpExport({
    root: rootPkg,
    versions,
  })};\n`
);

function phpExport(value, indent = 0) {
  const pad = '  '.repeat(indent);
  // Generated path expressions ($vendorDir / $baseDir) must stay PHP code.
  if (typeof value === 'string' && /^\$(vendorDir|baseDir)\b/.test(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'array()';
    const items = value.map((v) => `${pad}  ${phpExport(v, indent + 1)}`);
    return `array(\n${items.join(',\n')}\n${pad})`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return 'array()';
    const items = entries.map(
      ([k, v]) => `${pad}  ${JSON.stringify(k)} => ${phpExport(v, indent + 1)}`
    );
    return `array(\n${items.join(',\n')}\n${pad})`;
  }
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return JSON.stringify(String(value));
}

// 5. autoload_*.php maps.
function mapFile(file, data) {
  const lines = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  ${JSON.stringify(k)} => ${phpExport(v, 1)},`);
  fs.writeFileSync(path.join(VENDOR, 'composer', file), `<?php\n\nreturn array(\n${lines.join('\n')}\n);\n`);
}

mapFile('autoload_psr4.php', psr4);
mapFile('autoload_namespaces.php', psr0);
mapFile('autoload_classmap.php', classMap);
fs.writeFileSync(
  path.join(VENDOR, 'composer', 'autoload_files.php'),
  `<?php\n\nreturn array(\n${files.map((f) => `  ${JSON.stringify(f)} => ${f},`).join('\n')}\n);\n`
);

fs.copyFileSync(
  path.join(PROJECT, 'sandbox-tools', 'stubs', 'ClassLoader.php'),
  path.join(VENDOR, 'composer', 'ClassLoader.php')
);
fs.copyFileSync(
  path.join(PROJECT, 'sandbox-tools', 'stubs', 'InstalledVersions.php'),
  path.join(VENDOR, 'composer', 'InstalledVersions.php')
);

fs.writeFileSync(
  path.join(VENDOR, 'autoload.php'),
  `<?php

// autoload.php generated by sandbox-tools/make-autoload.mjs (Composer cannot run here).

require_once __DIR__ . '/composer/ClassLoader.php';
require_once __DIR__ . '/composer/InstalledVersions.php';

$vendorDir = __DIR__;
$baseDir = dirname($vendorDir);

$loader = new \\Composer\\Autoload\\ClassLoader();

foreach (require __DIR__ . '/composer/autoload_psr4.php' as $prefix => $paths) {
    $loader->setPsr4($prefix, $paths);
}

foreach (require __DIR__ . '/composer/autoload_namespaces.php' as $prefix => $paths) {
    $loader->set($prefix, $paths);
}

$loader->addClassMap(require __DIR__ . '/composer/autoload_classmap.php');
$loader->register(true);

foreach (require __DIR__ . '/composer/autoload_files.php' as $file) {
    require_once $file;
}

return $loader;
`
);

console.log(
  `autoload generated: psr4=${Object.keys(psr4).length} psr0=${Object.keys(psr0).length} ` +
    `classmap=${Object.keys(classMap).length} files=${files.length}`
);
