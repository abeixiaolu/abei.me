/**
 * Typora 图床：无损 WebP 上传到 GitHub（jsDelivr 加速）。
 * Token：GITHUB_TOKEN → .env → git credential（仅本地）。
 */

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Octokit } from "@octokit/rest";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
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

async function readDotEnvToken() {
  try {
    const text = await readFile(path.join(ROOT, ".env"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*GITHUB_TOKEN\s*=\s*(.+?)\s*$/);
      if (!m) continue;
      return m[1].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* 无 .env */
  }
  return null;
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

async function uploadWebp(octokit, owner, repo, remotePath, webpBuf) {
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

  let commit;
  if (await fileExists(octokit, owner, repo, remotePath)) {
    commit = await lastCommitForPath(octokit, owner, repo, remotePath);
    log(`已存在 ${remotePath} @ ${commit.slice(0, 7)}`);
  } else {
    const webp = await sharp(buf).webp({ lossless: true }).toBuffer();
    commit = await uploadWebp(octokit, owner, repo, remotePath, webp);
    log(`上传 → ${remotePath} (${buf.length} → ${webp.length} bytes)`);
  }

  return {
    hash,
    path: remotePath,
    commit,
    cdn: cdnUrl(commit, remotePath),
  };
}
