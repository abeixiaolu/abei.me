declare module '*image-cdn.mjs' {
  export const ROOT: string;
  export const IMAGE_REPO: string;
  export const CDN_HOST: string;
  export const CDN_URL_PREFIX: string;

  export function remotePathFor(hash: string): string;
  export function cdnUrl(commit: string, remotePath: string): string;
  export function contentHash(buf: Buffer): string;
  export function isAllowedCdnUrl(url: string): boolean;
  export function readDotEnv(key: string): Promise<string | null>;
  export function resolveToken(): Promise<string | null>;
  export function logUploadInvocation(argv: string[]): Promise<void>;
  export function collectContentImageUrls(text: string): string[];
  export function collectContentImageHashes(): Promise<Set<string>>;

  export function ensureUploaded(opts: {
    buf: Buffer;
    log?: (msg: string) => void;
  }): Promise<{
    hash: string;
    path: string;
    commit: string;
    cdn: string;
    w: number;
    h: number;
  }>;

  export function listRemoteWebps(): Promise<{
    commit: string;
    items: { hash: string; path: string; cdn: string }[];
  }>;

  export function deleteRemoteWebp(
    hash: string,
    opts?: { allowReferenced?: boolean; referenced?: Set<string> },
  ): Promise<{
    hash: string;
    deletedRemote: boolean;
    removedMeta: boolean;
  }>;

  export function buildImageInventory(): Promise<{
    items: Array<{
      hash: string;
      path: string;
      cdn: string | null;
      onRemote: boolean;
      inMeta: boolean;
      referenced: boolean;
      w?: number;
      h?: number;
      color?: string;
      lqip?: string;
    }>;
    stats: {
      total: number;
      remote: number;
      meta: number;
      referenced: number;
      orphan: number;
    };
  }>;
}
