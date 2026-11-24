import { Title } from '@solidjs/meta';
import { For } from 'solid-js';
import ItemList from '../../components/ItemList';
import StnHeader from '../../components/StnHeader';
import { content, formatDateShort, listPosts, padIndex } from '../../lib/content';
import { pageTitle } from '../../lib/page-title';

const posts = listPosts(content.diary);
const lede = 'Field notes and daily logs.';
const meta = `MODE ${padIndex(posts.length)}`;

export default function DiaryIndex() {
  return (
    <section>
      <Title>{pageTitle('Diary')}</Title>
      <StnHeader caption="Archive" meta={meta} title="Diary" lede={lede} />

      <ItemList class="mt-8">
        <div class="hw-item-list-head" aria-hidden="true">
          <span>Title</span>
          <span data-align="end">Date</span>
        </div>
        <div class="hw-item-list-body" role="list">
          <For each={posts}>
            {(post) => (
              <a href={`/diary/${post.id}/`} class="hw-item-list-row" role="listitem">
                <span>{post.title}</span>
                <time datetime={post.date} data-align="end">
                  {formatDateShort(post.date)}
                </time>
              </a>
            )}
          </For>
        </div>
      </ItemList>
    </section>
  );
}
