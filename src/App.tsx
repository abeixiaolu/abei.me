import { Loading, Show, type ParentProps } from 'solid-js';
import { useLocation } from '@solidjs/router';
import Header from './components/Header';
import LinkPreview from './components/LinkPreview';
import Toaster from './components/Toaster';
import { Router } from './router';
import './styles/global.css';
import './styles/link-preview.css';

function isImgbedPath(pathname: string) {
  return pathname === '/_imgbed' || pathname === '/_imgbed/';
}

function AppShell(props: ParentProps) {
  const location = useLocation();
  const bare = () => isImgbedPath(location.pathname);

  return (
    <div
      class={
        bare()
          ? 'mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-5 sm:px-6 sm:py-7'
          : 'mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-7'
      }
    >
      <Show when={!bare()}>
        <Header />
      </Show>
      <main class={bare() ? 'flex-1 py-4 sm:py-6' : 'flex-1 py-8 sm:py-10'}>
        {/* 路由 chunk / 内容模块就绪前的占位；避免白底 Loading 文案被误认为图片加载 */}
        <Loading fallback={<div class="min-h-48" aria-busy="true" />}>
          {props.children}
        </Loading>
      </main>
      <Show when={!bare()}>
        <footer class="hw-footer">
          <p>© {new Date().getFullYear()} abei</p>
        </footer>
        <LinkPreview />
      </Show>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      {(props) => <AppShell>{props.children}</AppShell>}
    </Router>
  );
}
