# profilecard.

**Make your own aura.** A free, full-viewport identity card studio with a custom modular vector character, six graphic aura scenes, Reroll Aura, PNG export, local-first settings and offline-capable PWA installation.

## Run

Requires **Node.js 20+**. No npm dependencies, accounts, API keys or backend.

```sh
npm run dev
```

Open `http://localhost:4173`. Test with `npm run check`.

## Features

- Full-viewport desktop/mobile studio with Identity / Character / Aura tabs; the document never scrolls (on small screens only the control tab content may scroll)
- 7 a custom modular vector character or an uploaded photo (never sent to a server)
- 8 aura palettes (Eclipse, Phantom, Drift, Nova, Zenith, Frost, Chrome, Ember), 6 geometric aura scenes and custom scene/panel/accent colors
- Name, @handle, description and up to 3 tags
- Independent Random character and Reroll Aura actions, with identity fields, uploaded photos and existing avatar unaffected by aura-only rerolls
- Square 1080×1080 and wide 1200×630 PNG; 3.2-second looping GIF (420×420 or 600×315 at 10 fps) and Copy Image where supported
- Installable PWA, offline shell, local preferences, IndexedDB photo persistence
- Accessible forms, reduced-motion support and keyboard navigability

## Architecture

```text
index.html               Semantic editor layout
styles.css               Design system, responsive UI, motion
src/utils.js             Validation, colors, randomizer, presets
src/characters.js        Modular, customizable character artwork
src/card.js              Shared SVG preview and export renderer
src/app.js               Browser interactions, storage, PWA, PNG and animated GIF export
src/gif.js               Offline animated GIF89a encoder (RGB332 palette, LZW)
src/gif-worker.js        Asynchronous GIF compression worker
sw.js                    Offline-first service worker
manifest.webmanifest     PWA manifest
assets/                  Original application icons
scripts/serve.mjs        Dependency-free dev server
scripts/verify.mjs       Project static checks
tests/                   Node unit tests
.github/workflows/       GitHub CI
```

No remote fonts, analytics, requests to third-party services, paid API calls or generated AI assets at runtime. The same SVG scene renderer is used both for the live preview and PNG export, keeping compositions consistent. PNG captures the static pose; exported GIF frames sample the same SVG composition on a deterministic animation timeline. GIF has a 256-color palette, so some banding may appear on gradients.

## Deployment

Deploy the repository root to any **HTTPS static host** (Cloudflare Pages, Netlify, GitHub Pages etc.). All asset URLs, manifest references, and service worker scope are relative and support deploying to subpaths such as `/ProfileCard/`. For GitHub Pages, publish the root of `main` (or configure GitHub Actions deployment). For installability, HTTPS (or localhost) is required; on iOS, use Safari's Share → Add to Home Screen.

### PWA releases

When shipping a new version, increment the `CACHE` value in `sw.js` to replace pre-cached assets. Service worker installation does not force-refresh an editor with unsaved work. Chrome's install UI is not available in every browser; the in-app button offers an alternative instruction dialog.

## Character builder and GIF release v1.3

- Replaces the fixed gallery of characters with a single modular, user-built persona. Older settings are safely mapped to the builder options.
- Constant character blink/breathing motion, glow and ambient background movement. `prefers-reduced-motion` disables ambient preview animations without disabling export.
- On-device GIF export produces 32 frames in a 3.2-second loop at 10 fps, with progress, cancel, and background encoding in a Web Worker. GIFs use a capped output resolution to preserve performance on phones.
- No remote encoding server, new runtime dependencies or additional permissions.

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

### Visual editor v1.3
- Dark graphite studio with purple accents; no header install prompt or subtitle (PWA manifest and offline support remain).
- Character categories use actual SVG thumbnails for every style choice (face, hair, eyes, brows, lips, clothing, accessories).
- Face fullness is a live 75–125% range slider applied to the face geometry and saved with the profile.
- Skin, iris, hair and clothing colors are shown as selectable color swatches.
- All selections update the same avatar shared by the animated preview, PNG renderer and GIF frame renderer.
