# Knowledge: Launchpad theme → theme-accurate inline SVG mock

This module explains how the agent reads the app's **theme** and applies it when authoring
the inline **SVG mock** (flow step 6), so the preview matches the app's real branding
instead of default styling.

## Why this matters

A DXCB component renders inside Constellation wrapped by the design-system `Configuration`
(theme). If the mock uses default colors/typography, the preview misrepresents how the
component will actually look in the user's branded app. Reading the real theme keeps the
preview relevant.

## Where theme data lives

The theme is stored as rule JSON. Relevant schemas:

- `Theme` / theme configuration — top-level colors, typography, brand palette.
- `ThemeTableComponent` and other `Theme*Component` rules — component-level style tokens.
- `ThemeComponentBaseProps` — base typography/color props referenced by component themes.

Read these via MCP (`list_rules_by_query` / resolve) as described in
`mcp-rulebase-queries.md`.

## Extracting tokens

From the resolved theme, extract at minimum:

- **Brand / primary color(s)** — used for buttons, accents, selected states.
- **Foreground / background colors** — text and surfaces.
- **Typography** — font family, base sizes/weights.
- **Semantic colors** — success/warning/error if present.

Keep a normalized token object, for example:

```json
{
  "brandPrimary": "#0b6cff",
  "foreground": "#101010",
  "background": "#ffffff",
  "fontFamily": "Inter, sans-serif",
  "semantic": { "error": "#d5001f", "success": "#1a7f37" }
}
```

## Mapping tokens into Cosmos `themeDefinition`

Cosmos components accept a `themeDefinition` (see `@pega/cosmos-react-core`, used in the
example components' `styles.ts`). Map the extracted tokens onto that structure so Cosmos
controls render with the app's palette and fonts.

## Applying tokens to the inline SVG mock

1. Author a **theme-accurate SVG** by hand that reflects the component's states, using the
   extracted tokens for fills, strokes, text color, and font family.
2. Populate it with **mock data derived from the discovered fields**
   (see `launchpad-data-model.md`).
3. Write the SVG to a temp path, **display it inline in the chat**, and get the user's
   look-and-feel approval before building/publishing.
4. **Delete the temp SVG afterward.** **Never** use Storybook, Playwright, Chromium, a
   browser, or any extra install to produce the mock — SVG only. See
   `references/flow/06-theme-screenshot.md`.

## Fidelity note

This produces a **theme-accurate SVG mock** — correct branding with sample data.
Pixel-perfect in-context rendering (inside a live case) is only guaranteed after publish;
offer a live preview then if the user needs exact placement verification.

## Guardrails

- Read the **actual** theme rule; do not hardcode brand colors.
- If no custom theme exists, fall back to the Constellation default and say so.
- Do not alter the app's theme — read only.
