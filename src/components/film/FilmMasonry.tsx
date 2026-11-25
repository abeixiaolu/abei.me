import type { FilmPhotoRef } from '../../lib/content';
import FilmGallery from './FilmGallery';

type Props = {
  photos: FilmPhotoRef[];
  class?: string;
};

export default function FilmMasonry(props: Props) {
  return <FilmGallery photos={props.photos} mode="masonry" class={props.class} />;
}
