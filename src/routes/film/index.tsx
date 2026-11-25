import { Match, Switch } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import FilmAlbumGrid from '../../components/film/FilmAlbumGrid';
import FilmMasonry from '../../components/film/FilmMasonry';
import FilmViewSwitch, { type FilmView } from '../../components/film/FilmViewSwitch';
import Seo from '../../components/Seo';
import StnHeader from '../../components/StnHeader';
import { flattenFilmPhotos, listFilmAlbums, padIndex } from '../../lib/content';
import '../../styles/film.css';

const albums = listFilmAlbums();
const photos = flattenFilmPhotos(albums);
const lede = 'Frames and albums on film.';

function parseView(raw: string | string[] | undefined): FilmView {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'album' || value === 'gallery') return value;
  return 'gallery';
}

export default function FilmIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = () => parseView(searchParams.view);

  const setView = (next: FilmView) => {
    setSearchParams({ view: next === 'gallery' ? undefined : next });
  };

  return (
    <section>
      <Seo title="Film" description={lede} path="/film/" />
      <StnHeader
        caption="Roll"
        meta={`MODE ${padIndex(photos.length)}`}
        title="Film"
        lede={lede}
      />

      <div class="hw-film-toolbar">
        <FilmViewSwitch value={view()} onChange={setView} />
      </div>

      <Switch>
        <Match when={view() === 'gallery'}>
          <FilmMasonry photos={photos} />
        </Match>
        <Match when={view() === 'album'}>
          <FilmAlbumGrid albums={albums} />
        </Match>
      </Switch>
    </section>
  );
}
