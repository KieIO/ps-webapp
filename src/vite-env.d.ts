/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_TOKEN_KEY: string;
  readonly VITE_ENABLE_QUERY_DEVTOOLS: string;
  readonly VITE_USE_AUTH_MOCK?: string;
  readonly VITE_USE_USERS_MOCK?: string;
  readonly VITE_USE_PROJECTS_MOCK?: string;
  readonly VITE_USE_TRACKER_MOCK?: string;
  readonly VITE_USE_TASKS_MOCK?: string;
  readonly VITE_USE_TITLES_MOCK?: string;
  readonly VITE_USE_TASK_SCORES_MOCK?: string;
  readonly VITE_USE_CAPACITY_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
