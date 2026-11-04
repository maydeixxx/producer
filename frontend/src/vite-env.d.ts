/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TASK_API?: string;
  readonly VITE_SCAN_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
