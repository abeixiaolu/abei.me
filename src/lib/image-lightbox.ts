/** 正文 / Film 图片灯箱：底部缩略图条切换，可滚动时显示边缘阴影 */

type ZoomTarget = {
  src: string;
  alt: string;
};

declare global {
  interface Window {
    __hwImageLightbox?: HTMLElement;
  }
}

function readMs(value: string, fallback: number) {
  const v = value.trim();
  if (!v) return fallback;
  if (v.endsWith('ms')) return parseFloat(v) || fallback;
  if (v.endsWith('s')) return (parseFloat(v) || 0) * 1000 || fallback;
  return parseFloat(v) || fallback;
}

function preferReduceMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function closeMs() {
  if (preferReduceMotion()) return 0;
  return readMs(
    getComputedStyle(document.documentElement).getPropertyValue('--modal-close-dur'),
    150,
  );
}

function ensureLightbox() {
  let root =
    window.__hwImageLightbox ??
    document.querySelector<HTMLElement>('.hw-img-lightbox') ??
    undefined;

  if (!root) {
    root = document.createElement('div');
    root.className = 'hw-img-lightbox';
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', '图片预览');
    root.innerHTML = `
      <div class="hw-img-lightbox-backdrop" aria-hidden="true">
        <img class="hw-img-lightbox-backdrop-img" alt="" decoding="async" />
      </div>
      <button type="button" class="hw-img-lightbox-close" aria-label="关闭">
        <span class="i-carbon-close hw-img-lightbox-close-icon" aria-hidden="true"></span>
      </button>
      <figure class="hw-img-lightbox-stage t-modal">
        <img class="hw-img-lightbox-img" alt="" decoding="async" />
        <figcaption class="hw-img-lightbox-caption" hidden></figcaption>
      </figure>
      <div class="hw-img-lightbox-strip" hidden>
        <div class="hw-img-lightbox-strip-scroller" role="list"></div>
      </div>
    `;
  }

  // 热更新：去掉旧左右键，补齐模糊背景 / 关闭 / 缩略图条
  root.querySelector('.hw-img-lightbox-controls')?.remove();
  root.querySelectorAll('.hw-img-lightbox-nav').forEach((el) => el.remove());

  if (!root.querySelector('.hw-img-lightbox-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.className = 'hw-img-lightbox-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML =
      '<img class="hw-img-lightbox-backdrop-img" alt="" decoding="async" />';
    root.prepend(backdrop);
  }

  let closeBtn = root.querySelector<HTMLButtonElement>('.hw-img-lightbox-close');
  if (!closeBtn) {
    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'hw-img-lightbox-close';
    closeBtn.setAttribute('aria-label', '关闭');
    closeBtn.innerHTML =
      '<span class="i-carbon-close hw-img-lightbox-close-icon" aria-hidden="true"></span>';
    root.append(closeBtn);
  }

  let strip = root.querySelector<HTMLElement>('.hw-img-lightbox-strip');
  if (!strip) {
    strip = document.createElement('div');
    strip.className = 'hw-img-lightbox-strip';
    strip.hidden = true;
    strip.innerHTML = '<div class="hw-img-lightbox-strip-scroller" role="list"></div>';
    root.append(strip);
  }
  if (!strip.querySelector('.hw-img-lightbox-strip-scroller')) {
    const scroller = document.createElement('div');
    scroller.className = 'hw-img-lightbox-strip-scroller';
    scroller.setAttribute('role', 'list');
    strip.append(scroller);
  }

  root.tabIndex = -1;
  if (!root.isConnected) document.body.appendChild(root);
  window.__hwImageLightbox = root;
  return root;
}

let closeTimer = 0;
let lastFocus: HTMLElement | null = null;
let scrollLocked = false;
let overlayBound = false;
let stripScrollBound = false;
let gallery: ZoomTarget[] = [];
let galleryIndex = 0;

function lockScroll() {
  if (scrollLocked) return;
  scrollLocked = true;
  document.documentElement.dataset.imgLightbox = '';
}

function unlockScroll() {
  if (!scrollLocked) return;
  scrollLocked = false;
  delete document.documentElement.dataset.imgLightbox;
}

function isOpen(root: HTMLElement) {
  return !root.hidden && root.classList.contains('is-open');
}

/** 收集同篇可放大图片（跳过链接内图片） */
function collectGallery(proseRoot: HTMLElement): ZoomTarget[] {
  const items: ZoomTarget[] = [];
  proseRoot.querySelectorAll<HTMLElement>('.hw-img-frame').forEach((frame) => {
    if (frame.closest('a[href]')) return;
    const img = frame.querySelector<HTMLImageElement>('img');
    const src = img?.currentSrc || img?.src;
    if (!src) return;
    items.push({ src, alt: img?.alt ?? '' });
  });
  return items;
}

function stripEls(root: HTMLElement) {
  const strip = root.querySelector<HTMLElement>('.hw-img-lightbox-strip');
  const scroller = root.querySelector<HTMLElement>('.hw-img-lightbox-strip-scroller');
  return { strip, scroller };
}

/** 根据滚动位置切换左右可滚动阴影 */
function syncStripShadows(root: HTMLElement) {
  const { strip, scroller } = stripEls(root);
  if (!strip || !scroller || strip.hidden) return;

  const max = scroller.scrollWidth - scroller.clientWidth;
  const left = scroller.scrollLeft;
  const epsilon = 2;

  strip.toggleAttribute('data-can-scroll-start', max > epsilon && left > epsilon);
  strip.toggleAttribute('data-can-scroll-end', max > epsilon && left < max - epsilon);
}

function rebuildStrip(root: HTMLElement) {
  const { strip, scroller } = stripEls(root);
  if (!strip || !scroller) return;

  scroller.replaceChildren();

  if (gallery.length <= 1) {
    strip.hidden = true;
    strip.removeAttribute('data-can-scroll-start');
    strip.removeAttribute('data-can-scroll-end');
    return;
  }

  strip.hidden = false;
  gallery.forEach((item, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hw-img-lightbox-thumb';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', item.alt.trim() || `第 ${index + 1} 张`);
    btn.dataset.index = String(index);

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    img.addEventListener('load', () => syncStripShadows(root), { once: true });
    btn.append(img);
    scroller.append(btn);
  });
}

function syncStripActive(root: HTMLElement) {
  const { scroller } = stripEls(root);
  if (!scroller) return;

  scroller.querySelectorAll<HTMLElement>('.hw-img-lightbox-thumb').forEach((thumb) => {
    const on = Number(thumb.dataset.index) === galleryIndex;
    thumb.toggleAttribute('data-active', on);
    thumb.setAttribute('aria-current', on ? 'true' : 'false');
    if (on) {
      thumb.scrollIntoView({
        inline: 'nearest',
        block: 'nearest',
        behavior: preferReduceMotion() ? 'auto' : 'smooth',
      });
    }
  });

  requestAnimationFrame(() => syncStripShadows(root));
}

function syncSlide(root: HTMLElement) {
  const img = root.querySelector<HTMLImageElement>('.hw-img-lightbox-img');
  const backdrop = root.querySelector<HTMLImageElement>('.hw-img-lightbox-backdrop-img');
  const caption = root.querySelector<HTMLElement>('.hw-img-lightbox-caption');
  const item = gallery[galleryIndex];
  if (!img || !caption || !item) return;

  img.src = item.src;
  img.alt = item.alt;
  if (backdrop) backdrop.src = item.src;

  const alt = item.alt.trim();
  if (alt) {
    caption.hidden = false;
    caption.textContent = alt;
  } else {
    caption.hidden = true;
    caption.textContent = '';
  }

  const multi = gallery.length > 1;
  root.setAttribute(
    'aria-label',
    multi ? `图片预览 ${galleryIndex + 1} / ${gallery.length}` : '图片预览',
  );
  syncStripActive(root);
}

function showAt(index: number) {
  const root = window.__hwImageLightbox;
  if (!root || gallery.length === 0) return;
  galleryIndex = ((index % gallery.length) + gallery.length) % gallery.length;
  syncSlide(root);
}

function step(delta: number) {
  if (gallery.length <= 1) return;
  showAt(galleryIndex + delta);
}

/** 外部图集打开灯箱（Film 等） */
export function openImageLightbox(
  items: ZoomTarget[],
  index: number,
  trigger?: HTMLElement | null,
) {
  openLightbox(items, index, trigger);
}

function openLightbox(
  items: ZoomTarget[],
  index: number,
  trigger?: HTMLElement | null,
) {
  if (items.length === 0) return;

  const root = ensureLightbox();
  bindOverlayOnce(root);

  const stage = root.querySelector<HTMLElement>('.hw-img-lightbox-stage');
  if (!stage) return;

  window.clearTimeout(closeTimer);
  lastFocus = trigger ?? (document.activeElement as HTMLElement | null);
  gallery = items;
  galleryIndex = Math.min(Math.max(0, index), items.length - 1);
  rebuildStrip(root);
  syncSlide(root);

  root.hidden = false;
  root.classList.remove('is-closing');
  stage.classList.remove('is-open', 'is-closing');
  lockScroll();

  void root.offsetWidth;
  root.classList.add('is-open');
  stage.classList.add('is-open');
  root.focus({ preventScroll: true });
  requestAnimationFrame(() => syncStripShadows(root));
}

function closeLightbox() {
  const root = window.__hwImageLightbox;
  if (!root || root.hidden) return;

  const stage = root.querySelector<HTMLElement>('.hw-img-lightbox-stage');
  const img = root.querySelector<HTMLImageElement>('.hw-img-lightbox-img');
  const { strip, scroller } = stripEls(root);

  root.classList.remove('is-open');
  root.classList.add('is-closing');
  stage?.classList.remove('is-open');
  stage?.classList.add('is-closing');

  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => {
    root.classList.remove('is-closing');
    stage?.classList.remove('is-closing');
    root.hidden = true;
    if (img) {
      img.removeAttribute('src');
      img.alt = '';
    }
    const backdrop = root.querySelector<HTMLImageElement>('.hw-img-lightbox-backdrop-img');
    backdrop?.removeAttribute('src');
    scroller?.replaceChildren();
    if (strip) {
      strip.hidden = true;
      strip.removeAttribute('data-can-scroll-start');
      strip.removeAttribute('data-can-scroll-end');
    }
    gallery = [];
    galleryIndex = 0;
    unlockScroll();
    const focusBack = lastFocus;
    lastFocus = null;
    if (focusBack?.isConnected) focusBack.focus({ preventScroll: true });
  }, closeMs());
}

function bindOverlayOnce(root: HTMLElement) {
  if (overlayBound) return;
  overlayBound = true;

  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('.hw-img-lightbox-close')) {
      event.preventDefault();
      closeLightbox();
      return;
    }

    const thumb = target.closest<HTMLElement>('.hw-img-lightbox-thumb');
    if (thumb && root.contains(thumb)) {
      event.preventDefault();
      event.stopPropagation();
      const index = Number(thumb.dataset.index);
      if (Number.isFinite(index)) showAt(index);
      return;
    }

    // 点缩略图条空白不关闭
    if (target.closest('.hw-img-lightbox-strip')) {
      event.stopPropagation();
      return;
    }

    closeLightbox();
  });

  window.addEventListener('keydown', (event) => {
    if (!isOpen(root)) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'Left') {
      event.preventDefault();
      step(-1);
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'Right') {
      event.preventDefault();
      step(1);
    }
  });

  if (!stripScrollBound) {
    stripScrollBound = true;
    const onScrollOrResize = () => syncStripShadows(root);
    root.addEventListener(
      'scroll',
      (event) => {
        if ((event.target as Element | null)?.classList?.contains(
          'hw-img-lightbox-strip-scroller',
        )) {
          syncStripShadows(root);
        }
      },
      true,
    );
    window.addEventListener('resize', onScrollOrResize);
  }
}

/** 在 prose 根节点上绑定图片点击放大；返回清理函数 */
export function bindImageLightbox(root: HTMLElement) {
  ensureLightbox();

  const onRootClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const frame = target.closest<HTMLElement>('.hw-img-frame');
    if (!frame || !root.contains(frame)) return;
    // 链接内图片交给浏览器跳转
    if (target.closest('a[href]')) return;

    const img = frame.querySelector<HTMLImageElement>('img');
    const src = img?.currentSrc || img?.src;
    if (!src) return;

    const items = collectGallery(root);
    const index = items.findIndex((item) => item.src === src);
    if (index < 0) return;

    event.preventDefault();
    openLightbox(items, index, img);
  };

  root.addEventListener('click', onRootClick);

  return () => {
    root.removeEventListener('click', onRootClick);
    const overlay = window.__hwImageLightbox;
    if (overlay && (isOpen(overlay) || overlay.classList.contains('is-closing'))) {
      closeLightbox();
    }
  };
}
