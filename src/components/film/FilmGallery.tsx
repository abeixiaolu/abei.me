import { For, Show, createEffect } from 'solid-js';
import type { FilmPhotoRef } from '../../lib/content';
import { bindImageLightbox } from '../../lib/image-lightbox';
import { bindImageLoading } from '../../lib/image-loading';
import FilmPhotoCard from './FilmPhotoCard';

type Props = {
  photos: FilmPhotoRef[];
  /** masonry | grid */
  mode?: 'masonry' | 'grid';
  class?: string;
};

/** 统一绑定文章同款 LQIP 淡入 + 灯箱 */
export default function FilmGallery(props: Props) {
  let root!: HTMLDivElement;
  const mode = () => props.mode ?? 'masonry';

  createEffect(
    () => props.photos,
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
    <Show
      when={props.photos.length > 0}
      fallback={<p class="hw-film-empty">还没有照片。</p>}
    >
      <div
        ref={root}
        class={[
          mode() === 'grid' ? 'hw-film-grid' : 'hw-film-masonry',
          props.class,
        ]}
      >
        <For each={props.photos}>
          {(photo) =>
            mode() === 'masonry' ? (
              <div class="hw-film-masonry-item">
                <FilmPhotoCard photo={photo} />
              </div>
            ) : (
              <FilmPhotoCard photo={photo} />
            )
          }
        </For>
      </div>
    </Show>
  );
}
