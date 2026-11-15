# Descent-Proof

An 8-day mountaineering and core training cycle built around eccentric leg strength for descents, with deep-core, grip and endurance days. Works as a normal website and installs to a phone home screen as an offline app (PWA).

- Two phases: Phase 1 (foundation) and Phase 2 (adds depth drops and hop-downs)
- Tap a row to tick off an exercise; progress is saved in your browser (`localStorage`) and nothing leaves your device
- Per-exercise "i" info, warm-up lists and demo search links
- Remembers your phase and the day you were on; `#d3` style links open a specific day
- No build step, no dependencies, no tracking

## Run it locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly also works, but offline install/caching needs `http(s)`.)

## Deploy on GitHub Pages

1. Create a repo and push these files to the `main` branch.
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After a minute the app is live at `https://<your-username>.github.io/<repo-name>/`.
4. On your phone: open that URL, then **Share → Add to Home Screen** (iOS) or **Install app** (Android/Chrome).

All paths are relative, so it works under the `/<repo-name>/` sub-path.

## Project layout

```
index.html            the program (days, exercises, notes)
css/styles.css        styles
js/app.js             tabs, phase toggle, progress tracking
js/info.js            text for the "i" buttons (keyed by the data-info id)
sw.js                 offline cache (service worker)
manifest.webmanifest  install metadata
icons/                app icons
```

## Editing the program

- Exercises live in the tables in `index.html`. Each row has a unique `data-id` on its checkbox; keep ids stable or people's saved ticks will shift. Use the `phase2` class on a row for Phase 2-only exercises.
- Add the matching "i" text to `js/info.js` using the same id.
- **After you change any file, bump `CACHE_VERSION` in `sw.js`** (e.g. `descent-proof-v2`) so installed copies update.

## Disclaimer

General training information, not medical advice. Stop an exercise if you get sharp, localized or swelling-associated pain and see a physio or sports doctor if it persists.
