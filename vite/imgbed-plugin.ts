/**
 * 本地图床管理 API（仅 Vite dev / preview）。
 * 密码：.env IMGBED_PASSWORD；GitHub：复用 scripts/lib/image-cdn.mjs。
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, Connect } from 'vite';
// 脚本侧 ESM，无独立 .d.ts
import {
  buildImageInventory,
  collectContentImageHashes,
  deleteRemoteWebp,
  ensureUploaded,
  readDotEnv,
} from '../scripts/lib/image-cdn.mjs';

const API_PREFIX = '/api/imgbed';
const COOKIE_NAME = 'imgbed_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

type JsonBody = Record<string, unknown>;

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  headers?: Record<string, string>,
) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(payload);
}

function parseCookies(header: string | undefined) {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

async function resolvePassword() {
  return process.env.IMGBED_PASSWORD || (await readDotEnv('IMGBED_PASSWORD'));
}

function signSession(password: string, exp: number) {
  return createHmac('sha256', password).update(`imgbed:${exp}`).digest('hex');
}

function makeSessionCookie(password: string) {
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = signSession(password, exp);
  const value = `${exp}.${sig}`;
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function verifySession(req: IncomingMessage, password: string) {
  const raw = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!raw) return false;
  const [expStr, sig] = raw.split('.');
  const exp = Number(expStr);
  if (!expStr || !sig || !Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = signSession(password, exp);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req: IncomingMessage): Promise<JsonBody> {
  const buf = await readRawBody(req);
  if (!buf.length) return {};
  return JSON.parse(buf.toString('utf8')) as JsonBody;
}

async function readMultipartFiles(req: IncomingMessage) {
  const contentType = req.headers['content-type'] || '';
  const buf = await readRawBody(req);
  const request = new Request('http://imgbed.local/upload', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: new Uint8Array(buf),
  });
  const form = await request.formData();
  const files: { name: string; buf: Buffer }[] = [];
  for (const [key, value] of form.entries()) {
    if (key !== 'files' && key !== 'file') continue;
    if (typeof value === 'string') continue;
    const ab = await value.arrayBuffer();
    files.push({
      name: value.name || 'upload.bin',
      buf: Buffer.from(ab),
    });
  }
  return files;
}

function matchApi(url: string | undefined) {
  if (!url) return null;
  const path = url.split('?')[0] || '';
  if (!path.startsWith(API_PREFIX)) return null;
  return path.slice(API_PREFIX.length) || '/';
}

async function handleApi(
  req: IncomingMessage,
  res: ServerResponse,
  route: string,
) {
  const password = await resolvePassword();
  if (!password) {
    sendJson(res, 503, {
      error: '未配置 IMGBED_PASSWORD（写入项目 .env）',
    });
    return;
  }

  const method = (req.method || 'GET').toUpperCase();

  if (route === '/login' && method === 'POST') {
    const body = await readJson(req);
    const input = typeof body.password === 'string' ? body.password : '';
    const a = Buffer.from(input);
    const b = Buffer.from(password);
    const ok =
      a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
    if (!ok) {
      sendJson(res, 401, { error: '密码错误' });
      return;
    }
    sendJson(
      res,
      200,
      { ok: true },
      { 'Set-Cookie': makeSessionCookie(password) },
    );
    return;
  }

  if (route === '/logout' && method === 'POST') {
    sendJson(
      res,
      200,
      { ok: true },
      { 'Set-Cookie': clearSessionCookie() },
    );
    return;
  }

  if (route === '/session' && method === 'GET') {
    sendJson(res, 200, { ok: verifySession(req, password) });
    return;
  }

  if (!verifySession(req, password)) {
    sendJson(res, 401, { error: '未登录' });
    return;
  }

  if (route === '/list' && method === 'GET') {
    const inventory = await buildImageInventory();
    sendJson(res, 200, inventory);
    return;
  }

  if (route === '/upload' && method === 'POST') {
    const files = await readMultipartFiles(req);
    if (!files.length) {
      sendJson(res, 400, { error: '未收到文件（字段名 files）' });
      return;
    }
    const uploaded = [];
    for (const file of files) {
      const entry = await ensureUploaded({ buf: file.buf });
      uploaded.push({
        name: file.name,
        hash: entry.hash,
        cdn: entry.cdn,
        w: entry.w,
        h: entry.h,
      });
    }
    sendJson(res, 200, { uploaded });
    return;
  }

  if (route === '/delete' && method === 'POST') {
    const body = await readJson(req);
    const hashes = Array.isArray(body.hashes)
      ? body.hashes.filter((h): h is string => typeof h === 'string')
      : [];
    if (!hashes.length) {
      sendJson(res, 400, { error: 'hashes 不能为空' });
      return;
    }
    const referenced = await collectContentImageHashes();
    const results = [];
    for (const hash of hashes) {
      results.push(await deleteRemoteWebp(hash, { referenced }));
    }
    sendJson(res, 200, { results });
    return;
  }

  sendJson(res, 404, { error: 'unknown endpoint' });
}

function createMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const route = matchApi(req.url);
    if (!route) {
      next();
      return;
    }
    handleApi(req, res, route).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[imgbed]', message);
      if (!res.headersSent) {
        sendJson(res, 500, { error: message });
      }
    });
  };
}

export function imgbedPlugin(): Plugin {
  return {
    name: 'imgbed-api',
    configureServer(server) {
      server.middlewares.use(createMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMiddleware());
    },
  };
}
