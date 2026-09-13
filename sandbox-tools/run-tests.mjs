import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime, createNodeFsMountHandler } from '@php-wasm/node';
const PROJECT = '/home/user/JAWEBNI';
const MOUNT = '/jawebni';
const args = process.argv.slice(2);
const runtimeId = await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 1 } });
const php = new PHP(runtimeId);
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
    HOME: MOUNT, PATH: '/usr/local/bin:/usr/bin:/bin',
    COMPOSER_HOME: '/tmp/composer-home', COMPOSER_ALLOW_SUPERUSER: '1',
    APP_RUNNING_IN_CONSOLE: 'true',
    JAWEBNI_CLI_TARGET: `${MOUNT}/vendor/phpunit/phpunit/phpunit`,
    JAWEBNI_CLI_ARGS: JSON.stringify(args),
  },
});
const out = Buffer.from(response.bytes || []).toString('utf8');
process.stdout.write(out);
process.exit(response.exitCode === 0 ? 0 : 1);
