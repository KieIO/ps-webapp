export const serverConfig = {
  port: Number(process.env.PORT ?? 3000),
  /** Backend origin without trailing slash, e.g. https://api.pokeslide-internal.com */
  apiProxyTarget: process.env.API_PROXY_TARGET ?? 'https://api.pokeslide-internal.com',
  /** Path prefix proxied to the backend, must match VITE_API_URL in production */
  apiProxyPath: process.env.API_PROXY_PATH ?? '/v1',
} as const;
