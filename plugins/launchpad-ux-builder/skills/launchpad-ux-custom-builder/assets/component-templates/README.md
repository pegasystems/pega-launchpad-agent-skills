# assets/component-templates

> **OFFLINE FALLBACK SNAPSHOTS ONLY — not the primary source.** The **source of truth for
> component code is the live Constellation UI Gallery `master` branch**
> (`https://github.com/pegasystems/constellation-ui-gallery/tree/master/src/components`) plus
> `LAUNCHPAD_VS_PLATFORM.md` and `Component_Build_Guide.md` — see
> `references/knowledge/constellation-gallery.md` and flow 05 Step 0. **Always fetch the closest
> live gallery component FIRST.** Use the snapshots in this folder **only if** you genuinely
> cannot reach the live gallery (no network / GitHub access), and when you do, **tell the user
> you're using an offline snapshot.** They cover just three archetypes, so they are often **not**
> the closest match to the request — never prefer them over the live gallery.

Each snapshot is a `Pega_Extensions_<Name>` folder with the standard files (`index.tsx`,
`config.json`, optional `styles.ts`, `create-nonce.ts`, `PConnProps.d.ts`, `localizations.json`).

> **Storybook/demo files are gallery-only.** Some snapshots here also carry
> `demo.stories.tsx` / `demo.test.tsx` because they were copied verbatim from the
> Constellation UI Gallery, whose local development harness uses Storybook. **These files
> are NOT part of a Launchpad component and must NOT be generated.** The Launchpad DXCB
> publish pipeline (`bundleComponent` → `zipComponent` → `assetsUpdate`) never reads them,
> and preview is done via the inline SVG mock (flow step 6), not Storybook. When adapting a
> snapshot, copy only `index.tsx` / `config.json` / `styles.ts` and drop the harness files.

## Recommended source

Base these on the Launchpad reference components (the `master` branch of the Constellation UI
Gallery) and the examples already in this repo, for example:

- `assets/component-templates/field/Pega_Extensions_StarRatingInput` - Field
- `assets/component-templates/widget/Pega_Extensions_Calendar` - Widget
- `assets/component-templates/template/Pega_Extensions_RangeSlider` - Template

## Layout

```
component-templates/
├── field/       # Pega_Extensions_StarRatingInput (Field / Integer)
├── widget/      # Pega_Extensions_Calendar (Widget / PAGE & CASE)
└── template/    # Pega_Extensions_RangeSlider (Template / DETAILS)
```

These starter templates are **populated** from the repo's `Pega_Extensions_*` examples.
Add more per category as needed (e.g. Text/Boolean/Date fields, CASE widgets, FORM templates).

## Conventions (must follow)

- Folder name = `config.json` `name` = `componentKey` = `Pega_Extensions_<Name>`.
- Default React import at top; export via `withConfiguration`.
- Cosmos-first components; bind data via `getPConnect()` Actions API.
- Do **not** generate Storybook/demo/test files for Launchpad components.

See `references/flow/05-develop-component.md` for generation rules.
