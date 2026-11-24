import { Title } from '@solidjs/meta';
import ProseHtml from '../../components/ProseHtml';
import StnHeader from '../../components/StnHeader';
import { content } from '../../lib/content';
import { pageTitle } from '../../lib/page-title';

const page = content.pages.uses;

export default function UsesPage() {
  return (
    <section>
      <Title>{pageTitle(page.title)}</Title>
      <StnHeader
        caption={page.caption}
        meta={page.meta}
        title={page.title}
        lede={page.lede}
      />
      <ProseHtml class="mt-8" html={page.html} />
    </section>
  );
}
