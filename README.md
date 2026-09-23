# For Sandra — a quiet letter

A private, cinematic, mobile-first letter experience. No frameworks, no build
step, no dependencies — just three small files plus the letter itself.

## Files

| File          | Purpose                                             |
| ------------- | --------------------------------------------------- |
| `index.html`  | Semantic shell: intro, cover, HUD, ending, backgrounds |
| `styles.css`  | All visual design, chapter color tones, motion      |
| `app.js`      | Flow, navigation (tap / swipe / keys), particles    |
| `content.js`  | **The letter — edit this file to change the words** |
| `fonts/`      | Self-hosted Newsreader & Jost (variable, woff2 + OFL licenses) |

## Editing the letter

Open `content.js`. Everything you may want to change lives there:

- `to` — her name (used in the title if you edit the markup to use it)
- `signature` — the sign-off
- `sections` — one entry per screen. Each entry has:
  - `type`: `"chapter"` or `"ending"`
  - `label`: private note to yourself (not displayed)
  - `tone`: `tone-0` … `tone-9` — the background color mood for that screen
    (defined at the top of `styles.css`)
  - `lines`: array of paragraphs. Inline HTML is allowed:
    - `<em>…</em>` → soft, dimmed italic (asides, quieter thoughts)
    - `<strong>…</strong>` → brighter, emphasized
    - `<br>` → manual line break inside one paragraph

Add or remove sections freely — the counter (`01 / 10`), progress bar, and
background tones all adapt automatically.

## Deploy

It's fully static. Drag the folder into
[Netlify Drop](https://app.netlify.com/drop), or push to any static host
(GitHub Pages, Vercel, Cloudflare Pages). No build command needed.

Fonts are self-hosted (Newsreader + Jost, both SIL OFL licensed — licenses
included in `fonts/`), so the site makes **zero third-party requests** — it
works offline and nothing about who visits is leaked to a font CDN.

## Behavior notes

- **Intro**: a brief dark boot sequence ("Sandy. / There's something I've been
  meaning to say."). A tap or keypress skips it.
- **Navigation**: Continue button, tap anywhere, swipe up/left, or
  Space / Enter / → / ↓ to go forward. Swipe down/right, or ← / ↑, to go back
  to a previous part (or back to the cover from part 01).
- **Accessibility**: keyboard support, focus rings, aria-live progress
  announcements, and full `prefers-reduced-motion` support (all motion and the
  particle canvas switch off).
- **Privacy tip**: the meta robots tag is set to `noindex`; if this is truly
  personal, consider deploying behind an unguessable URL.
