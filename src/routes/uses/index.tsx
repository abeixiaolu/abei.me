import ProseHtml from '../../components/ProseHtml';
import Seo from '../../components/Seo';
import StnHeader from '../../components/StnHeader';
import { content } from '../../lib/content';

const page = content.pages.uses;

export default function UsesPage() {
  return (
    <section>
      <Seo
        title={page.title}
        description={page.description ?? page.lede}
        path="/uses/"
      />
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
