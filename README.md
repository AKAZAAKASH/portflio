# Akash Chandran — Portfolio

A fast, responsive personal portfolio built with **only HTML, CSS, and vanilla JavaScript** — no frameworks, no build step. Just open `index.html` in a browser.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Markup & all section content |
| `styles.css` | Theming (CSS variables), layout, animations |
| `script.js`  | Theme toggle, typing effect, scroll reveal, nav, form validation |

## Features
- 🎬 Branded loading animation (your name animates in on first load)
- 🖼️ Hero profile photo with graceful fallback if the image is missing
- 🌗 Dark / light mode toggle (persisted in `localStorage`, respects system preference)
- ⌨️ Typing effect in the hero
- 🎬 Fade-in-on-scroll reveal (IntersectionObserver)
- 📊 Animated skill bars + badge cloud
- 🧭 Sticky navbar with active-section highlighting & smooth scrolling
- 📈 Scroll-progress bar + back-to-top button
- 📱 Fully responsive (mobile drawer menu)
- ♿ Semantic, accessible markup; honors `prefers-reduced-motion`
- ✅ Client-side contact-form validation

## Customize (quick checklist)
1. **Name / bio / education** — search `Akash Chandran` and the About section in `index.html`.
2. **Profile photo** — drop a `profile.jpg` into this folder. It appears in the hero. Until you add it, a styled "AC" placeholder shows instead. (Square or slightly portrait images look best.)
2. **Projects** — edit the `.project-card` blocks: title, description, `tech-list`, and the GitHub / live-demo `href`s (currently `https://github.com/` and `https://example.com/`).
3. **Experience / Achievements** — update the timeline and `.achieve-card` blocks.
4. **Skills** — adjust `data-level` on `.bar-fill` and the badges.
5. **Social links** — update the `href`s in the Contact section's `.socials`.
6. **Résumé** — drop a `resume.pdf` into this folder (the Download button links to `resume.pdf`).
7. **Typing phrases / accent colors** — `phrases[]` in `script.js`; `--accent` / `--accent-2` in `styles.css`.

## Contact form
Validation is client-side only — there's no backend. To actually receive messages, point the `<form>` at a service like [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com), or add your own handler in `script.js` (section 6).
