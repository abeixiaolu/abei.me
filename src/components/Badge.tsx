import type { ParentProps } from 'solid-js';

type Props = ParentProps<{
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  wrap?: boolean;
  class?: string;
}>;

/** SPEC-01 / Hardware · 34 Badge */
export default function Badge(props: Props) {
  const tone = () => props.tone ?? 'neutral';
  return (
    <span
      class={['hw-badge', props.class]}
      data-tone={tone() === 'neutral' ? undefined : tone()}
      data-wrap={props.wrap ? '' : undefined}
    >
      {props.children}
    </span>
  );
}
