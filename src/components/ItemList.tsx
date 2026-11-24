import type { ParentProps } from 'solid-js';

type Props = ParentProps<{
  columns?: string;
  class?: string;
}>;

/** SPEC-01 / Hardware · 51 Item list */
export default function ItemList(props: Props) {
  return (
    <div
      class={['hw-item-list', props.class]}
      style={{ '--columns': props.columns ?? 'minmax(0, 1fr) auto' }}
    >
      {props.children}
    </div>
  );
}
