import { Link, Meta, Title } from '@solidjs/meta';
import { pageTitle } from '../lib/page-title';
import { absoluteUrl, canonicalPath, site } from '../lib/site';

type SeoProps = {
  title: string;
  description?: string;
  /** 站点内路径，如 `/blog/foo/` */
  path?: string;
  image?: string;
  type?: 'website' | 'article';
};

/** 页面级 title / description / Open Graph / Twitter Card */
export default function Seo(props: SeoProps) {
  const title = () => pageTitle(props.title);
  const description = () => props.description?.trim() || site.description;
  const url = () => absoluteUrl(canonicalPath(props.path ?? '/'));
  const image = () => absoluteUrl(props.image ?? site.ogImage);
  const type = () => props.type ?? 'website';

  return (
    <>
      <Title>{title()}</Title>
      <Meta name="description" content={description()} />
      <Link rel="canonical" href={url()} />
      <Meta property="og:type" content={type()} />
      <Meta property="og:site_name" content={site.name} />
      <Meta property="og:locale" content="zh_CN" />
      <Meta property="og:title" content={title()} />
      <Meta property="og:description" content={description()} />
      <Meta property="og:url" content={url()} />
      <Meta property="og:image" content={image()} />
      <Meta property="og:image:width" content="1200" />
      <Meta property="og:image:height" content="630" />
      <Meta property="og:image:alt" content={title()} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={title()} />
      <Meta name="twitter:description" content={description()} />
      <Meta name="twitter:image" content={image()} />
    </>
  );
}
