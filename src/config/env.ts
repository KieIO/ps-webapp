export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  appName: import.meta.env.VITE_APP_NAME as string,
  appVersion: import.meta.env.VITE_APP_VERSION as string,
  tokenKey: import.meta.env.VITE_TOKEN_KEY as string,
  enableQueryDevtools: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true',
  /** Dev-only: bypass API and use mock accounts (default on in `npm run dev`). */
  useAuthMock: import.meta.env.DEV && import.meta.env.VITE_USE_AUTH_MOCK !== 'false',
  /** Dev-only: bypass API and use in-memory user data (default on in `npm run dev`). */
  useUsersMock: import.meta.env.DEV && import.meta.env.VITE_USE_USERS_MOCK !== 'false',
  /** Dev-only: bypass API and use in-memory project tracker data (default on in `npm run dev`). */
  useTrackerMock: import.meta.env.DEV && import.meta.env.VITE_USE_TRACKER_MOCK !== 'false',
  /** Dev-only: bypass API and use in-memory projects data (default on in `npm run dev`). */
  useProjectsMock: import.meta.env.DEV && import.meta.env.VITE_USE_PROJECTS_MOCK !== 'false',
  /** Dev-only: bypass API and use in-memory my-tasks data (default on in `npm run dev`). */
  useTasksMock: import.meta.env.DEV && import.meta.env.VITE_USE_TASKS_MOCK !== 'false',
  /** Dev-only: bypass API and use in-memory title data (default on in `npm run dev`). */
  useTitlesMock: import.meta.env.DEV && import.meta.env.VITE_USE_TITLES_MOCK !== 'false',
  /** Dev-only: bypass API and use in-memory task score data (default on in `npm run dev`). */
  useTaskScoresMock: import.meta.env.DEV && import.meta.env.VITE_USE_TASK_SCORES_MOCK !== 'false',
} as const;
