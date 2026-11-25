import { For } from 'solid-js';
import ItemList from '../../components/ItemList';
import Seo from '../../components/Seo';
import StnHeader from '../../components/StnHeader';
import { content, formatDateShort, listPosts, padIndex } from '../../lib/content';

const posts = listPosts(content.blog);
const lede = 'Notes, tutorials, and asides.';
const meta = `MODE ${padIndex(posts.length)}`;

export default function BlogIndex() {
  return (
    <section>
      <Seo title="Blog" description={lede} path="/blog/" />
      <StnHeader caption="Archive" meta={meta} title="Blog" lede={lede} />

      <ItemList class="mt-8">
        <div class="hw-item-list-head" aria-hidden="true">
          <span>Title</span>
          <span data-align="end">Date</span>
        </div>
        <div class="hw-item-list-body" role="list">
          <For each={posts}>
            {(post) => (
              <a href={`/blog/${post.id}/`} class="hw-item-list-row" role="listitem">
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
