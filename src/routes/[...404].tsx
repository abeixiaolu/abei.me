import type { RouteDefinition } from '@solidjs/router';
import { httpStatus } from '@solidjs/web';
import Seo from '../components/Seo';

export const route = {
  preload: () => httpStatus(404),
} satisfies RouteDefinition;

export default function NotFound() {
  return (
    <section>
      <Seo title="Not Found" />
      <h1 class="hw-title">404</h1>
      <p class="mt-3 font-mono text-sm text-dim">Page not found.</p>
    </section>
  );
}
