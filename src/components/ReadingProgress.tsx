import { onSettled } from 'solid-js';

type Props = {
  target?: string;
};

/** SPEC-01 FlatKnob 风格阅读进度 */
export default function ReadingProgress(props: Props) {
  let root!: HTMLDivElement;

  onSettled(() => {
    const el = root;
    if (!el) return;

    const selector = props.target || 'article';
    const readout = el.querySelector<HTMLElement>('.hw-reading-readout');
    const led = el.querySelector<HTMLElement>('.hw-reading-led');
    if (!readout || !led) return;

    let frame = 0;

    const setProgress = (progress: number) => {
      const pct = Math.round(progress * 100);
      const turn = -135 + progress * 270;
      el.style.setProperty('--progress', String(progress));
      el.style.setProperty('--lit', String(progress));
      el.style.setProperty('--turn', `${turn}deg`);
      el.setAttribute('aria-valuenow', String(pct));
      el.toggleAttribute('data-complete', progress >= 1);
      readout.textContent = String(pct);
      led.dataset.lit = progress >= 1 ? 'true' : 'false';
    };

    const update = () => {
      frame = 0;
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) {
        el.hidden = true;
        return;
      }

      el.hidden = false;

      const viewH = window.innerHeight;
      const height = target.offsetHeight;
      const rect = target.getBoundingClientRect();
      const scrollable = height - viewH;

      let progress = 1;
      if (scrollable > 0) {
        progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      }

      const doc = document.documentElement;
      const atEnd =
        window.scrollY + viewH >= doc.scrollHeight - 2 || rect.bottom <= viewH + 1;
      if (atEnd) progress = 1;

      setProgress(progress);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  });

  return (
    <div
      ref={root}
      class="hw-reading-progress"
      role="progressbar"
      aria-label="阅读进度"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="0"
      style={{ '--progress': 0, '--lit': 0, '--turn': '-135deg' }}
    >
      <div class="hw-reading-toy" aria-hidden="true">
        <div class="hw-reading-head">
          <span class="hw-reading-brand">
            <span class="hw-reading-led" data-lit="false" />
            <span class="hw-reading-label">Read</span>
          </span>
          <output class="hw-reading-readout">0</output>
        </div>
        <div class="hw-reading-dial">
          <div class="hw-reading-cap" />
        </div>
      </div>
    </div>
  );
}
