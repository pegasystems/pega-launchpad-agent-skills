# Look, motion, accessibility and performance

Numbers to put in `SPEC.md` and check in `REVIEW.md`.

## Tokens from the app
- Take colours from the Theme rule (brand primary, interactive, header, text, borders, backgrounds, stage colours), or from the screens that will be shown when they use another theme (say which in the reply). Write them as CSS custom properties on `:root`:
  ```css
  :root {
    --brand: #396c66;        /* Theme: brand primary */
    --accent: #2f76a2;       /* Theme: interactive; AI moment + primary CTA */
    --ink: #1c1f24;          /* body text, >= 4.5:1 on --bg */
    --ink-muted: #4b5563;    /* secondary text, >= 4.5:1 on --bg */
    --bg: #ffffff;
    --surface: #f3f5f8;      /* alternate section ground */
    --line: #d9dee5;
    --radius: 8px;           /* Theme corner radius */
    --font-display: "Roboto Slab", Georgia, serif;   /* Theme font if licensed, else a system stack */
    --font-body: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  ```
- Light page by default (the Bold level below still adds dark brand grounds to the hero and one or two sections). A full dark theme (on request) redefines the same tokens under `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`, with its own contrast checks; screens keep their real colours.
- One accent: the AI moment and the primary CTA share it. Everything else is ink, surface and brand.
- Fonts: the Theme font if it has an open licence (self-host WOFF2, `font-display: swap`, at most 2 families and 4 files, licence in CREDITS.md; ask before downloading). Otherwise a system stack. Never a font the user has no licence for.

## Type
- Hero `h1`: `clamp(2.5rem, 1.2rem + 4.6vw, 5.5rem)`, line-height 1.02-1.08, letter-spacing -0.02 to -0.035em, weight 600-800, max about 14ch per line.
- Section `h2`: `clamp(1.9rem, 1.2rem + 2.2vw, 3.25rem)`, line-height 1.1, letter-spacing -0.015em.
- Body 17-19 px, line-height 1.55, max 65ch. Small labels 13-14 px, uppercase only with +0.06em tracking.
- Numbers and field values from screens in tabular figures (`font-variant-numeric: tabular-nums`).

## Layout
- 12-column grid, content max width 1200-1280 px, side gutters 24 px (phone 16-20 px), section padding 96-160 px vertical on desktop, 64-96 px on phone.
- Grid and flex children that hold frames, tables or long words get `min-width: 0`, and chips inside frames may wrap; otherwise one `nowrap` element pushes the page wider than 375 px.
- Real UI is big: hero screen at least 55% of content width on desktop and allowed to bleed off one edge; feature crops at least 45%; UI text inside a crop at least 12 CSS px after scaling (crop tighter if not).
- Alternate grounds (bg / surface / one full-bleed brand band for the closing CTA) to pace the page; no more than one brand band plus the hero.
- Breakpoints: 375, 768, 1024, 1280, 1440. No horizontal scroll at any width. Phone gets its own crops via `<picture>` or `srcset` with art direction, not shrunk desktop screens.

## Banned by default
Purple-to-blue "AI" gradients; aurora blobs, glow, orbs, particle networks; sparkle/✨ as the AI icon everywhere; robot, brain or circuit illustrations; glassmorphism cards and blurred glass nav; dark void with small floating things; stock photos of people at screens; three identical icon cards in a row; bento grids of empty or decorative tiles; fake dashboards or invented charts; logo walls of non-customers; auto-advancing carousels; typewriter headlines; everything fading up on scroll; tilted 3D screens; floating phone mock-ups of a desktop app. Use one only if the user asks for it.

## What "modern" means here instead
Large confident type with tight tracking; real product UI as the hero, cropped close and large; one strong accent on the AI moment; crisp lines and generous rhythm; motion that explains (a stage advancing, a field filling, an answer arriving) rather than decorates; fast.

## Bold by default (not vanilla)
A page that only follows the rules above reads as a tidy template: white hero, thin grey lines, medium type, every section the same. Early builds looked like that, and users asked for more impact and a clearly more modern look, without going over the top. Build the **Bold** level by default; use **Calm** (white hero, 1 px lines, no offsets) only if the user asks for it in the question round. Bold is made from the brand tokens and hard edges, never from the banned looks. Pick at least five of these and write them in SPEC.md under "Look" with numbers:
- **Dark brand ground for the hero** (and one more section, e.g. How it works or Enterprise): the Theme's darkest brand or text colour as the ground, white text, the brand colour as the highlight. Alternate dark / light / surface grounds down the page so it has rhythm, with one full-bleed brand band for the closing CTA.
- **Oversized headline**: h1 up to `clamp(2.75rem, 0.9rem + 5vw, 5.75rem)`, line-height about 0.98, tracking -0.04 to -0.045em, weight 700, one phrase per line (`<span class="line">` per phrase). The payoff phrase in the brand colour with a drawn underline bar (0.08em high, `scaleX` 0 → 1, 700 ms, after the lines arrive).
- **One signature device used on every product frame**: a 2 px ink outline plus a solid offset block in the brand colour (`box-shadow: 18px 18px 0 var(--brand)`, 12 px on phone). No blur, no glow. The same device on the primary closing button (2 px border + ink offset) ties the page together.
- **Overlap and bleed**: the hero frame overlaps the next section (`translate: 0 96px`, never negative margins that move layout) and bleeds 48-64 px past the container on one side. Give the hero `overflow-x: clip` (not `overflow: hidden`, which cuts the overlap off) and a `z-index` above the next section.
- **Scoreboard proof strip**: 3-4 big numerals (display font 700, up to 6.5rem, `tabular-nums`) from verified facts in the buyer's words (kinds of claim handled, steps from first notice to payout, "0 claims decided by AI" when the rules prove it; never counts of rules or platform objects), each with a one-line caption and its source in SPEC.md. Never a made-up metric.
- **Big numbers in the workflow**: step numerals in the display font and a brand-colour progress bar that fills to the selected step (`scaleX`, 600 ms).
- **The AI result as a solid accent card** (accent ground, white text, ink offset) in the input → result → review row, with arrows between the steps. The accent stays reserved for the AI moment and the primary CTA.
- **Numbered features** (01-04 in the brand colour, display font), alternating 60/40 with the frame bleeding to the edge.
- **A giant closing line**: closing h2 up to 7rem on the brand band.
Check after the restyle: contrast of every new pair on the dark grounds (white and muted text on the dark ground, brand colour on the dark ground, white on accent, ink on the brand band, and the closing button against the band at 3:1); decorative lines never cross text (check the lede and CTAs at every width); the overlap still leaves the next section's first line readable at 1024 and 375.

## Subject imagery (most pages get some)
A page with only type and product frames looks unfinished. A polished page has 2-4 images from the **buyer's world**, so a visitor sees within a second what this is for: a football pitch, a goal and a ball for a sports league's app; a shipping container, a dock crane or a pallet label for logistics; a ledger, a stamp or a signed form for finance. Rules:
- **Default: original SVG drawings made for the page**, in the Theme colours, in one consistent style (flat shapes, 3-4 px strokes, the same signature offset block as the frames when it fits). No download, no licence question, sharp at every size, a few KB each. Draw the subject's real geometry, for example the pitch markings at their real distances, so a domain expert sees it is right. Generate them with a short script (Python or Node writing SVG) so they can be tweaked.
- **Photos only when the user supplies or approves them**, with the licence recorded in `CREDITS.md`: the subject itself (a ground, a match, a warehouse), never stock people at screens, and never a photo that suggests a real customer.
- **Placement**: the lead image is the **hero background**, the subject's whole scene seen from above or as a wide line drawing (a ground, a yard, a floor plan), large and low-contrast (lines 20-30% white on the dark ground), with the recognisable detail (the pitch, the crane, the dock) placed in open space beside or above the product frame, never hidden behind the frame; fade it out (`mask-image` gradient) behind the headline, and on phone show it at about 50% opacity with the detail in a gap beside the headline. Then one in a dark band (Enterprise or How it works) and one in the closing band; small lines never run through body text or buttons. Leave the product frames as the largest visuals; art stays secondary in size and contrast (lines at 20-35% white on dark grounds).
- **Phone**: hide art that would sit behind text at one column, or show it small and inline (a 100-120 px mark above the closing line). Re-check `scrollWidth` at 375.
- Decorative art gets `alt=""` and no text of its own; put it on `<img>` files in `assets/art/` with `width`/`height`, `loading="lazy"` below the fold. List each one in `CREDITS.md` as the project's own.
- Not allowed: robots, brains, circuits, sparkles, abstract blobs or glow standing in for the subject (see Banned by default), and clip art of the sport or trade that looks off-the-shelf.

## Motion
- Purpose first: motion only where it shows cause and effect (the replay, the stepper, the before/after, a screen settling into place on first view). Static is fine elsewhere.
- Durations 150-250 ms for hovers and focus, 400-700 ms for entrances, at most ~2.5 s for an AI replay. Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) for arrivals, `cubic-bezier(0.65, 0, 0.35, 1)` for state changes.
- Vary entrances: at most 3-4 elements per viewport animate, each differently (a screen slides 24-40 px and settles, a label scales from 0.96, a rule draws); never a uniform fade-up on every block.
- Scroll reveals via `IntersectionObserver` (threshold ~0.2), once only; content is visible by default and only hidden when JS has run (add a `js` class on `<html>`), so nothing is lost without JS.
- `@media (prefers-reduced-motion: reduce)`: no transforms or replays; show final states immediately.
- Animate `transform` and `opacity` only; no layout-shifting animation.
- **Entrances are transform-only: never start an element at `opacity: 0`.** Some renderers never paint animation frames (a hidden browser pane, screenshot tools, crawlers, link-preview bots, a stalled `requestAnimationFrame`); with an opacity entrance the headline and the proof numbers stay invisible there. Rise 0.3em, slide 32-48 px or scale from 0.96, with the element fully opaque from the first frame.
- Auto-play the AI replay only at >= 1024 px and only after `document.fonts.ready` (measure the reserved height then). On phones, show the full exchange as static content until a chip is tapped; a reserved-then-cleared log leaves an empty box.

## Accessibility (WCAG 2.2 AA)
- Contrast: 4.5:1 for text, 3:1 for large text (24 px+, or 18.66 px+ bold) and UI boundaries; check every token pair used, including text on the brand band.
- Skip link, `<header>`/`<nav>`/`<main>`/`<footer>` landmarks, one `<h1>`, no skipped heading levels.
- Visible `:focus-visible` ring (2 px accent, 2 px offset) on every interactive element; targets at least 24x24 px (44x44 preferred).
- Every image has alt text saying what it proves; decorative images `alt=""`. Videos have a caption and a pause control.
- The interactive AI moment is keyboard-operable and announces its result once via `aria-live="polite"`.

## Performance budgets
- Initial load (HTML + CSS + JS + fonts + above-the-fold images) at most 1 MB; the whole page at most 3 MB excluding an optional recording; a recording at most 4 MB (H.264 MP4, 1280-1600 px wide, no audio track).
- Hero image at most 250 KB (WebP/AVIF), with `width`/`height`, `fetchpriority="high"`, not lazy. Every other image `loading="lazy"` and `decoding="async"`, any single image at most 300 KB.
- CSS at most 60 KB, JS at most 30 KB, no external scripts or stylesheets by default.
- Targets: LCP under 2.5 s, CLS under 0.1, INP under 200 ms; Lighthouse 90+ in each category when run.
