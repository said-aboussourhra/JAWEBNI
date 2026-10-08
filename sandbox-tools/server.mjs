// Serves the real Laravel application through WebAssembly PHP.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime, createNodeFsMountHandler } from '@php-wasm/node';

const PROJECT = '/home/user/JAWEBNI';
const MOUNT = '/jawebni';
const PORT = Number(process.env.PORT || 8000);

const MIME = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

const runtimeId = await loadNodeRuntime('8.3', { emscriptenOptions: { processId: 1 } });
const php = new PHP(runtimeId);

// PHP cannot spawn processes inside WebAssembly: forward calls to /bin/sh so
// shell_exec()/popen() used by Symfony (terminal detection) degrade gracefully.
await php.setSpawnHandler((command, args = [], options = {}) => {
  const parts = Array.isArray(command) ? command : [String(command), ...(args || [])];
  return spawn('/bin/sh', ['-c', parts.join(' ')], { stdio: ['pipe', 'pipe', 'pipe'] });
});

await php.mount(MOUNT, createNodeFsMountHandler(PROJECT));
php.chdir(MOUNT);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const publicPath = path.join(PROJECT, 'public', decodeURIComponent(url.pathname));

  // Serve real static assets (built JS/CSS/images) directly.
  if (url.pathname !== '/' && fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(publicPath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(publicPath).pipe(res);
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  try {
    const response = await php.run({
      scriptPath: MOUNT + '/sandbox-tools/router.php',
      relativeUri: url.pathname + (url.search || ''),
      method: req.method,
      headers: req.headers,
      body,
    });

    const headers = {};
    for (const [key, value] of Object.entries(response.headers || {})) {
      if (['transfer-encoding', 'connection'].includes(key.toLowerCase())) continue;
      // Multiple cookies must stay separate headers, otherwise the browser
      // only receives the first one (breaks the session cookie).
      headers[key] = key.toLowerCase() === 'set-cookie'
        ? (Array.isArray(value) ? value : [String(value)])
        : (Array.isArray(value) ? value.join(', ') : String(value));
    }

    const status = response.httpStatusCode || (response.exitCode === 0 ? 200 : 500);
    res.writeHead(status, headers);
    res.end(Buffer.from(response.bytes || []));
  } catch (error) {
    console.error('[php-error]', error?.message ?? error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal error: ' + (error?.message ?? error));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Jawebni running on http://0.0.0.0:${PORT}`);
});
