import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
} from 'solid-js';
import Badge from '../../components/Badge';
import Checkbox from '../../components/Checkbox';
import Seo from '../../components/Seo';
import StnHeader from '../../components/StnHeader';
import { bindImageLightbox } from '../../lib/image-lightbox';
import { bindImageLoading } from '../../lib/image-loading';
import { notify } from '../../lib/toast';

type ImgItem = {
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
};

type Inventory = {
  items: ImgItem[];
  stats: {
    total: number;
    remote: number;
    meta: number;
    referenced: number;
    orphan: number;
  };
};

type Filter = 'all' | 'orphan';

function frameStyle(item: ImgItem) {
  const parts: string[] = [];
  if (item.color) parts.push(`--ph-color:${item.color}`);
  // 不加引号：与 rehype-image-size / Film 一致
  if (item.lqip) parts.push(`--lqip:url(${item.lqip})`);
  return parts.length ? parts.join(';') : undefined;
}


async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  try {
    const res = await fetch(`/api/imgbed${path}`, {
      credentials: 'include',
      ...init,
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      ok?: boolean;
    } & T;
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data.error || `HTTP ${res.status}`,
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      status: 0,
      error: '无法连接本地 API（请用 pnpm dev 打开）',
    };
  }
}

export default function ImgbedAdmin() {
  const [authed, setAuthed] = createSignal<boolean | null>(null);
  const [password, setPassword] = createSignal('');
  const [inventory, setInventory] = createSignal<Inventory | null>(null);
  const [filter, setFilter] = createSignal<Filter>('all');
  const [selected, setSelected] = createSignal<Set<string>>(new Set());
  const [busy, setBusy] = createSignal(false);
  const [dragOver, setDragOver] = createSignal(false);
  const [localOnlyHint, setLocalOnlyHint] = createSignal(false);
  let gridRoot!: HTMLUListElement;

  const visible = createMemo(() => {
    const items = inventory()?.items ?? [];
    if (filter() === 'orphan') return items.filter((i) => !i.referenced);
    return items;
  });

  const selectedOrphans = createMemo(() => {
    const set = selected();
    return visible().filter((i) => set.has(i.hash) && !i.referenced);
  });

  async function refreshSession() {
    const res = await api<{ ok: boolean }>('/session');
    if (!res.ok) {
      setAuthed(false);
      setLocalOnlyHint(res.status === 0 || res.status === 404);
      return false;
    }
    setAuthed(res.data.ok);
    setLocalOnlyHint(false);
    return res.data.ok;
  }

  async function loadList() {
    setBusy(true);
    const res = await api<Inventory>('/list');
    setBusy(false);
    if (!res.ok) {
      if (res.status === 401) setAuthed(false);
      notify(res.error);
      return;
    }
    setInventory(res.data);
    setSelected(new Set<string>());
  }

  onSettled(() => {
    void (async () => {
      const ok = await refreshSession();
      if (ok) await loadList();
    })();
  });

  // 列表刷新后复用正文 / Film 同款 LQIP 淡入 + 灯箱
  createEffect(
    () => inventory(),
    () => {
      const el = gridRoot;
      if (!el) return;
      const unbindLoad = bindImageLoading(el);
      const unbindZoom = bindImageLightbox(el);
      return () => {
        unbindLoad();
        unbindZoom();
      };
    },
  );

  async function onLogin(e: Event) {
    e.preventDefault();
    setBusy(true);
    const res = await api<{ ok: boolean }>('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password() }),
    });
    setBusy(false);
    if (!res.ok) {
      notify(res.error);
      setLocalOnlyHint(res.status === 0 || res.status === 404);
      return;
    }
    setPassword('');
    setAuthed(true);
    await loadList();
  }

  async function onLogout() {
    await api('/logout', { method: 'POST' });
    setAuthed(false);
    setInventory(null);
    setSelected(new Set<string>());
  }

  function toggleHash(hash: string) {
    const next = new Set(selected());
    if (next.has(hash)) next.delete(hash);
    else next.add(hash);
    setSelected(next);
  }

  function selectVisibleOrphans() {
    setSelected(new Set(visible().filter((i) => !i.referenced).map((i) => i.hash)));
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) {
      notify('请选择图片文件');
      return;
    }
    const form = new FormData();
    for (const file of list) form.append('files', file);
    setBusy(true);
    notify(`上传中 ${list.length} 张…`);
    const res = await api<{ uploaded: { hash: string; cdn: string }[] }>(
      '/upload',
      { method: 'POST', body: form },
    );
    setBusy(false);
    if (!res.ok) {
      notify(res.error);
      return;
    }
    const urls = res.data.uploaded.map((u) => u.cdn).filter(Boolean);
    if (urls.length) {
      try {
        await navigator.clipboard.writeText(urls.join('\n'));
        notify('图片链接已复制到剪贴板', {
          description:
            urls.length === 1 ? urls[0] : `${urls.length} 条，已用换行分隔`,
        });
      } catch {
        notify('上传成功，但复制失败', {
          description: urls.join(' · '),
        });
      }
    } else {
      notify(`已上传 ${res.data.uploaded.length} 张`);
    }
    await loadList();
  }

  async function onDeleteSelected() {
    const hashes = selectedOrphans().map((i) => i.hash);
    if (!hashes.length) {
      notify('请选择未引用图片');
      return;
    }
    if (!confirm(`确认删除 ${hashes.length} 张未引用图片？`)) return;
    setBusy(true);
    const res = await api<{ results: unknown[] }>('/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashes }),
    });
    setBusy(false);
    if (!res.ok) {
      notify(res.error);
      return;
    }
    notify(`已删除 ${hashes.length} 张`);
    await loadList();
  }

  async function copyCdn(url: string | null) {
    if (!url) {
      notify('无 CDN URL（仅 meta）');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      notify('已复制', { description: url });
    } catch {
      notify('复制失败', { description: url });
    }
  }

  return (
    <section class="font-mono">
      <Seo
        title="Imgbed"
        description="本地图床管理"
        path="/_imgbed/"
        noindex
      />
      <StnHeader
        caption="LOCAL"
        meta="IMGBED"
        title="图床管理"
        lede="批量上传 / 删除 · 标出正文未引用图片。仅 pnpm dev 可用。"
      />

      <Show when={localOnlyHint()}>
        <p class="mt-4 text-sm text-dim">
          当前没有本地 API。请在项目根执行 <code class="text-ink">pnpm dev</code>{' '}
          后访问 <code class="text-ink">/_imgbed/</code>。
        </p>
      </Show>

      <Show when={authed() === false}>
        <form
          class="hw-panel mt-6 p-4 sm:p-5"
          onSubmit={onLogin}
        >
          <label class="block text-xs uppercase tracking-wider text-dim">
            Password
            <input
              type="password"
              class="mt-2 w-full rounded-[var(--radius-control)] border border-line bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              autocomplete="current-password"
              disabled={busy()}
            />
          </label>
          <button
            type="submit"
            class="hw-key inline-flex items-center gap-2 px-4 py-2 text-sm"
            disabled={busy() || !password()}
          >
            <span class="i-carbon-locked" />
            进入
          </button>
        </form>
      </Show>

      <Show when={authed() === true}>
        <div class="mt-6 flex flex-wrap items-center gap-2">
          <Badge tone="info">{`TOTAL ${inventory()?.stats.total ?? 0}`}</Badge>
          <Badge>{`REMOTE ${inventory()?.stats.remote ?? 0}`}</Badge>
          <Badge>{`META ${inventory()?.stats.meta ?? 0}`}</Badge>
          <Badge tone="success">{`USED ${inventory()?.stats.referenced ?? 0}`}</Badge>
          <Badge tone="warning">{`ORPHAN ${inventory()?.stats.orphan ?? 0}`}</Badge>
          <button
            type="button"
            class="ml-auto text-xs text-dim underline-offset-2 hover:text-ink hover:underline"
            onClick={() => void onLogout()}
          >
            退出
          </button>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="hw-key px-3 py-1.5 text-xs"
            data-active={filter() === 'all' ? '' : undefined}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            type="button"
            class="hw-key px-3 py-1.5 text-xs"
            onClick={() => setFilter('orphan')}
          >
            仅未引用
          </button>
          <button
            type="button"
            class="hw-key px-3 py-1.5 text-xs"
            onClick={() => selectVisibleOrphans()}
          >
            全选未引用
          </button>
          <button
            type="button"
            class="hw-key inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            disabled={busy() || selectedOrphans().length === 0}
            onClick={() => void onDeleteSelected()}
          >
            <span class="i-carbon-trash-can shrink-0 text-sm" aria-hidden="true" />
            删除所选 ({selectedOrphans().length})
          </button>
          <button
            type="button"
            class="hw-key px-3 py-1.5 text-xs"
            disabled={busy()}
            onClick={() => void loadList()}
          >
            刷新
          </button>
        </div>

        <label
          class={[
            'hw-panel mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line px-4 py-8 text-center text-sm text-dim transition-colors',
            { 'border-ink bg-metal/40': dragOver() },
          ]}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer?.files?.length) {
              void uploadFiles(e.dataTransfer.files);
            }
          }}
        >
          <span class="i-carbon-cloud-upload text-xl text-ink" />
          <span>拖拽图片到此处，或点击选择（支持多选）</span>
          <input
            type="file"
            accept="image/*"
            multiple
            class="sr-only"
            disabled={busy()}
            onChange={(e) => {
              const files = e.currentTarget.files;
              if (files?.length) void uploadFiles(files);
              e.currentTarget.value = '';
            }}
          />
        </label>

        <ul
          ref={gridRoot}
          class="hw-imgbed-grid mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        >
          <For each={visible()}>
            {(item) => {
              const checked = () => selected().has(item.hash);
              const canSelect = () => !item.referenced;
              const sized = () => Boolean(item.w && item.h);
              return (
                <li
                  class={[
                    'hw-key overflow-hidden',
                    {
                      'opacity-60': item.referenced,
                      'ring-2 ring-ink': checked(),
                    },
                  ]}
                >
                  <div class="relative aspect-square bg-tray">
                    <Show
                      when={item.cdn}
                      fallback={
                        <Show
                          when={item.lqip}
                          fallback={
                            <div class="flex h-full items-center justify-center text-xs text-dim">
                              no preview
                            </div>
                          }
                        >
                          <img
                            src={item.lqip || ''}
                            alt=""
                            class="h-full w-full object-cover"
                            decoding="async"
                          />
                        </Show>
                      }
                    >
                      <span
                        class={
                          sized()
                            ? 'hw-img-frame hw-img-frame--sized'
                            : 'hw-img-frame'
                        }
                        style={frameStyle(item)}
                        data-lqip={item.lqip ? '' : undefined}
                      >
                        <img
                          src={item.cdn || ''}
                          alt=""
                          width={item.w}
                          height={item.h}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                    </Show>
                    <Show when={canSelect()}>
                      <Checkbox
                        class="absolute left-2 top-2 z-10"
                        size="sm"
                        label={`选择 ${item.hash}`}
                        checked={checked()}
                        onChange={() => toggleHash(item.hash)}
                      />
                    </Show>
                  </div>
                  <div class="space-y-2 px-2.5 py-2.5">
                    <div class="flex flex-wrap gap-1">
                      <Show when={item.referenced}>
                        <Badge tone="success">USED</Badge>
                      </Show>
                      <Show when={!item.referenced}>
                        <Badge tone="warning">ORPHAN</Badge>
                      </Show>
                      <Show when={item.onRemote}>
                        <Badge>REMOTE</Badge>
                      </Show>
                      <Show when={item.inMeta}>
                        <Badge tone="info">META</Badge>
                      </Show>
                      <Show when={!item.onRemote && item.inMeta}>
                        <Badge tone="danger">META ONLY</Badge>
                      </Show>
                    </div>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="text-[11px] text-dim underline-offset-2 hover:text-ink hover:underline"
                        onClick={() => void copyCdn(item.cdn)}
                      >
                        复制 URL
                      </button>
                    </div>
                  </div>
                </li>
              );
            }}
          </For>
        </ul>

        <Show when={(inventory()?.items.length ?? 0) === 0 && !busy()}>
          <p class="mt-8 text-center text-sm text-dim">图床为空</p>
        </Show>
      </Show>

      <Show when={authed() === null}>
        <p class="mt-6 text-sm text-dim">检查会话…</p>
      </Show>
    </section>
  );
}
