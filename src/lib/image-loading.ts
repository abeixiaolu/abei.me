/** 高清图就绪后淡入，并卸掉 LQIP 模糊层（与 Prose / Film 共用） */

export function bindImageLoading(root: HTMLElement) {
  const imgs = root.querySelectorAll<HTMLImageElement>('.hw-img-frame > img');
  const cleanups: Array<() => void> = [];

  imgs.forEach((img) => {
    const frame = img.closest<HTMLElement>('.hw-img-frame');
    if (!frame?.classList.contains('hw-img-frame--sized')) return;

    let cancelled = false;

    const mark = () => {
      if (cancelled) return;
      frame.setAttribute('data-loaded', '');
      frame.style.removeProperty('--lqip');
      frame.removeAttribute('data-lqip');
    };

    const reveal = () => {
      if (typeof img.decode === 'function') {
        img
          .decode()
          .catch(() => undefined)
          .then(mark);
        return;
      }
      mark();
    };

    if (img.complete && img.naturalWidth > 0) {
      reveal();
      return;
    }

    const onLoad = () => reveal();
    const onError = () => mark();
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    cleanups.push(() => {
      cancelled = true;
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
