import type { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serverConfig } from '../config.js';

/**
 * Proxies API requests to the backend and forwards the JWT Authorization header.
 * In production, set VITE_API_URL=/v1 so the browser hits this proxy (same origin).
 */
export function mountApiProxy(app: Express): void {
  app.use(
    serverConfig.apiProxyPath,
    createProxyMiddleware({
      target: serverConfig.apiProxyTarget,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req) => {
          const authorization = req.headers.authorization;
          if (authorization) {
            proxyReq.setHeader('Authorization', authorization);
          }
        },
      },
    }),
  );
}
