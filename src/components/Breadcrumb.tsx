import { For } from 'solid-js';

type Crumb = {
  label: string;
  href?: string;
  datetime?: string;
};

type Props = {
  items: Crumb[];
  class?: string;
};

/** SPEC-01 / Hardware · 36 Breadcrumb */
export default function Breadcrumb(props: Props) {
  return (
    <nav class={['hw-breadcrumb', props.class]} aria-label="面包屑">
      <ol class="hw-breadcrumb-list">
        <For each={props.items}>
          {(item, i) => {
            const current = () => i() === props.items.length - 1 || !item.href;
            return (
              <li>
                {current() ? (
                  <span class="hw-breadcrumb-current" aria-current="page">
                    {item.datetime ? (
                      <time datetime={item.datetime}>{item.label}</time>
                    ) : (
                      item.label
                    )}
                  </span>
                ) : (
                  <a class="hw-breadcrumb-link" href={item.href}>
                    {item.label}
                  </a>
                )}
              </li>
            );
          }}
        </For>
      </ol>
    </nav>
  );
}
