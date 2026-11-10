// Production-like static server for QA / Lighthouse: brotli/gzip + cache headers like vercel.json.
// Usage: node scripts/qa/serve.mjs [port]
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = process.env.ROOT ? process.env.ROOT.replace(/[/]?$/, '/') : fileURLToPath(new URL('../../dist/', import.meta.url));
const port = +(process.argv[2] ?? 5000);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
};
const compressible = /^(text\/|application\/(json|manifest\+json|xml)|image\/svg)/;

http
  .createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = normalize(join(root, path));
    let status = 200;
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      await stat(file);
    } catch {
      if (!path.endsWith('/') && !extname(path)) {
        res.writeHead(308, { Location: path + '/' }).end();
        return;
      }
      file = join(root, '404.html');
      status = 404;
    }
    const type = types[extname(file)] ?? 'application/octet-stream';
    let body = await readFile(file);
    const headers = {
      'Content-Type': type,
      'Cache-Control': path.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    };
    const ae = req.headers['accept-encoding'] ?? '';
    if (compressible.test(type)) {
      if (ae.includes('br')) {
        body = zlib.brotliCompressSync(body);
        headers['Content-Encoding'] = 'br';
      } else if (ae.includes('gzip')) {
        body = zlib.gzipSync(body);
        headers['Content-Encoding'] = 'gzip';
      }
      headers.Vary = 'Accept-Encoding';
    }
    res.writeHead(status, headers).end(body);
  })
  .listen(port, () => console.log(`serving dist on http://localhost:${port}`));
