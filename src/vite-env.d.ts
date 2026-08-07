/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KNOWLEDGE_DATA_MODE?: "mock" | "remote";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
