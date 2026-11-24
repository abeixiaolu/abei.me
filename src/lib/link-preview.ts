/** 外链悬停预览（Microlink） */

declare global {
  interface Window {
    __hwLinkPreviewBound?: boolean;
    __hwLinkPreviewTip?: HTMLElement;
  }
}

  type PreviewData = {
    url: string;
    host: string;
    title: string;
    description: string;
    image: string;
    /** og：大图预览；icon：仅 favicon / logo，用紧凑样式 */
    kind: "og" | "icon";
  };


  const SHOW_MS = 280;
  const HIDE_MS = 140;
  const CACHE_KEY = "hw-link-preview-v2";
  const CACHE_MAX = 80;
  const ICON_MAX_PX = 96;

  const memory = new Map<string, PreviewData | null>();

  function canHover() {
    return matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function preferReduceMotion() {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function loadSessionCache() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const entries = JSON.parse(raw) as [string, PreviewData | null][];
      for (const [k, v] of entries) memory.set(k, v);
    } catch {
      /* ignore */
    }
  }

  function saveSessionCache() {
    try {
      const entries = [...memory.entries()].slice(-CACHE_MAX);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }

  function absoluteUrl(href: string) {
    try {
      return new URL(href, location.href);
    } catch {
      return null;
    }
  }

  function isExternalAnchor(el: EventTarget | null): el is HTMLAnchorElement {
    if (!(el instanceof HTMLAnchorElement)) return false;
    if (el.dataset.noPreview != null) return false;
    if (el.closest(".hw-link-preview")) return false;
    const href = el.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return false;
    }
    const url = absoluteUrl(href);
    if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) return false;
    return url.origin !== location.origin;
  }

  function faviconFor(host: string) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  }

  function stripWww(host: string) {
    return host.replace(/^www\./i, "");
  }

  function looksLikeIconUrl(src: string) {
    return /favicon|fluidicon|apple-touch-icon|\/logo(\.|\/)|google\.com\/s2\/favicons|icons\.duckduckgo\.com/i.test(
      src,
    );
  }

  function sameHostLabel(a: string, b: string) {
    return stripWww(a).toLowerCase() === stripWww(b).toLowerCase();
  }

  /** 标题若只是域名，改用路径末段，避免和 kicker 重复 */
  function resolveCopy(url: URL, titleRaw: string, descriptionRaw: string) {
    const host = stripWww(url.hostname);
    let title = titleRaw.trim();
    let description = descriptionRaw.trim();

    if (!title || sameHostLabel(title, host)) {
      const path = `${url.pathname}${url.search}`.replace(/\/$/, "") || "/";
      const leaf = path === "/" ? "" : path.split("/").filter(Boolean).pop() || path;
      title = leaf || host;
      if (!description && path !== "/" && leaf !== path) description = path;
    }

    if (description && sameHostLabel(description, host)) description = "";
    return { host, title, description };
  }

  function fallbackPreview(url: URL): PreviewData {
    const { host, title, description } = resolveCopy(url, "", "");
    return {
      url: url.href,
      host,
      title,
      description,
      image: faviconFor(url.hostname),
      kind: "icon",
    };
  }

  async function fetchPreview(url: URL, signal: AbortSignal): Promise<PreviewData> {
    const cached = memory.get(url.href);
    if (cached !== undefined) return cached ?? fallbackPreview(url);

    const endpoint = new URL("https://api.microlink.io/");
    endpoint.searchParams.set("url", url.href);
    endpoint.searchParams.set("palette", "false");
    endpoint.searchParams.set("audio", "false");
    endpoint.searchParams.set("video", "false");
    endpoint.searchParams.set("iframe", "false");

    try {
      const res = await fetch(endpoint, { signal });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as {
        status?: string;
        data?: {
          title?: string | null;
          description?: string | null;
          url?: string;
          image?: { url?: string; width?: number; height?: number } | null;
          logo?: { url?: string; width?: number; height?: number } | null;
        };
      };

      if (json.status !== "success" || !json.data) throw new Error("meta");

      const data = json.data;
      const og = data.image?.url;
      const logo = data.logo?.url;
      const image = og || logo || faviconFor(url.hostname);
      const ogSmall =
        !!og &&
        ((data.image?.width != null && data.image.width <= ICON_MAX_PX) ||
          (data.image?.height != null && data.image.height <= ICON_MAX_PX));
      const kind: PreviewData["kind"] =
        og && !ogSmall && !looksLikeIconUrl(og) ? "og" : "icon";

      const resolvedUrl = new URL(data.url || url.href);
      const { host, title, description } = resolveCopy(
        resolvedUrl,
        data.title || "",
        data.description || "",
      );

      const preview: PreviewData = {
        url: resolvedUrl.href,
        host,
        title,
        description,
        image,
        kind,
      };
      memory.set(url.href, preview);
      saveSessionCache();
      return preview;
    } catch (err) {
      if ((err as Error).name === "AbortError") throw err;
      memory.set(url.href, null);
      saveSessionCache();
      return fallbackPreview(url);
    }
  }

  function ensureTip() {
    // ClientRouter 换页可能卸掉节点；用 window 引用把同一 tip 挂回 body
    let tip =
      window.__hwLinkPreviewTip ??
      document.querySelector<HTMLElement>(".hw-link-preview") ??
      undefined;

    if (!tip) {
      tip = document.createElement("aside");
      tip.className = "hw-link-preview";
      tip.hidden = true;
      tip.setAttribute("aria-hidden", "true");
      tip.innerHTML = `
        <div class="hw-link-preview-shell">
          <div class="hw-link-preview-media" data-slot="media"></div>
          <div class="hw-link-preview-body">
            <div class="hw-link-preview-kicker" data-slot="kicker"></div>
            <div class="hw-link-preview-title" data-slot="title"></div>
            <div class="hw-link-preview-desc" data-slot="desc"></div>
          </div>
        </div>
      `;
    }

    if (!tip.isConnected) document.body.appendChild(tip);
    window.__hwLinkPreviewTip = tip;
    return tip;
  }

  function placeTip(tip: HTMLElement, anchor: HTMLElement) {
    const gap = 10;
    const rect = anchor.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let top = rect.top - th - gap;
    let left = rect.left + rect.width / 2 - tw / 2;

    if (top < 8) top = rect.bottom + gap;
    if (top + th > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - th - 8);
    }
    left = Math.min(Math.max(8, left), window.innerWidth - tw - 8);

    tip.style.top = `${Math.round(top)}px`;
    tip.style.left = `${Math.round(left)}px`;
  }

  function renderLoading(tip: HTMLElement, url: URL) {
    tip.dataset.state = "loading";
    tip.dataset.kind = "og";
    const media = tip.querySelector<HTMLElement>('[data-slot="media"]');
    const kicker = tip.querySelector<HTMLElement>('[data-slot="kicker"]');
    const title = tip.querySelector<HTMLElement>('[data-slot="title"]');
    const desc = tip.querySelector<HTMLElement>('[data-slot="desc"]');
    if (!media || !kicker || !title || !desc) return;

    const host = stripWww(url.hostname);
    delete media.dataset.empty;
    delete media.dataset.icon;
    media.dataset.signal = "";
    media.innerHTML = `
      <div class="hw-link-preview-signal" aria-hidden="true">
        <div class="hw-link-preview-scope">
          <span class="hw-link-preview-ring" style="--i:0"></span>
          <span class="hw-link-preview-ring" style="--i:1"></span>
          <span class="hw-link-preview-ring" style="--i:2"></span>
          <span class="hw-link-preview-ring" style="--i:3"></span>
          <span class="hw-link-preview-tx"></span>
          <span class="hw-link-preview-sweep"></span>
        </div>
        <div class="hw-link-preview-signal-bar">
          <span class="hw-link-preview-signal-led"></span>
          <span class="hw-link-preview-signal-label">RX · Carrier</span>
          <span class="hw-link-preview-signal-pulse">▮▮▮</span>
        </div>
      </div>
    `;
    kicker.textContent = host;
    title.hidden = false;
    title.textContent = "调谐信号…";
    desc.textContent = "";
  }

  function renderTip(tip: HTMLElement, data: PreviewData) {
    tip.dataset.state = "ready";
    tip.dataset.kind = data.kind;
    const media = tip.querySelector<HTMLElement>('[data-slot="media"]');
    const kicker = tip.querySelector<HTMLElement>('[data-slot="kicker"]');
    const title = tip.querySelector<HTMLElement>('[data-slot="title"]');
    const desc = tip.querySelector<HTMLElement>('[data-slot="desc"]');
    if (!media || !kicker || !title || !desc) return;

    // 域名只展示一处
    kicker.textContent = data.host;
    title.textContent = data.title;
    title.hidden = !data.title || sameHostLabel(data.title, data.host);
    desc.textContent = data.description;

    media.replaceChildren();
    delete media.dataset.signal;

    if (!data.image) {
      media.dataset.empty = "";
      return;
    }

    delete media.dataset.empty;

    if (data.kind === "icon") {
      media.dataset.icon = "";
      const img = document.createElement("img");
      img.src = data.image;
      img.alt = "";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => {
        media.replaceChildren();
        media.dataset.empty = "";
      }, { once: true });
      media.appendChild(img);
      return;
    }

    delete media.dataset.icon;
    const img = document.createElement("img");
    img.src = data.image;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.addEventListener(
      "load",
      () => {
        // 实际是小图标却被当成 OG 时，降级为紧凑样式
        if (
          tip.dataset.state === "ready" &&
          img.naturalWidth > 0 &&
          img.naturalWidth <= ICON_MAX_PX &&
          img.naturalHeight <= ICON_MAX_PX
        ) {
          const next = { ...data, kind: "icon" as const };
          memory.set(data.url, next);
          saveSessionCache();
          renderTip(tip, next);
        }
      },
      { once: true },
    );
    img.addEventListener("error", () => {
      renderTip(tip, { ...data, image: faviconFor(data.host), kind: "icon" });
    }, { once: true });
    media.appendChild(img);
  }

  function boot() {
    // 每次换页都把 tip 挂回 DOM；事件只绑一次
    const tip = ensureTip();
    tip.hidden = true;
    tip.dataset.open = "false";
    tip.setAttribute("aria-hidden", "true");
    if (window.__hwLinkPreviewBound) return;
    window.__hwLinkPreviewBound = true;
    loadSessionCache();

    let showTimer = 0;
    let hideTimer = 0;
    let pending: HTMLAnchorElement | null = null;
    let current: HTMLAnchorElement | null = null;
    let abort: AbortController | null = null;

    const hide = (immediate = false) => {
      const tip = ensureTip();
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      pending = null;
      const close = () => {
        tip.hidden = true;
        tip.dataset.open = "false";
        tip.setAttribute("aria-hidden", "true");
        current = null;
        abort?.abort();
        abort = null;
      };
      if (immediate || preferReduceMotion() || tip.hidden) {
        close();
        return;
      }
      hideTimer = window.setTimeout(close, HIDE_MS);
    };

    const showFor = (anchor: HTMLAnchorElement) => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(showTimer);
      pending = anchor;
      showTimer = window.setTimeout(async () => {
        const tipNow = ensureTip();
        const url = absoluteUrl(anchor.href);
        if (!url || pending !== anchor) return;

        current = anchor;
        pending = null;
        tipNow.hidden = false;
        tipNow.dataset.open = "true";
        tipNow.setAttribute("aria-hidden", "false");
        renderLoading(tipNow, url);
        placeTip(tipNow, anchor);

        abort?.abort();
        abort = new AbortController();
        try {
          const data = await fetchPreview(url, abort.signal);
          if (current !== anchor) return;
          renderTip(tipNow, data);
          placeTip(tipNow, anchor);
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
        }
      }, preferReduceMotion() ? 0 : SHOW_MS);
    };

    document.addEventListener(
      "pointerover",
      (event) => {
        if (!canHover()) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const anchor = target.closest("a");
        if (!isExternalAnchor(anchor)) return;
        if (anchor === current || anchor === pending) {
          window.clearTimeout(hideTimer);
          return;
        }
        showFor(anchor);
      },
      true,
    );

    document.addEventListener(
      "pointerout",
      (event) => {
        if (!canHover()) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const anchor = target.closest("a");
        if (!isExternalAnchor(anchor)) return;
        if (anchor !== current && anchor !== pending) return;

        const related = event.relatedTarget;
        const tip = ensureTip();
        if (related instanceof Node && (anchor.contains(related) || tip.contains(related))) {
          return;
        }
        hide(anchor === pending && current == null);
      },
      true,
    );

    // tip 上的进出：委托到 document，避免换页重建后丢监听
    document.addEventListener("pointerover", (event) => {
      const tip = window.__hwLinkPreviewTip;
      if (!tip || !(event.target instanceof Node) || !tip.contains(event.target)) return;
      window.clearTimeout(hideTimer);
    });
    document.addEventListener("pointerout", (event) => {
      const tip = window.__hwLinkPreviewTip;
      if (!tip || !(event.target instanceof Node) || !tip.contains(event.target)) return;
      const related = event.relatedTarget;
      if (related instanceof Node && tip.contains(related)) return;
      hide();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hide();
    });

    window.addEventListener(
      "scroll",
      () => {
        const tip = ensureTip();
        if (tip.hidden || !current) return;
        placeTip(tip, current);
      },
      { passive: true },
    );
  }

export function bindLinkPreview() {
  boot();
}
