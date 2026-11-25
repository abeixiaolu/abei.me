import { createEffect } from 'solid-js';
import { bindImageLightbox } from '../lib/image-lightbox';

type Props = {
  html: string;
  class?: string;
};

function bindImageLoading(root: HTMLElement) {
  const imgs = root.querySelectorAll<HTMLImageElement>('.hw-img-frame > img');
  const cleanups: Array<() => void> = [];

  imgs.forEach((img) => {
    const frame = img.closest<HTMLElement>('.hw-img-frame');
    if (!frame?.classList.contains('hw-img-frame--sized')) return;

    let cancelled = false;

    const mark = () => {
      if (cancelled) return;
      frame.setAttribute('data-loaded', '');
      // 淡入后去掉 LQIP，避免模糊层一直占合成层
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

/** 构建期 Markdown HTML 注入 */
export default function ProseHtml(props: Props) {
  let root!: HTMLDivElement;

  createEffect(
    () => props.html,
    () => {
      const el = root;
      if (!el) return;
      const unbindLoad = bindImageLoading(el);
      const unbindZoom = bindImageLightbox(el);
      return () => {
        unbindLoad();
        unbindZoom();
      };
    },
  );

  return (
    <div
      ref={root}
      class={['hw-prose', props.class]}
      // 内容来自本站构建期 Markdown，非用户输入
      // oxlint-disable-next-line solid/no-innerhtml
      innerHTML={props.html}
    />
  );
}
