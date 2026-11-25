type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 无障碍标签 */
  label: string;
  class?: string;
  /** 目录默认 48；卡片叠层用 sm */
  size?: 'md' | 'sm';
};

/** SPEC-01 / Hardware · Checkbox（按键 + 角 LED） */
export default function Checkbox(props: Props) {
  const size = () => props.size ?? 'md';

  return (
    <label
      class={['hw-check', props.class]}
      data-kit="check"
      data-size={size() === 'md' ? undefined : size()}
    >
      <input
        type="checkbox"
        class="sr-only"
        checked={props.checked}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        aria-label={props.label}
      />
      <span class="hw-checkbox" data-kit="checkbox" aria-hidden="true">
        <span
          class="hw-checkbox-led"
          data-kit="checkbox-indicator"
          data-checked={props.checked ? '' : undefined}
        />
      </span>
    </label>
  );
}
