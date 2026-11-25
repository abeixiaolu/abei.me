import { For, Show } from 'solid-js';
import type { FilmAlbum } from '../../lib/content';
import { formatDateShort, padIndex } from '../../lib/content';

type Props = {
  albums: FilmAlbum[];
  class?: string;
};

export default function FilmAlbumGrid(props: Props) {
  return (
    <Show
      when={props.albums.length > 0}
      fallback={<p class="hw-film-empty">还没有专辑。</p>}
    >
      <div class={['hw-film-albums', props.class]}>
        <For each={props.albums}>
          {(album) => (
            <a href={`/film/${album.id}/`} class="hw-film-album">
              <Show
                when={album.cover}
                fallback={<span class="hw-film-album-cover" aria-hidden="true" />}
              >
                <img
                  class="hw-film-album-cover"
                  src={album.cover}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </Show>
              <div class="hw-film-album-body">
                <span class="hw-film-album-title">{album.title}</span>
                <span class="hw-film-album-meta">
                  {formatDateShort(album.date)} · {padIndex(album.photos.length)} frames
                </span>
              </div>
            </a>
          )}
        </For>
      </div>
    </Show>
  );
}
