# Pixel website QA

final result: passed

## Targets and evidence

The accepted concepts are `design/nintendo-pixel/home.png` and `design/nintendo-pixel/blog.png`, both 1536 × 1024. The browser viewport was set to 1536 × 1024 for desktop comparisons. Saved browser JPEGs have the same pixel dimensions. No density conversion was needed.

Browser evidence is in `design/nintendo-pixel/qa/`. `desktop-home.jpg` and `desktop-blog.jpg` show resting states. `desktop-blog-portal.jpg` shows a route transition. The reference blog shows an attack, so character pose differs from the resting capture. `mobile-home.jpg` and `mobile-blog.jpg` were captured at a 390 × 844 CSS viewport with full-page capture.

The reference images and desktop captures were opened together for visual comparison. Header, monitor, cartridge labels, article rows, and companion were inspected at full resolution. Separate crops were unnecessary because those details were readable in the full-resolution view.

## Findings and fixes

- P2 mobile header overflow. At 390px the six links made the document 403px wide. Changed navigation to a six-column grid. The final document width equals 390px. A 320px check also has no overflow.
- P2 mobile greeting collision. The 48px title wrapped beyond its fixed hero area. Changed it to a 30–36px responsive size and adjusted scene and companion placement. The final 390px heading stays on one line and no longer overlaps the header or room.
- P2 missing experiment icon. The installed collection did not contain `flask`. Replaced it with the existing `ab-testing` icon and checked all new icon references against the collection.
- P2 desktop scene spacing. The initial room began too far below the greeting and pushed recent articles below the first viewport. Moved the room upward behind the open area beside the greeting and tightened recent-post spacing. The final capture shows both recent posts and the footer boundary.
- Escape regression found in source review. Restored reading-mode exit and desktop return while respecting the gallery handler and text input focus. Verified reading-mode exit in the browser.

## Fidelity

- Typography. Local Press Start 2P and Fusion Pixel provide Latin and Chinese display lettering. Navigation and titles use pixel type. Article titles and body use readable system sans-serif. Generated concept lettering is not an installable font, so exact letter shapes differ.
- Layout. Desktop keeps the header, room, monitor, cartridges, companion and recent-post hierarchy. Inner pages retain the red title bar and cream reading window. Mobile reflows controls into touch-sized links. The actual blog scrolls through all 15 visible posts rather than stopping after the five illustrative rows in the concept.
- Colors. Red, ivory, dark outlines, muted blue, green and ochre follow the accepted palette. Focus outlines are blue. Selected navigation and filters are red.
- Images. Room, idle sprite, attack sprite and portal are generated raster assets. Sprites and portal retain alpha transparency. Navigation text and reading content are live HTML. Inner pages reuse the room background rather than adding a second large decorative background.
- Content. Actual titles, dates, article bodies, photo albums and existing project data remain in use. Explicit frontmatter categories drive filters. Original introduction and contact links remain available under the homepage disclosure.

## Browser verification

- Homepage cartridge opens the blog. Header links load project, experiment, equipment and gallery headings.
- Category `生活` returns two posts. Search `tmux` returns one post. An unmatched query shows the empty state. Reset returns all 15 visible posts.
- Article opens and browser Back restores the list route.
- Reading mode expands the content and hides the companion. Escape restores normal mode.
- Clicking the companion triggers jump. Keyboard Enter triggers attack. Route changes show the portal and settle back to idle. Rapid navigation through existing pages reaches the final destination.
- Gallery opens a photo, advances to the next, and closes with Escape. Focus returns to the original thumbnail.
- Reduced-motion emulation disables the portal and reduces animation duration to 0.01ms. The preference override was cleared afterward.
- Responsive checks covered 320px, 390px, 768px and 1536px widths. Home and blog had no horizontal overflow after the fixes.
- Browser logs contain one earlier development hot-reload error from the interval before the new stylesheet existed. Restarting the development server resolved it. No new browser errors or warnings appeared during final interaction checks.
- Production build and targeted lint/format checks passed. The existing `env` syntax-highlighting fallback remains a non-blocking build warning.

## Follow-up polish

- The concept's sound icon is omitted because no audio feature was requested or implemented.
- Display lettering and peripheral room decorations differ slightly from the generated concept. These do not block reading or interaction.

## Implementation checklist

- [x] Pixel home and reading window.
- [x] Native navigation and persistent companion.
- [x] Search, classification, and empty state.
- [x] Mobile and reduced-motion behavior.
- [x] Production build and browser checks.
