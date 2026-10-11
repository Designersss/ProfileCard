# profilecard.

**Make your own aura.** A free, full-screen, photo-first identity card editor. Add your own picture, edit profile text, choose a cinematic palette, reroll the background and export an image or looping GIF. No generated characters, accounts, watermark or backend.

## Run

Requires Node.js 20+ and no third-party npm dependencies:

```sh
npm run dev
```

Visit `http://localhost:4173`. Run `npm run check` for unit tests and project validation.

## Features

- Dark full-screen editor with **Identity / Photo / Aura** tabs; internal panel scrolling on smaller screens only.
- Upload or replace a **JPEG, PNG or WebP photograph** (max 4 MB); resize locally and persist in IndexedDB. Remove photo from card and local database with one action. The empty state is a neutral photo placeholder.
- Name, username, bio, three tags; square and landscape outputs. Square tags have dedicated spacing above the lower border.
- Eight curated palettes, six geometric scenes, independent scene/info/accent colors.
- Reroll only changes styling — never your photo or profile text.
- Faster and more visible 2.4-second motion for light, background, decorative lines, and floating photo in preview; downloadable static PNG and 2.4-second GIF loop at 10fps. GIF encoding runs in an offline Web Worker, with cancel/progress.
- Offline-capable installable PWA. Cloudflare Web Analytics measures page visits, countries and referrers using an external browser script; profile fields and photos are not transmitted by the analytics integration.

## Project structure

- `index.html`, `styles.css` — responsive studio
- `src/app.js` — controls, image storage, export, PWA registration
- `src/card.js` — shared SVG scene rendering (photo and no-photo state)
- `src/utils.js` — pure state, validation and theme utilities
- `src/gif.js`, `src/gif-worker.js` — on-device GIF encoder and worker
- `sw.js`, `manifest.webmanifest`, `assets/` — offline shell and PWA resources
- `tests/`, `scripts/`, `.github/workflows/` — verification and CI

The same SVG is used for preview and PNG/GIF rendering, with deterministic time-based GIF frames. GIF uses a limited palette so gradients can show banding. GIF sizes are capped at 420×420 (square) or 600×315 (wide) to protect device performance; PNG remains full-resolution.

## Data & migration

All profile input and resized photo bytes stay in your browser. Profile fields and theme preferences use localStorage, while the photo is stored only in IndexedDB. Older saved avatars are **ignored** and no longer rendered; existing uploaded photos are retained. Remove Photo deletes the photo from the local database. Clearing site data removes all saved information.

## Deployment and checks

Build the public site with `npm run build`; this writes **only runtime assets** into `dist/` (no `node_modules/`, tests or source tooling). Serve `dist/` from a secure HTTPS static host. Relative paths support nested hosting directories. The service worker caches the shell, editor and GIF worker for offline use; bump its cache version on releases. Verify PWA install/refresh and GIF worker behavior on real HTTPS origins and physical iOS/Android devices before promoting a release.

Run `npm run check` and validate UI and exported PNG/GIF in browsers. `prefers-reduced-motion` disables continuous preview motion but does not prevent an explicitly requested GIF export.

### Privacy and visit analytics

Cloudflare Web Analytics is enabled via a single beacon script in `index.html` (Cloudflare site token is a public identifier). The script loads from `static.cloudflareinsights.com` when the browser is online and reports pageview metadata to Cloudflare. It is not cached for offline use. **Uploaded photos, bio, tags and card exports are processed locally and are not included in analytics events.** Cloudflare Web Analytics reports should not be interpreted as a unique-visitor count from Workers asset requests. The tracker may be blocked by privacy extensions.

### Cloudflare Workers Builds

This repository deploys through **Workers Builds** using `npx wrangler deploy`. The tracked `wrangler.jsonc` serves **`./dist`**, not the repository root. This excludes `node_modules/` and the oversized `workerd` binary.

Cloudflare Dashboard → **Workers & Pages → profilecard → Settings → Builds**:

- **Build command:** `npm run build` (replace `exit 0`).
- **Deploy command:** `npx wrangler deploy` (leave as-is).
- **Root directory:** `/`.
- **Production branch:** `main`.

After saving, retry the deployment or trigger a new deployment from `main`. The PWA shell and GIF worker are included in the output.

## License

MIT.
