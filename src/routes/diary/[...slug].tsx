import type { RouteProps } from '@solidjs/router';
import { Show } from 'solid-js';
import Breadcrumb from '../../components/Breadcrumb';
import ProseHtml from '../../components/ProseHtml';
import ReadingProgress from '../../components/ReadingProgress';
import Seo from '../../components/Seo';
import { content, formatDateLong, getPost } from '../../lib/content';

function slugOf(params: { slug?: string }) {
  return (params.slug ?? '').replace(/\/$/, '');
}

export default function DiaryPost(props: RouteProps<'/diary/*slug'>) {
  const post = () => getPost(content.diary, slugOf(props.params));

  return (
    <Show
      when={post()}
      fallback={
        <section>
          <Seo title="Not Found" path="/diary/" />
          <p class="font-mono text-sm text-dim">日记不存在。</p>
        </section>
      }
    >
      {(p) => (
        <>
          <Seo
            title={p().title}
            description={p().description}
            path={`/diary/${p().id}/`}
            type="article"
          />
          <ReadingProgress />
          <article>
            <header class="hw-article-head">
              <div class="hw-article-bar">
                <Breadcrumb
                  items={[
                    { href: '/diary/', label: 'Diary' },
                    {
                      label: formatDateLong(p().date),
                      datetime: p().date,
                    },
                  ]}
                />
                <h1 class="hw-title hw-title-article">{p().title}</h1>
              </div>
            </header>
            <ProseHtml html={p().html} />
          </article>
        </>
      )}
    </Show>
  );
}
