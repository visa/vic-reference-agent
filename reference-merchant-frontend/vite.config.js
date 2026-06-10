/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Backend target and shared secret for the dev proxy. Read from the dev
// shell environment (NOT a VITE_-prefixed var), so the key stays in the Node
// dev-server process and is never inlined into the client bundle.
const BACKEND_TARGET = process.env.MERCHANT_BACKEND_URL || 'http://localhost:8001';
const MERCHANT_API_KEY = process.env.MERCHANT_API_KEY;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
    headers: {
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
    },
    // Same-origin /api proxy. The dev server injects X-Api-Key server-side so
    // the storefront code never has to hold the merchant secret.
    proxy: {
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (MERCHANT_API_KEY) {
              proxyReq.setHeader('X-Api-Key', MERCHANT_API_KEY);
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
