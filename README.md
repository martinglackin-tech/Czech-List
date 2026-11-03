# Martin & Alex's Czech Phrasebook

A tiny offline-capable web app for our Czechia trip: 15 phrases you can hear, show full screen to a waiter, practise as flashcards and test in a quiz.

Inspired by the Japan phrasebook, but deliberately simpler: no build step, no dependencies.

| File | What it is |
|---|---|
| `index.html` | Page, styles and the full-screen overlays |
| `data.js` | The 15 phrases |
| `app.js` | App logic |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support and "Add to Home Screen" |

## Run it

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Serve it over http(s) (e.g. GitHub Pages) for offline mode to work. Open it once on each phone with signal, then "Add to Home Screen".
If you change the file list in `sw.js`, bump `CACHE`.

## Audio

Uses the phone's built-in Czech voice (works offline). If nothing speaks, install a Czech voice in the phone's speech/text-to-speech settings.

## Editing phrases

Edit `data.js`. `sound` is an English-style pronunciation guide (CAPITALS = stressed syllable).
