import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime, createNodeFsMountHandler } from '@php-wasm/node';
const DB = process.argv[2] || '/tmp/jawebni/database/database.sqlite';
const runtimeId = await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 1 } });
const php = new PHP(runtimeId);
await php.mount('/jawebni', createNodeFsMountHandler('/home/user/JAWEBNI'));
php.chdir('/jawebni');
const r = await php.run({
  scriptPath: '/jawebni/sandbox-tools/test-serverless.php',
  relativeUri: process.argv[3] || '/login',
  method: 'GET',
  headers: { host: 'jawebni.vercel.app', 'x-forwarded-proto': 'https' },
  env: {
    APP_ENV: 'production', APP_DEBUG: 'false',
    APP_KEY: 'base64:c6YW+woES+8Wa3ryslZeaDDVTHBJI75AeoFbnaconMU=',
    DB_CONNECTION: 'sqlite', DB_DATABASE: DB,
    SESSION_DRIVER: 'cookie', CACHE_STORE: 'array', QUEUE_CONNECTION: 'sync',
    LOG_CHANNEL: 'stderr',
  },
});
const body = Buffer.from(r.bytes || []).toString('utf8');
console.log('status:', r.httpStatusCode, '| bytes:', body.length);
const m = body.match(/data-page="([^"]*)"/);
console.log('page  :', m ? m[1].slice(0, 70) : body.slice(0, 200).replace(/\s+/g, ' '));
console.log('diag  :', (body.match(/\[diag\][^\n]*/) || ['(none)'])[0]);
process.exit(r.httpStatusCode === 200 ? 0 : 1);
