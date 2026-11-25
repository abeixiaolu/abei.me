/** 正文图片点击放大（灯箱）+ 同文切换 */

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
      <button type="button" class="hw-img-lightbox-nav hw-img-lightbox-prev" aria-label="上一张" hidden>
        <span class="i-carbon-chevron-left hw-img-lightbox-nav-icon" aria-hidden="true"></span>
      </button>
      <button type="button" class="hw-img-lightbox-nav hw-img-lightbox-next" aria-label="下一张" hidden>
        <span class="i-carbon-chevron-right hw-img-lightbox-nav-icon" aria-hidden="true"></span>
      </button>
      <figure class="hw-img-lightbox-stage t-modal">
        <img class="hw-img-lightbox-img" alt="" decoding="async" />
        <figcaption class="hw-img-lightbox-caption" hidden></figcaption>
      </figure>
    `;
  }

  // 热更新：补齐导航 / 去掉旧关闭按钮
  root.querySelector('.hw-img-lightbox-close')?.remove();
  if (!root.querySelector('.hw-img-lightbox-prev')) {
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'hw-img-lightbox-nav hw-img-lightbox-prev';
    prev.setAttribute('aria-label', '上一张');
    prev.hidden = true;
    prev.innerHTML =
      '<span class="i-carbon-chevron-left hw-img-lightbox-nav-icon" aria-hidden="true"></span>';
    root.prepend(prev);
  }
  if (!root.querySelector('.hw-img-lightbox-next')) {
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'hw-img-lightbox-nav hw-img-lightbox-next';
    next.setAttribute('aria-label', '下一张');
    next.hidden = true;
    next.innerHTML =
      '<span class="i-carbon-chevron-right hw-img-lightbox-nav-icon" aria-hidden="true"></span>';
    root.append(next);
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

function syncSlide(root: HTMLElement) {
  const img = root.querySelector<HTMLImageElement>('.hw-img-lightbox-img');
  const caption = root.querySelector<HTMLElement>('.hw-img-lightbox-caption');
  const prev = root.querySelector<HTMLButtonElement>('.hw-img-lightbox-prev');
  const next = root.querySelector<HTMLButtonElement>('.hw-img-lightbox-next');
  const item = gallery[galleryIndex];
  if (!img || !caption || !item) return;

  img.src = item.src;
  img.alt = item.alt;
  const alt = item.alt.trim();
  if (alt) {
    caption.hidden = false;
    caption.textContent = alt;
  } else {
    caption.hidden = true;
    caption.textContent = '';
  }

  const multi = gallery.length > 1;
  if (prev) prev.hidden = !multi;
  if (next) next.hidden = !multi;
  root.setAttribute(
    'aria-label',
    multi ? `图片预览 ${galleryIndex + 1} / ${gallery.length}` : '图片预览',
  );
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
  syncSlide(root);

  root.hidden = false;
  root.classList.remove('is-closing');
  stage.classList.remove('is-open', 'is-closing');
  lockScroll();

  void root.offsetWidth;
  root.classList.add('is-open');
  stage.classList.add('is-open');
  root.focus({ preventScroll: true });
}

function closeLightbox() {
  const root = window.__hwImageLightbox;
  if (!root || root.hidden) return;

  const stage = root.querySelector<HTMLElement>('.hw-img-lightbox-stage');
  const img = root.querySelector<HTMLImageElement>('.hw-img-lightbox-img');
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
    if (target.closest('.hw-img-lightbox-prev')) {
      event.preventDefault();
      step(-1);
      return;
    }
    if (target.closest('.hw-img-lightbox-next')) {
      event.preventDefault();
      step(1);
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
