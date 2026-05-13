/// <reference types="vite/client" />

declare module "*.png"

declare module '*.css' {
  const content: string
  export default content
}
