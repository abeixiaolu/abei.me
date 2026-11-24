import { onSettled } from 'solid-js';
import { bindLinkPreview } from '../lib/link-preview';

/** 挂载外链悬停预览（全局一次绑定） */
export default function LinkPreview() {
  onSettled(() => {
    bindLinkPreview();
  });
  return null;
}
