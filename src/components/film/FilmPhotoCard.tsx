import type { FilmPhotoRef } from '../../lib/content';

type Props = {
  photo: FilmPhotoRef;
  class?: string;
};

/** 与文章详情同一套 hw-img-frame（LQIP → 淡入）；灯箱由外层 FilmGallery 绑定 */
export default function FilmPhotoCard(props: Props) {
  const sized = () => Boolean(props.photo.w && props.photo.h);

  const frameStyle = () => {
    const parts: string[] = [];
    if (sized()) parts.push(`aspect-ratio:${props.photo.w}/${props.photo.h}`);
    if (props.photo.color) parts.push(`--ph-color:${props.photo.color}`);
    // 不加引号：与 rehype-image-size 一致，避免 url() 被写成 &quot;
    if (props.photo.lqip) parts.push(`--lqip:url(${props.photo.lqip})`);
    return parts.length ? parts.join(';') : undefined;
  };

  return (
    <div class={['hw-film-card', props.class]}>
      <span
        class={sized() ? 'hw-img-frame hw-img-frame--sized' : 'hw-img-frame'}
        style={frameStyle()}
        data-lqip={props.photo.lqip ? '' : undefined}
      >
        <img
          src={props.photo.src}
          alt={props.photo.alt}
          width={props.photo.w}
          height={props.photo.h}
          loading="lazy"
          decoding="async"
        />
      </span>
      <span class="hw-film-card-meta" aria-hidden="true">
        {props.photo.film && <span class="hw-film-card-film">{props.photo.film}</span>}
        <span class="hw-film-card-album">{props.photo.albumTitle}</span>
      </span>
    </div>
  );
}
