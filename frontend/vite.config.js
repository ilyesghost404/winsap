import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const certPath = path.resolve(__dirname, '192.168.100.50+2.pem');
const keyPath = path.resolve(__dirname, '192.168.100.50+2-key.pem');

const httpsConfig = fs.existsSync(certPath) && fs.existsSync(keyPath)
  ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  : false;

function httpToHttpsRedirectPlugin() {
  return {
    name: 'http-to-https-redirect',
    configureServer(server) {
      if (!server.httpServer) return;

      server.httpServer.on('connection', (socket) => {
        socket.once('data', (buffer) => {
          // If first byte is NOT 0x16 (TLS Handshake ClientHello), it's plain HTTP
          if (buffer.length > 0 && buffer[0] !== 0x16) {
            const reqStr = buffer.toString('utf8');
            const lines = reqStr.split('\r\n');
            const firstLine = lines[0] || '';
            const parts = firstLine.split(' ');
            const urlPath = parts[1] || '/';

            let host = '192.168.100.50:5173';
            const hostLine = lines.find((l) => l.toLowerCase().startsWith('host:'));
            if (hostLine) {
              const hostParts = hostLine.split(':');
              if (hostParts.length > 1) {
                host = hostParts.slice(1).join(':').trim();
              }
            }

            const redirectUrl = `https://${host}${urlPath}`;
            const response =
              `HTTP/1.1 301 Moved Permanently\r\n` +
              `Location: ${redirectUrl}\r\n` +
              `Content-Length: 0\r\n` +
              `Connection: close\r\n\r\n`;

            socket.write(response);
            socket.end();
          } else {
            // Push back TLS buffer for standard HTTPS processing
            socket.unshift(buffer);
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    httpToHttpsRedirectPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: httpsConfig,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
