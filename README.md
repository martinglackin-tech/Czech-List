# Martin & Alex's Czech Phrasebook

A tiny offline-capable web app for our Czechia trip: 15 phrases you can hear, show full screen to a waiter, practise as flashcards and test in a quiz.

Inspired by the Japan phrasebook, but deliberately simpler: no build step, no dependencies (only the optional audio script needs Node 18+).

| File | What it is |
|---|---|
| `index.html` | Page, styles and the full-screen overlays |
| `data.js` | The 15 phrases |
| `app.js` | App logic |
| `audio/`, `tools/generate-audio.mjs` | Pre-generated recordings and the script that makes them |
| `fonts/` | Hanken Grotesk (OFL), bundled so it works offline |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support and "Add to Home Screen" |

## Run it

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Serve it over http(s) (e.g. GitHub Pages) for offline mode to work. Open it once on each phone with signal, then "Add to Home Screen".
If you change the file list in `sw.js`, bump `CACHE`.

## Audio

The app uses the first of these that works:

1. **Recordings** in `audio/` (natural neural voice, same on every phone, play offline). Each phrase has a normal and a natively-synthesised slow version; the Speed button in the bottom bar switches between them and remembers the choice.
2. **The phone's built-in Czech voice**, if there's no recording (also used at a slower rate in slow mode).

To create or refresh the recordings, make a Google Cloud API key with the Text-to-Speech API enabled, then run:

```sh
GOOGLE_TTS_API_KEY=your-key node tools/generate-audio.mjs
```

It only synthesises text that has no recording yet and removes recordings for text that no longer exists. Optional: `TTS_VOICE` (default `cs-CZ-Wavenet-A`) and `SLOW_RATE` (default `0.65`). Commit the `audio/` folder afterwards.
Open the app once with signal so the recordings are saved to the phone; after that they work offline.

## Editing phrases

Edit `data.js`. `sound` is an English-style pronunciation guide (CAPITALS = stressed syllable).
