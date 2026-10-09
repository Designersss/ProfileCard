# profilecard.

**Make your own aura.** A free, full-viewport identity card studio with original vector characters, six graphic aura scenes, Reroll Aura, PNG export, local-first settings and offline-capable PWA installation.

## Run

Requires **Node.js 20+**. No npm dependencies, accounts, API keys or backend.

```sh
npm run dev
```

Open `http://localhost:4173`. Test with `npm run check`.

## Features

- Full-viewport desktop/mobile studio with Identity / Character / Aura tabs; the document never scrolls (on small screens only the control tab content may scroll)
- 7 original vector characters or an uploaded photo (never sent to a server)
- 8 aura palettes (Eclipse, Phantom, Drift, Nova, Zenith, Frost, Chrome, Ember), 6 geometric aura scenes and custom scene/panel/accent colors
- Name, @handle, description and up to 3 tags
- Reroll Aura preserving identity fields and uploaded photos, and avoiding unchanged palette selection
- Square 1080×1080 and wide 1200×630 PNG, plus Copy Image where supported
- Installable PWA, offline shell, local preferences, IndexedDB photo persistence
- Accessible forms, reduced-motion support and keyboard navigability

## Architecture

```text
index.html               Semantic editor layout
styles.css               Design system, responsive UI, motion
src/utils.js             Validation, colors, randomizer, presets
src/characters.js        Original scalable SVG characters
src/card.js              Shared SVG preview and export renderer
src/app.js               Browser interactions, storage, PWA, export
sw.js                    Offline-first service worker
manifest.webmanifest     PWA manifest
assets/                  Original application icons
scripts/serve.mjs        Dependency-free dev server
scripts/verify.mjs       Project static checks
tests/                   Node unit tests
.github/workflows/       GitHub CI
```

No remote fonts, analytics, requests to third-party services, paid API calls or generated AI assets at runtime. The same SVG scene renderer is used both for the live preview and PNG export, keeping compositions consistent. Preview motion is intentionally excluded from static image export.

## Deployment

Deploy the repository root to any **HTTPS static host** (Cloudflare Pages, Netlify, GitHub Pages etc.). All asset URLs, manifest references, and service worker scope are relative and support deploying to subpaths such as `/ProfileCard/`. For GitHub Pages, publish the root of `main` (or configure GitHub Actions deployment). For installability, HTTPS (or localhost) is required; on iOS, use Safari's Share → Add to Home Screen.

### PWA releases

When shipping a new version, increment the `CACHE` value in `sw.js` to replace pre-cached assets. Service worker installation does not force-refresh an editor with unsaved work. Chrome's install UI is not available in every browser; the in-app button offers an alternative instruction dialog.

## Aura redesign v1.1

- Page-level scrolling is disabled; the stage and editor resize within `100dvh`. On smaller devices the active tab can scroll internally so fields are never clipped.
- Square and wide cards use darker colors, editorial typography, restrained glow/geometry, and less childish character expressions.
- Tabs use native buttons, `role=tablist`, `aria-selected`, and arrow-key/Home/End keyboard navigation.
- Existing custom color selections survive migration; legacy pastel presets migrate to the new Eclipse defaults without losing profile text.
- `prefers-reduced-motion` disables ambient movement, reroll effects, and transitions.

## Security & privacy

The app never uploads names, tags or profile photos. Files are checked for type and limited to 4 MB before local image resampling; their resized data is saved in IndexedDB. User-provided text is escaped before SVG or HTML markup. No cookies and no tracking. Data can be deleted by clearing this site's browser storage.

## Note on technology

For this tiny static tool, the implementation intentionally uses standards-based browser **ES modules**, instead of React/Vite. This removes runtime dependencies, keeps PWA caching simple, and makes it directly deployable as a static site. If the editor grows substantially, the modules can be migrated to a component framework without changing the SVG artwork or pure design/state utilities.

## License

MIT for source code and original illustrations in this repository.
