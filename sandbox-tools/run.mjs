// Runs a PHP script (usually `artisan`) through WebAssembly PHP.
import { spawn } from 'node:child_process';
import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime, createNodeFsMountHandler } from '@php-wasm/node';

const PROJECT = '/home/user/JAWEBNI';
const MOUNT = '/jawebni';

const [target, ...args] = process.argv.slice(2);
if (!target) {
  console.error('usage: node run.mjs <script|artisan> [args...]');
  process.exit(1);
}

const cliTarget = target === 'artisan'
  ? `${MOUNT}/artisan`
  : (target.startsWith('/') ? target : `${MOUNT}/${target}`);

const runtimeId = await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 1 } });
const php = new PHP(runtimeId);

// PHP cannot fork inside WebAssembly: forward shell calls to /bin/sh.
await php.setSpawnHandler((command, commandArgs = []) => {
  const parts = Array.isArray(command) ? command : [String(command), ...(commandArgs || [])];
  return spawn('/bin/sh', ['-c', parts.join(' ')], { stdio: ['pipe', 'pipe', 'pipe'] });
});

await php.mount(MOUNT, createNodeFsMountHandler(PROJECT));
php.chdir(MOUNT);

const response = await php.run({
  scriptPath: `${MOUNT}/sandbox-tools/php-cli.php`,
  args: [],
  env: {
    HOME: MOUNT,
    PATH: '/usr/local/bin:/usr/bin:/bin',
    COMPOSER: `${MOUNT}/composer.json`,
    COMPOSER_HOME: '/tmp/composer-home',
    COMPOSER_ALLOW_SUPERUSER: '1',
    APP_RUNNING_IN_CONSOLE: 'true',
    JAWEBNI_CLI_TARGET: cliTarget,
    JAWEBNI_CLI_ARGS: JSON.stringify(args),
  },
});

process.stdout.write(Buffer.from(response.bytes || []));
process.exit(response.exitCode === 0 ? 0 : (response.exitCode || 1));
