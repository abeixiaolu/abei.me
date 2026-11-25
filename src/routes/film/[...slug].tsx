import type { RouteProps } from '@solidjs/router';
import { Show } from 'solid-js';
import Breadcrumb from '../../components/Breadcrumb';
import ProseHtml from '../../components/ProseHtml';
import Seo from '../../components/Seo';
import { formatDateLong, getFilmAlbum } from '../../lib/content';
import '../../styles/film.css';

function slugOf(params: { slug?: string }) {
  return (params.slug ?? '').replace(/\/$/, '');
}

export default function FilmAlbumPage(props: RouteProps<'/film/*slug'>) {
  const album = () => getFilmAlbum(slugOf(props.params));

  return (
    <Show
      when={album()}
      fallback={
        <section>
          <Seo title="Not Found" path="/film/" />
          <p class="font-mono text-sm text-dim">专辑不存在。</p>
        </section>
      }
    >
      {(a) => (
        <article>
          <Seo
            title={a().title}
            description={a().description}
            path={`/film/${a().id}/`}
            type="article"
          />
          <header class="hw-article-head">
            <div class="hw-article-bar">
              <Breadcrumb
                items={[
                  { href: '/film/', label: 'Film' },
                  {
                    label: formatDateLong(a().date),
                    datetime: a().date,
                  },
                ]}
              />
              <h1 class="hw-title hw-title-article">{a().title}</h1>
            </div>
          </header>

          <Show when={a().html}>
            <ProseHtml html={a().html} class="hw-film-prose" />
          </Show>
        </article>
      )}
    </Show>
  );
}
