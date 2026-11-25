import { For } from 'solid-js';
import { Portal } from '@solidjs/web';
import { dismissToast, getToasts } from '../lib/toast';

/** SPEC-01 / Hardware · Toast region（OLED 条，右下角堆叠） */
export default function Toaster() {
  const toasts = getToasts();

  return (
    <Portal>
      <div class="hw-toast-region" data-kit="toast-region" aria-live="polite">
        <For each={toasts()}>
          {(item, index) => (
            <div
              class="hw-toast"
              data-kit="toast"
              role="status"
              style={{ '--toast-index': String(index()) }}
              onClick={() => dismissToast(item.id)}
            >
              <div class="hw-toast-body min-w-0 flex-1">
                <p class="hw-toast-title" data-kit="toast-title">
                  {item.title}
                </p>
                {item.description ? (
                  <p class="hw-toast-desc" data-kit="toast-description">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </For>
      </div>
    </Portal>
  );
}
