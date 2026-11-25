/**
 * Typora 图床：无损 WebP 上传到 GitHub（jsDelivr 加速）。
 * Token：GITHUB_TOKEN → .env → git credential（仅本地）。
 */

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { appendFile, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Octokit } from "@octokit/rest";
import {
  buildImageAssets,
  hashFromCdnUrl,
  loadImageMeta,
  removeImageMeta,
  upsertImageMeta,
} from "../../src/lib/image-meta.mjs";

const execFileAsync = promisify(execFile);

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const CONTENT_ROOTS = [path.join(ROOT, "src/content")];
const MD_IMAGE = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_IMAGE = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;
const REMOTE_WEBP = /^w\/[0-9a-f]{2}\/([0-9a-f]{16})\.webp$/i;

const UPLOAD_LOG = path.join(ROOT, ".typora-upload.log");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 记录 Typora 每次怎么调脚本（并行/批量一目了然） */
export async function logUploadInvocation(argv) {
  const line = `${new Date().toISOString()} pid=${process.pid} n=${argv.length} ${argv.join("\t")}\n`;
  await appendFile(UPLOAD_LOG, line).catch(() => {});
}

export const IMAGE_REPO = process.env.IMAGE_REPO || "abeixiaolu/imgs";
export const CDN_HOST = (
  process.env.IMAGE_CDN_HOST || "https://fastly.jsdelivr.net"
).replace(/\/$/, "");

/** 正文允许的图床 URL 前缀（commit hook 共用） */
export const CDN_URL_PREFIX = `${CDN_HOST}/gh/${IMAGE_REPO}@`;

export function remotePathFor(hash) {
  return `w/${hash.slice(0, 2)}/${hash}.webp`;
}

export function cdnUrl(commit, remotePath) {
  return `${CDN_HOST}/gh/${IMAGE_REPO}@${commit}/${remotePath}`;
}

export function contentHash(buf) {
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

export function isAllowedCdnUrl(url) {
  return typeof url === "string" && url.startsWith(CDN_URL_PREFIX);
}

/** 读取项目根 .env 中的单个键（不导出到前端） */
export async function readDotEnv(key) {
  try {
    const text = await readFile(path.join(ROOT, ".env"), "utf8");
    const re = new RegExp(`^\\s*${key}\\s*=\\s*(.+?)\\s*$`);
    for (const line of text.split("\n")) {
      const m = line.match(re);
      if (!m) continue;
      return m[1].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* 无 .env */
  }
  return null;
}

async function readDotEnvToken() {
  return readDotEnv("GITHUB_TOKEN");
}

async function readGitCredentialToken() {
  try {
    const { stdout } = await execFileAsync("git", ["credential", "fill"], {
      input: "protocol=https\nhost=github.com\n\n",
      cwd: ROOT,
    });
    const line = stdout.split("\n").find((l) => l.startsWith("password="));
    return line ? line.slice("password=".length) : null;
  } catch {
    return null;
  }
}

export async function resolveToken() {
  return (
    process.env.GITHUB_TOKEN ||
    (await readDotEnvToken()) ||
    (await readGitCredentialToken()) ||
    null
  );
}

async function fileExists(octokit, owner, repo, remotePath) {
  try {
    await octokit.repos.getContent({ owner, repo, path: remotePath });
    return true;
  } catch (err) {
    if (err?.status === 404) return false;
    throw err;
  }
}

async function lastCommitForPath(octokit, owner, repo, remotePath) {
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    path: remotePath,
    per_page: 1,
  });
  const sha = data[0]?.sha;
  if (!sha) throw new Error(`找不到 ${remotePath} 的 commit`);
  return sha;
}

/**
 * Typora 粘贴多图时常并行起多个进程；Contents API 同分支并发写会 409。
 * 不做进程锁（锁会让后到的进程空等，Typora 直接放弃，只剩 1 张）。
 * 这里对 409/422 退避重试；422 多半是文件已被别的进程写上。
 */
async function uploadWebp(octokit, owner, repo, remotePath, webpBuf, log) {
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: remotePath,
        message: `upload ${remotePath}`,
        content: webpBuf.toString("base64"),
      });
      const sha = data.commit?.sha;
      if (!sha) throw new Error(`上传 ${remotePath} 未返回 commit sha`);
      return sha;
    } catch (err) {
      const status = err?.status;
      if (status === 422) {
        // 文件已存在但未带 sha，或被并发写上
        if (await fileExists(octokit, owner, repo, remotePath)) {
          log(`并发已写入 ${remotePath}，改用已有 commit`);
          return lastCommitForPath(octokit, owner, repo, remotePath);
        }
      }
      if ((status !== 409 && status !== 422) || attempt === maxAttempts) {
        throw err;
      }
      const wait = Math.min(4000, 150 * 2 ** (attempt - 1)) + Math.random() * 300;
      log(`GitHub ${status}，${Math.round(wait)}ms 后重试 (${attempt}/${maxAttempts})`);
      await sleep(wait);
    }
  }
  throw new Error(`上传 ${remotePath} 重试耗尽`);
}

/**
 * @param {{ buf: Buffer, log?: (msg: string) => void }} opts
 */
export async function ensureUploaded({ buf, log = () => {} }) {
  const token = await resolveToken();
  if (!token) {
    throw new Error(
      "缺少 GITHUB_TOKEN：可写入项目 .env，或 export GITHUB_TOKEN=...",
    );
  }

  const [owner, repo] = IMAGE_REPO.split("/");
  if (!owner || !repo) throw new Error(`IMAGE_REPO 无效: ${IMAGE_REPO}`);

  const hash = contentHash(buf);
  const remotePath = remotePathFor(hash);
  const octokit = new Octokit({ auth: token });

  const assets = await buildImageAssets(buf);
  const metaWrite = await upsertImageMeta(hash, {
    w: assets.w,
    h: assets.h,
    color: assets.color,
    lqip: assets.lqip,
  });
  log(
    metaWrite.changed
      ? `meta ${hash} ${assets.w}×${assets.h} ${assets.color}`
      : `meta ${hash} 已是最新`,
  );
  log(
    `encode ${assets.encoding} ${buf.length} → ${assets.webp.length} bytes` +
      (assets.webp.length > buf.length ? "（大于原文件）" : ""),
  );

  let commit;
  if (await fileExists(octokit, owner, repo, remotePath)) {
    commit = await lastCommitForPath(octokit, owner, repo, remotePath);
    log(`已存在 ${remotePath} @ ${commit.slice(0, 7)}`);
  } else {
    // 并行进程错峰，降低同时 PUT 撞 409 的概率
    await sleep((Number.parseInt(hash.slice(0, 2), 16) % 7) * 120);
    commit = await uploadWebp(
      octokit,
      owner,
      repo,
      remotePath,
      assets.webp,
      log,
    );
    log(`上传 → ${remotePath} (${buf.length} → ${assets.webp.length} bytes)`);
  }

  return {
    hash,
    path: remotePath,
    commit,
    cdn: cdnUrl(commit, remotePath),
    w: assets.w,
    h: assets.h,
  };
}

async function createOctokit() {
  const token = await resolveToken();
  if (!token) {
    throw new Error(
      "缺少 GITHUB_TOKEN：可写入项目 .env，或 export GITHUB_TOKEN=...",
    );
  }
  const [owner, repo] = IMAGE_REPO.split("/");
  if (!owner || !repo) throw new Error(`IMAGE_REPO 无效: ${IMAGE_REPO}`);
  return { octokit: new Octokit({ auth: token }), owner, repo };
}

async function listMarkdown(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err?.code === "ENOENT") return out;
    throw err;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await listMarkdown(full)));
      continue;
    }
    if (ent.isFile() && /\.mdx?$/i.test(ent.name)) out.push(full);
  }
  return out;
}

function stripCodeFences(text) {
  return text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]+`/g, "");
}

/** 从 Markdown 正文抽出图片 URL（跳过代码块） */
export function collectContentImageUrls(text) {
  const body = stripCodeFences(text);
  const urls = [];
  for (const re of [MD_IMAGE, HTML_IMAGE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(body))) urls.push(m[1]);
  }
  return urls;
}

/** 扫描 src/content，收集正文引用的图床 hash */
export async function collectContentImageHashes() {
  const files = (
    await Promise.all(CONTENT_ROOTS.map((d) => listMarkdown(d)))
  ).flat();
  const hashes = new Set();
  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const url of collectContentImageUrls(text)) {
      const hash = hashFromCdnUrl(url);
      if (hash) hashes.add(hash);
    }
  }
  return hashes;
}

/**
 * 列出图床仓库中全部 w/{xx}/{hash}.webp
 * @returns {Promise<{ commit: string, items: { hash: string, path: string, cdn: string }[] }>}
 */
export async function listRemoteWebps() {
  const { octokit, owner, repo } = await createOctokit();
  const { data: repoInfo } = await octokit.repos.get({ owner, repo });
  const branch = repoInfo.default_branch || "main";
  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const commit = ref.object.sha;
  const { data: commitData } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: commit,
  });
  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: commitData.tree.sha,
    recursive: "true",
  });

  const items = [];
  for (const node of tree.tree ?? []) {
    if (node.type !== "blob" || !node.path) continue;
    const m = node.path.match(REMOTE_WEBP);
    if (!m) continue;
    const hash = m[1].toLowerCase();
    items.push({
      hash,
      path: node.path,
      cdn: cdnUrl(commit, node.path),
    });
  }
  items.sort((a, b) => a.hash.localeCompare(b.hash));
  return { commit, items };
}

/**
 * 删除图床上的单个 WebP，并清本地 meta。
 * @param {string} hash
 * @param {{ allowReferenced?: boolean, referenced?: Set<string> }} [opts]
 */
export async function deleteRemoteWebp(hash, opts = {}) {
  const key = hash.toLowerCase();
  if (!/^[0-9a-f]{16}$/.test(key)) {
    throw new Error(`无效 hash: ${hash}`);
  }

  const referenced =
    opts.referenced ?? (await collectContentImageHashes());
  if (!opts.allowReferenced && referenced.has(key)) {
    throw new Error(`仍被正文引用，拒绝删除: ${key}`);
  }

  const remotePath = remotePathFor(key);
  const { octokit, owner, repo } = await createOctokit();

  let deletedRemote = false;
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: remotePath,
    });
    if (Array.isArray(data) || !("sha" in data) || !data.sha) {
      throw new Error(`无法删除目录路径: ${remotePath}`);
    }
    await octokit.repos.deleteFile({
      owner,
      repo,
      path: remotePath,
      message: `delete ${remotePath}`,
      sha: data.sha,
    });
    deletedRemote = true;
  } catch (err) {
    if (err?.status !== 404) throw err;
  }

  const meta = await removeImageMeta(key);
  return {
    hash: key,
    deletedRemote,
    removedMeta: meta.removed,
  };
}

/**
 * 合并远程文件 + meta + 正文引用，供管理页列表使用。
 */
export async function buildImageInventory() {
  const [{ items: remote }, meta, referenced] = await Promise.all([
    listRemoteWebps(),
    loadImageMeta({ fresh: true }),
    collectContentImageHashes(),
  ]);

  const byHash = new Map();
  for (const item of remote) {
    byHash.set(item.hash, {
      hash: item.hash,
      path: item.path,
      cdn: item.cdn,
      onRemote: true,
      inMeta: false,
      referenced: referenced.has(item.hash),
    });
  }

  for (const [hash, entry] of Object.entries(meta)) {
    const key = hash.toLowerCase();
    const existing = byHash.get(key);
    if (existing) {
      existing.inMeta = true;
      existing.w = entry.w;
      existing.h = entry.h;
      existing.color = entry.color;
      existing.lqip = entry.lqip;
      continue;
    }
    const remotePath = remotePathFor(key);
    byHash.set(key, {
      hash: key,
      path: remotePath,
      cdn: null,
      onRemote: false,
      inMeta: true,
      referenced: referenced.has(key),
      w: entry.w,
      h: entry.h,
      color: entry.color,
      lqip: entry.lqip,
    });
  }

  const items = [...byHash.values()].sort((a, b) =>
    a.hash.localeCompare(b.hash),
  );
  return {
    items,
    stats: {
      total: items.length,
      remote: remote.length,
      meta: Object.keys(meta).length,
      referenced: referenced.size,
      orphan: items.filter((i) => !i.referenced).length,
    },
  };
}
