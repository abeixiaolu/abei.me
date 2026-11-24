import { Title } from '@solidjs/meta';
import type { RouteProps } from '@solidjs/router';
import { Show } from 'solid-js';
import Breadcrumb from '../../components/Breadcrumb';
import ProseHtml from '../../components/ProseHtml';
import ReadingProgress from '../../components/ReadingProgress';
import { content, formatDateLong, getPost } from '../../lib/content';
import { pageTitle } from '../../lib/page-title';

function slugOf(params: { slug?: string }) {
  return (params.slug ?? '').replace(/\/$/, '');
}

export default function BlogPost(props: RouteProps<'/blog/*slug'>) {
  const post = () => getPost(content.blog, slugOf(props.params));

  return (
    <Show
      when={post()}
      fallback={
        <section>
          <Title>{pageTitle('Not Found')}</Title>
          <p class="font-mono text-sm text-dim">文章不存在。</p>
        </section>
      }
    >
      {(p) => (
        <>
          <Title>{pageTitle(p().title)}</Title>
          <ReadingProgress />
          <article>
            <header class="hw-article-head">
              <div class="hw-article-bar">
                <Breadcrumb
                  items={[
                    { href: '/blog/', label: 'Blog' },
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
