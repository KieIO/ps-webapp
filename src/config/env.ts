export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  appName: import.meta.env.VITE_APP_NAME as string,
  appVersion: import.meta.env.VITE_APP_VERSION as string,
  tokenKey: import.meta.env.VITE_TOKEN_KEY as string,
  enableQueryDevtools: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true',
  /** Opt-in only: set `VITE_USE_AUTH_MOCK=true` to bypass login API in dev. */
  useAuthMock: import.meta.env.VITE_USE_AUTH_MOCK === 'true',
  /** Opt-in only: set `VITE_USE_USERS_MOCK=true` to use in-memory user data. */
  useUsersMock: import.meta.env.VITE_USE_USERS_MOCK === 'true',
  /** Opt-in only: set `VITE_USE_TRACKER_MOCK=true` to use in-memory tracker data. */
  useTrackerMock: import.meta.env.VITE_USE_TRACKER_MOCK === 'true',
  /** Opt-in only: set `VITE_USE_PROJECTS_MOCK=true` to use in-memory projects data. */
  useProjectsMock: import.meta.env.VITE_USE_PROJECTS_MOCK === 'true',
  /** Opt-in only: set `VITE_USE_TASKS_MOCK=true` to use in-memory my-tasks data. */
  useTasksMock: import.meta.env.VITE_USE_TASKS_MOCK === 'true',
  /** Opt-in only: set `VITE_USE_TITLES_MOCK=true` to use in-memory title data. */
  useTitlesMock: import.meta.env.VITE_USE_TITLES_MOCK === 'true',
  /** Opt-in only: set `VITE_USE_TASK_SCORES_MOCK=true` to use in-memory task score data. */
  useTaskScoresMock: import.meta.env.VITE_USE_TASK_SCORES_MOCK === 'true',
  /** Opt-in only: set `VITE_USE_CAPACITY_MOCK=true` to use in-memory capacity data. */
  useCapacityMock: import.meta.env.VITE_USE_CAPACITY_MOCK === 'true',
} as const;
