export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  appName: import.meta.env.VITE_APP_NAME as string,
  appVersion: import.meta.env.VITE_APP_VERSION as string,
  tokenKey: import.meta.env.VITE_TOKEN_KEY as string,
  enableQueryDevtools: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true',
  /** Dev-only: bypass API and use mock accounts (default on in `npm run dev`). */
  useAuthMock: import.meta.env.DEV && import.meta.env.VITE_USE_AUTH_MOCK !== 'false',
} as const;
