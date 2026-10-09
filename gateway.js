const http = require('http');
const path = require('path');

let httpProxy;
try {
  httpProxy = require('http-proxy');
} catch (e) {
  try {
    httpProxy = require(path.join(__dirname, 'web', 'node_modules', 'http-proxy'));
  } catch (err) {
    console.error('Failed to load http-proxy. Please run: cd web && npm install');
    process.exit(1);
  }
}

const proxy = httpProxy.createProxyServer({
  ws: true,
  xfwd: true,
  changeOrigin: true,
});

proxy.on('error', (err, req, res) => {
  // Gracefully handle client aborts or backend restart hiccups
  if (err.code !== 'ECONNRESET' && err.code !== 'EPIPE') {
    console.error('[Gateway Proxy Error]:', err.message);
  }
  if (res && res.writeHead && !res.headersSent) {
    try {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Gateway Notice: Service is connecting or starting up, please refresh in a moment.');
    } catch (e) {}
  }
});

const BACKEND_TARGET = process.env.BACKEND_TARGET || 'http://127.0.0.1:8000';
const FRONTEND_TARGET = process.env.FRONTEND_TARGET || 'http://127.0.0.1:3001';

const server = http.createServer((req, res) => {
  if (
    req.url.startsWith('/api') ||
    req.url.startsWith('/uploads') ||
    req.url.startsWith('/docs') ||
    req.url.startsWith('/openapi.json')
  ) {
    proxy.web(req, res, { target: BACKEND_TARGET });
  } else {
    proxy.web(req, res, { target: FRONTEND_TARGET });
  }
});

server.on('upgrade', (req, socket, head) => {
  socket.on('error', (err) => {
    // Ignore client socket disconnects
  });

  if (req.url.startsWith('/ws')) {
    proxy.ws(req, socket, head, { target: BACKEND_TARGET });
  } else {
    proxy.ws(req, socket, head, { target: FRONTEND_TARGET });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Adda Unified Gateway running on http://0.0.0.0:${PORT}`);
  console.log(`  -> Web Frontend (Next.js): ${FRONTEND_TARGET}`);
  console.log(`  -> REST API & WebSockets (FastAPI): ${BACKEND_TARGET}`);
});
