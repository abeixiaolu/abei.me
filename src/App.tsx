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
            <Loading fallback={<p class="font-mono text-sm text-dim">Loading…</p>}>
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
