type Props = {
  caption?: string;
  meta?: string;
  title: string;
  lede?: string;
  class?: string;
};

/** 千禧年 STN 字符液晶页头 */
export default function StnHeader(props: Props) {
  return (
    <header class={['hw-stn', props.class]}>
      <div class="hw-stn-bezel">
        <div class="hw-stn-glass">
          {(props.caption || props.meta) && (
            <div class="hw-stn-top">
              {props.caption && <span>{props.caption}</span>}
              {props.meta && <span>{props.meta}</span>}
            </div>
          )}
          <h1 class="hw-stn-title">{props.title}</h1>
          {props.lede && <p class="hw-stn-lede">{props.lede}</p>}
        </div>
      </div>
    </header>
  );
}
