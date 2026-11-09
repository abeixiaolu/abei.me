# Candidate A. Native navigation with a persistent companion

The goal is to implement the approved Nintendo pixel desktop and blog designs with an interactive Inuyasha companion. Visitors keep working article, project, experiment, equipment, and gallery links. This candidate changes presentation and adds animation without taking ownership of navigation.

## Current architecture

### Overview

VitePress owns URL changes and Markdown rendering. `.vitepress/theme/Layout.vue` selects the page component from `frontmatter.layout`. Its existing outer shell is a Three.js desk on desktop and a phone on mobile. Content renders inside a separately scrolling device screen.

### Key concepts

- `route.path` identifies the current page. The layout already watches it to close the menu and reset the content scroll position.
- `frontmatter.layout` selects `Home`, `BlogIndex`, `BlogShow`, `Projects`, `Demos`, `Uses`, or `Gallery`. Unknown layouts fall through to `Content`.
- The current `apps` array owns the main navigation in `Layout.vue`. `Home.vue` repeats four of those entries as shortcuts.
- `blog.data.ts` loads Markdown articles, groups series children, sorts by date, and excludes hidden entries. `Home.vue` and `BlogIndex.vue` consume the same result.

### How it works

VitePress compiles the Markdown page and supplies its frontmatter. The root layout chooses the corresponding component. Existing article links are anchors, so the router handles normal clicks, browser history, and hash links.

The installed router in `node_modules/vitepress/dist/client/app/router.js` adds an early window capture listener. It rejects modified clicks, downloads, explicit targets, and external links. For a valid local HTML link it prevents the browser default and calls `router.go`. Loading the route updates `route.path` only after the page module resolves. A component click listener can therefore see `defaultPrevented` before it runs. New code must not use a parent click handler to replace or delay this router behavior.

`app.css` imports base typography and code styles, then `retro.css` and `terminal.css`. The former owns the desk and phone shell. The latter mixes device colors with reusable article, project, demo, and gallery styles. Replacing these two imports requires porting their useful content rules into the pixel stylesheet. Simply adding more overrides risks retaining fixed screens, dark prose, or phone dimensions.

### Where things live

- `.vitepress/theme/Layout.vue` owns the persistent shell and page selection.
- `.vitepress/theme/pages/Home.vue` owns the introduction, shortcuts, and recent posts.
- `.vitepress/theme/pages/Blog/BlogIndex.vue` groups articles by year.
- `.vitepress/theme/pages/Blog/BlogShow.vue` renders article content.
- `.vitepress/theme/components/BlogItem.vue` owns the article row.
- `.vitepress/theme/components/TerminalHeader.vue` supplies headings shared by the remaining pages.
- `.vitepress/config.mts` assigns `blog-show` to article paths. Existing routes need no changes.

### Gotchas

The articles currently have no category or tags field. The mockup's category filters cannot safely pretend categories already exist. Add explicit metadata for a real filter or use search as the only new filter.

Gallery controls already handle Escape, focus restoration, and a dialog. A global Escape handler must respect `defaultPrevented` and must not close the page while the gallery handles the same key.

## Usage first

Call sites keep ordinary navigation. The companion receives the route as an observed value, not as a callback that decides when navigation may continue.

```vue
<a v-for="app in apps" :key="app.path" :href="app.path">
	{{ app.label }}
</a>

<main id="main-content" tabindex="-1">
	<Home v-if="isHome" />
	<PixelWindow v-else :title="activeApp.title">
		<BlogIndex v-if="frontmatter.layout === 'blog'" />
		<Content v-else />
	</PixelWindow>
</main>

<PixelCompanion :route-path="route.path" :placement="isHome ? 'desk' : 'window'" />
```

```vue
<a class="cartridge" href="/blog">博客</a>
<a :href="post.url">{{ post.frontmatter.title }}</a>
```

The final layout retains all existing page branches. The shortened sketch only illustrates the ownership boundary.

## Shape

`PixelCompanion.vue` owns one discriminated state and its animation cancellation. The Model the Domain principle changes the choice from multiple booleans to one state, so idle and attack cannot be active together.

```ts
type CompanionState =
	| { kind: 'idle' }
	| { kind: 'jump'; sequence: number }
	| { kind: 'attack'; sequence: number }
	| { kind: 'portal'; sequence: number };

type CompanionProps = {
	routePath: string;
	placement: 'desk' | 'window';
};

function play(action: 'jump' | 'attack' | 'portal'): void {
	throw new Error('not implemented');
}

function cancelAnimation(): void {
	throw new Error('not implemented');
}
```

The component exposes no imperative methods. It renders a semantic button with an accessible label. Activating the button alternates jump and attack. Watching a changed route path triggers a short portal sequence. This hides animation timing, sprite selection, particle lifetime, and cancellation from every link caller.

Use one navigation registry for header links and home cartridges. It contains `path`, `label`, `title`, `icon`, `color`, and a `cartridge` flag. The root derives the active entry from the route. The home derives cartridge entries from the same table. Do not store a second selected page state.

The art belongs in raster assets. The header, article rows, search input, buttons, and cartridge labels stay actual HTML. The room image must contain no navigation text, companion, or complete article window.

## File ownership

| File | Responsibility |
| --- | --- |
| `.vitepress/theme/Layout.vue` | Pixel header, background placement, content window, page selection, skip link, persistent companion. |
| `.vitepress/theme/components/PixelCompanion.vue` | Character button, action state, sprite animation, reduced-motion behavior, cleanup. |
| `.vitepress/theme/navigation.ts` | Navigation registry shared by header and home. |
| `.vitepress/theme/pages/Home.vue` | Greeting, monitor CTA, live cartridge links, recent articles, original bio links. |
| `.vitepress/theme/pages/Blog/BlogIndex.vue` | Article search, year groups, result count and empty state. |
| `.vitepress/theme/components/BlogItem.vue` | Full-width accessible article row with date and arrow. |
| `.vitepress/theme/styles/pixel.css` | Pixel palette, layout, reusable content styles, responsive rules, focus states. |
| `src/public/pixel/room.webp` | Generated desktop scene without live UI. Assumed asset path. |
| `src/public/pixel/inuyasha-idle.png` | Transparent standing sprite. Assumed asset path. |
| `src/public/pixel/inuyasha-attack.png` | Transparent sword pose. Assumed asset path. |

`PixelWindow` can remain markup in `Layout.vue`. Extract it only if more than one caller needs that window structure.

## Interaction guarantees

- Navigation never waits for a timer or animation event. Modified clicks, middle-click, context menus, downloads, external links, keyboard activation, and back/forward retain the router's existing behavior.
- A successful path change cancels the previous animation and starts a fresh portal sequence. A monotonically increasing sequence prevents stale timeout completion from overwriting the latest action.
- Animation cleanup clears every timeout on unmount. An animation end event is optional polish rather than the only way back to idle.
- Hash and search changes do not trigger the companion because the watcher observes only `route.path`.
- Reduced-motion mode displays a short static speech bubble or pose change. It disables translation, spinning portals, repeating bobbing, and particles. Navigation remains immediate.
- Desktop companion placement reserves a margin beside the reading window. Decorative effects have `pointer-events: none`. The companion button alone accepts input.
- On mobile the scene becomes a shorter banner and cartridges become a grid. Articles scroll with the document. The companion sits in a reserved area below the toolbar rather than covering text.
- The header and article links receive visible focus rings. Search has a persistent accessible label. The character's speech bubble is not repeatedly announced as a live region.

## Visual composition

Match the reference's ivory header, red active tab, wide pixel room, and modest recent-post strip. On desktop, the scene can scale at a fixed aspect ratio. Align the live monitor CTA and cartridge group against that ratio. Reflow these controls into normal document flow on narrow screens so they remain large enough to use.

For inner pages, place a cream reading window over a quiet room backdrop. Keep the room visible in the side margins. Reserve the right margin for the companion and portal. Body text should be a readable local Chinese sans-serif font. Pixel treatment belongs in headings, Latin display type, icons, borders, and art.

## Alternatives considered

| Alternative | Benefit | Cost | Decision |
| --- | --- | --- | --- |
| Local companion observes completed routes. | Small public interface, native link safety, no navigation delays. | The sword sequence accompanies arrival rather than holding the old page. | Preferred. |
| Shared navigation coordinator intercepts links and waits for an exit animation. | Precise old-page attack and new-page arrival choreography. | Must cooperate with VitePress capture handlers, loading failures, history, keyboard links, and cancellation. | Reject for this iteration. |
| Canvas renders room, navigation, and companion. | One pixel coordinate system. | Recreates text layout, link semantics, focus, search, and mobile behavior. | Reject. |

## Tradeoffs accepted

We accept an arrival animation instead of delaying navigation. This keeps links reliable and preserves the existing VitePress routing contract.

We accept a responsive mobile arrangement that differs from the desktop illustration. This keeps every control reachable and leaves articles readable.

## Verification targets

Use the real browser to inspect home and blog at desktop and mobile widths. Activate a cartridge, open an article, return using browser history, and activate the companion by keyboard. Rapidly open two different pages and check that the last route stays visible while the companion returns to idle. Verify no animation blocks interaction, no horizontal overflow, no hidden article text, and no broken gallery dialog keys. Repeat with reduced motion enabled.

## Synthesis decision

Pending parent comparison with candidate B. This candidate produces no source changes.

## Next implementation step

Replace the root shell and its style imports, while keeping the existing page selection and anchor links intact.
