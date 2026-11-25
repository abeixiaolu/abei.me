import { Loading } from 'solid-js';
import Header from './components/Header';
import LinkPreview from './components/LinkPreview';
import { Router } from './router';
import './styles/global.css';
import './styles/link-preview.css';

export default function App() {
  return (
    <Router>
      {(props) => (
        <div class="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-7">
          <Header />
          <main class="flex-1 py-8 sm:py-10">
            {/* 路由 chunk / 内容模块就绪前的占位；避免白底 Loading 文案被误认为图片加载 */}
            <Loading fallback={<div class="min-h-48" aria-busy="true" />}>
              {props.children}
            </Loading>
          </main>
          <footer class="hw-footer">
            <p>© {new Date().getFullYear()} abei</p>
          </footer>
          <LinkPreview />
        </div>
      )}
    </Router>
  );
}
