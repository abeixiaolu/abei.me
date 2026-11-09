# Candidate B. Layout-owned departure transition

## Problem

Implement the approved pixel desktop and blog views while keeping current articles, routes, projects, demos, equipment, and gallery. This candidate makes a short Inuyasha attack happen before the route changes. It therefore takes responsibility for navigation timing as well as the companion animation.

## Usage

Page components keep ordinary links. Layout owns the coordinator and the companion stays mounted across page changes.

```vue
<a href="/blog">进入博客</a>
<a :href="post.url">{{ post.frontmatter.title }}</a>
<PixelCompanion :state="travel.state" @interact="travel.play" />
```

```ts
const travel = usePixelTravel({ router, reducedMotion });
```

Callers never wait for animation or invoke navigation twice. Buttons that close an application keep calling `router.go('/')`. The same coordinator receives that navigation.

## Grounding

`Layout.vue` owns the current desktop shell, active app, VitePress router, phone menu, and reading expansion. It selects `Home`, `BlogIndex`, `BlogShow`, `Projects`, `Demos`, `Uses`, and `Gallery` from frontmatter. Its `DeskScene` callback currently invokes `router.go` directly.

`Home.vue` and `BlogItem.vue` already render real anchors. `blog.data.ts` sorts content and removes hidden and series-child entries. It can remain the source of article metadata. Blog filter and search state belongs to `BlogIndex.vue`, not the transition coordinator.

`app.css` imports `retro.css` followed by `terminal.css`. These sheets impose the physical CRT and phone layout and terminal colors. Replace the shell import with a pixel stylesheet. Keep article typography, code styling, and markdown alerts. Shared page selectors need an audit because terminal styles currently also style project and gallery components.

The installed VitePress router attaches a click listener to `window` with `capture: true` in `node_modules/vitepress/dist/client/app/router.js`. It awaits `router.onBeforeRouteChange(href)` before committing. It bypasses this hook for popstate. A Layout `@click.capture` runs after the window capture listener and cannot safely postpone the router. This candidate must use the awaited router hook, not a second DOM navigation handler.

## Shape

Model the Domain changes the representation from separate attack, loading, destination, and animation booleans to one discriminated union.

```ts
type TravelState =
  | { kind: 'idle' }
  | { kind: 'jump'; sequence: number }
  | { kind: 'departing'; sequence: number; destination: string }
  | { kind: 'arriving'; sequence: number };

type TravelOptions = {
  router: ReturnType<typeof useRouter>;
  reducedMotion: Readonly<Ref<boolean>>;
};

function usePixelTravel(options: TravelOptions): {
  state: Readonly<Ref<TravelState>>;
  play(): void;
};
```

Boundary Discipline places URL parsing in the router hook. It compares origin, pathname, and search with the current location. Same-document hash changes proceed immediately. Modified clicks, downloads, external links, and links with a target already remain native under the installed VitePress listener and never enter the hook.

The coordinator installs one `onBeforeRouteChange` handler during mount and restores the previous handler on teardown. It respects a previous handler's false result before starting an effect. It owns one pending timer and one sequence counter. The pending resolver belongs to the coordinator closure, not public state.

A qualifying navigation cancels any pending departure with a false result, increments the sequence, and sets departing. After approximately 240 ms it resolves true only if that sequence is still current. Returning true lets VitePress perform its single navigation. Do not call `router.go` from the hook, which would recurse.

Route changes move the visual state to arriving, then idle after a short effect. A popstate listener cancels pending departure before it can push another URL. A reduced-motion preference change immediately resolves the newest requested navigation and clears the effect. Teardown clears timers and resolves outstanding waits false. No awaited animationend event controls whether a link works.

Rapid clicks use latest destination wins. Every canceled request receives false. History navigation cancels all delayed requests and does not animate departure. Keyboard Enter on an ordinary link follows VitePress and works without a pointer coordinate. The companion button uses jump and does not navigate.

## Module map

- `Layout.vue` owns the shell, app registry, current route, and the single coordinator instance.
- `composables/usePixelTravel.ts` owns transition state, router hook lifecycle, pending navigation cancellation, and motion preference handling.
- `components/PixelCompanion.vue` renders idle and attack PNGs plus speech bubbles. It emits interact and owns no navigation.
- `pages/Home.vue` places interactive anchors above the room image and renders latest posts.
- `pages/Blog/BlogIndex.vue` owns article search and category filtering with a derived grouped list.
- `styles/pixel.css` defines the shared red and ivory palette, desktop windows, responsive layout, sprite animations, and reduced-motion overrides.
- `src/public/pixel/` stores generated room and sprite assets. The parent supplies these assets independently.

## Tradeoffs accepted

- A short navigation delay gives the sword attack a clear cause and effect. It also makes every navigation slower by design.
- The public API is small, but the coordinator inherits cancellation, lifecycle, and router-hook compatibility work.
- History remains immediate. Its visual transition differs from clicking a link.
- Mobile uses a compact companion button outside the text flow and instant or shorter effects. Background art becomes a smaller scene instead of forcing the desktop composition into a narrow viewport.

## Alternatives considered

A route-reactive companion with native immediate navigation is safer and smaller. It cannot guarantee the complete attack is visible on the departing page. If the visual target permits an effect on the arriving page, prefer that alternative.

A dedicated animated-link component makes timing explicit but requires replacing every markdown and component link. Its callers must understand navigation policy and it creates two types of links. Reject it.

A root click interception handler appears simpler but runs too late in this VitePress version. Reject it based on the installed router source.

## Synthesis decision

This is a viable candidate only if the departure animation is an essential product requirement. The task asks for traversing pages and skills during navigation, so native navigation with a persistent route-reactive companion likely meets the goal with less failure risk. Preserve the cancellation and reduced-motion rules if the parent chooses this blocking design.

## Verification required

Verify homepage to blog, blog to article, article return, header navigation, browser back during the 240 ms departure, fast repeated clicks, keyboard Enter, modifier-click, same-document headings, external links, downloads, and prefers-reduced-motion. Verify no handler survives teardown or HMR. Confirm portrait mobile has no horizontal overflow and the companion never blocks article links.

## Next implementation step

If selected, first implement and browser-check the hook and cancellation flow with two existing links before replacing the visual shell.
