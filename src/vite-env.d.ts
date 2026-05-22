/// <reference types="vite/client" />

declare module "*.png"

declare module '*.css' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}