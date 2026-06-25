/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** Backend origin for top-level navigations (e.g. Google OAuth entry point). */
  readonly VITE_BACKEND_ORIGIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
