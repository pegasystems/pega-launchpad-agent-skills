# Flow 06 — Theme-accurate mock (SVG opened in browser)

Goal: show the user how the component looks **with their app's branding and sample data**
before building/publishing, by **authoring a theme-accurate SVG, opening it in the user's
default browser**, and getting their explicit look-and-feel confirmation. See
`references/knowledge/launchpad-theme.md`.

## Method — SVG only (no browser to *generate*; browser to *display* is mandatory)

The mock is authored as a **hand-built SVG**. **Do NOT use Playwright, Chromium, Storybook,
`puppeteer`, `canvas`, or any other install** to *produce* the mock. No browser download, no
dev server, no extra dependency of any kind. An SVG is sufficient for these UI mocks
(shapes, text, icons, theme colors).

**However, opening the finished SVG in the user's default browser is MANDATORY.** After
writing the SVG to a temp path, always run `open <path>` (macOS), `xdg-open <path>`
(Linux), or `start <path>` (Windows) to launch it in the browser so the user can see the
rendered result. This must happen automatically — never rely solely on an inline chat image
link, because CLI environments cannot render SVGs.

## Steps

1. **Generate mock data** from the discovered fields (types + cardinality) so the mock shows
   realistic values, and cover the component's key states (e.g. empty, in-progress,
   filled/success, validation error).

2. **Apply the theme.** Take the theme tokens extracted in flow 02 (colors, fonts, radius,
   spacing) and use them directly as SVG fills/strokes/font attributes. Fall back to the
   Constellation/Cosmos default palette only if no theme exists — and say so.

3. **Author the SVG** of the component's states:
   - One `<svg>` with a background, a header (component name + binding + theme note), and a
     card per state.
   - Use `<rect rx=…>` for cards/inputs, `stroke-dasharray` for dropzones, feather-style
     `<path>`/`<polyline>` icons, and `<text text-anchor="middle">` for centered labels.
   - Because SVG has no layout engine, **place elements with absolute coordinates** and keep
     sample text short so it does not overflow; tune coordinates by hand.
   - Write the file to the **OS temp dir** (e.g. `/tmp/lp-mock/…svg` or `$TMPDIR`), NOT the
     DXCB project or the workspace.

4. **Open the SVG in the default browser** — this is **mandatory**. Run:
   - macOS: `open <temp-svg-path>`
   - Linux: `xdg-open <temp-svg-path>`
   - Windows: `start <temp-svg-path>`
   
   Then tell the user in the chat that the mock is now open in their browser and ask them to
   **confirm the look and feel**. This is the HARD GATE before build/publish (flow 07).
   - If changes are requested, loop back to flow 05 (develop) or flow 03 (design), re-author
     the SVG, re-open in browser, and ask again.

5. **Delete the temp SVG** once shown. Never persist mock artifacts in the DXCB project or the
   workspace.

## Fidelity note

This is a **theme-accurate schematic mock** (correct colors/fonts + sample data), not a live
in-case render. Offer a live preview after publish if exact placement must be verified.

## Guardrails

- **SVG only for generation** — never install or invoke Playwright/Storybook to *make* the mock.
- **Always open in the browser** — after writing the SVG, immediately run `open` (or
  platform equivalent) to display it in the user's default browser. This is mandatory; never
  skip this step or rely only on inline chat rendering.
- Use the **real** theme; fall back to Constellation/Cosmos default only if no theme exists
  (and say so).
- **Show the SVG in the browser** — a textual description does NOT satisfy the approval gate.
- **Keep it ephemeral** — write to a temp path and delete after confirmation; never save mock
  artifacts in the project or workspace.
- **This step is mandatory and comes before build (flow 07).** Never jump from develop
  (flow 05) straight to build/publish. Do not build or publish before the user confirms the
  look and feel.
