import { createEffect } from 'solid-js';
import { bindImageLightbox } from '../lib/image-lightbox';
import { bindImageLoading } from '../lib/image-loading';

type Props = {
  html: string;
  class?: string;
};

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
