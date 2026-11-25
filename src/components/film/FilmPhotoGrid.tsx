import type { FilmPhotoRef } from '../../lib/content';
import FilmGallery from './FilmGallery';

type Props = {
  photos: FilmPhotoRef[];
  class?: string;
};

export default function FilmPhotoGrid(props: Props) {
  return <FilmGallery photos={props.photos} mode="grid" class={props.class} />;
}
