/// <reference types="vite/client" />
/// <reference types="../file-routes.d.ts" />

declare module 'virtual:site-content' {
  import type { SiteContent } from './lib/content';
  const content: SiteContent;
  export default content;
}
