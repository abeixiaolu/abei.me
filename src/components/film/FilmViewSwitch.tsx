import { For } from 'solid-js';

export type FilmView = 'gallery' | 'album';

type Props = {
  value: FilmView;
  onChange: (view: FilmView) => void;
  class?: string;
};

const OPTIONS: Array<{ id: FilmView; label: string; icon: string }> = [
  { id: 'gallery', label: 'Gallery', icon: 'i-carbon-image' },
  { id: 'album', label: 'Album', icon: 'i-carbon-grid' },
];

/** SPEC-01 / Hardware · 04 Segmented control */
export default function FilmViewSwitch(props: Props) {
  return (
    <div class={['hw-film-seg', props.class]} role="group" aria-label="展示形式">
      <For each={OPTIONS}>
        {(opt) => (
          <button
            type="button"
            class="hw-film-seg-btn"
            aria-pressed={props.value === opt.id ? 'true' : 'false'}
            onClick={() => props.onChange(opt.id)}
          >
            <span class={[opt.icon, 'hw-film-seg-icon']} aria-hidden="true" />
            {opt.label}
          </button>
        )}
      </For>
    </div>
  );
}
