# Knowledge: Constellation UI Gallery — source of truth for component code

**This is the authoritative reference for how a real Launchpad DXCB component is written.**
Before authoring `index.tsx`/`config.json` for a new component, the agent must find the
closest-matching component in the gallery and adapt it — never invent structure or
data-binding patterns from scratch.

## The repository (`master` branch) + canonical Launchpad docs

- Browse: `https://github.com/pegasystems/constellation-ui-gallery/tree/master/src/components`
- **Use the `master` branch.** (The old `next` branch no longer exists.) Gallery components run
  in **both** Pega Platform and Launchpad; the difference is handled **in code** via
  `getMappedKey` + capability detection — not by a separate branch.
- **Read these two authoritative docs before wiring data/actions** (source of truth for
  Launchpad-vs-Infinity differences and the build structure):
  - **Launchpad vs Platform:** `https://github.com/pegasystems/constellation-ui-gallery/blob/master/LAUNCHPAD_VS_PLATFORM.md`
  - **Component Build Guide:** `https://github.com/pegasystems/constellation-ui-gallery/blob/master/Component_Build_Guide.md`
- **Check the "Launchpad Support" column** in the Component Build Guide's component table —
  only recommend/adapt components marked supported on Launchpad.

## How to actually consult it (do not rely on memory)

Fetch the live code — do not guess from recollection:

1. **List components** — read the `master` tree under `src/components` (GitHub tools:
   `github_repo` / `github_text_search`, or fetch the raw directory listing).
2. **Pick the closest match** by `config.json` `type`/`subtype` and behavior (see table below).
3. **Read that component's `index.tsx` + `config.json`** from the `master` branch and adapt it:
   copy its data-binding pattern (how it reads/writes case fields, refreshes the view,
   subscribes to events), its prop shape, and its file structure.
4. When a bug is about runtime behavior (values not updating, context, refresh), **diff your
   code against the closest gallery component** rather than trying new APIs speculatively.

> If GitHub tools are unavailable, use `fetch_webpage` on the raw file URLs, e.g.
> `https://raw.githubusercontent.com/pegasystems/constellation-ui-gallery/master/src/components/<Name>/index.tsx`.
> The repo is **public** (no auth needed).
>
> **If you still cannot reach the gallery** (network / GitHub access blocked in this
> environment), do **NOT** silently fall back to the local snapshots. **Tell the user you can't
> access the gallery repo and let them choose the next step**: (1) enable network/GitHub access
> and retry, (2) paste the closest component's `index.tsx` + `config.json` from their browser, or
> (3) use the bundled `assets/component-templates/` offline snapshot (only three archetypes).
> Wait for their choice before writing code.

## Component catalog (match request → example)

| Request pattern | Closest gallery example | Type / subtype |
|-----------------|-------------------------|----------------|
| Numeric range / min-max writeback | `Pega_Extensions_RangeSlider` | Template |
| Case-summary rating band | `Pega_Extensions_RatingLayout` | Template (DETAILS) |
| Single-field custom input (rating) | `Pega_Extensions_StarRatingInput` | Field (Integer) |
| Signature capture field | `Pega_Extensions_SignatureCapture` | Field |
| Gauge / meter visualization | `Pega_Extensions_Meter` | Widget/Field |
| Calendar / scheduling | `Pega_Extensions_Calendar` | Widget (PAGE/CASE) |
| List of work in case/portal | `Pega_Extensions_UtilityList` | Widget (CASE/PAGE) |
| Kanban board | `Pega_Extensions_KanbanBoard` | Widget |
| Embed external content (iframe) | `Pega_Extensions_IframeWrapper` | Widget |
| Barcode / QR code | `Pega_Extensions_BarCode` / `Pega_Extensions_QRCode` | Field/Widget |

The list evolves — always read the live `master` tree; do not treat this table as exhaustive.

## Using `config.json.properties` as a requirements checklist

The `properties` array of the chosen example's `config.json` is the **question checklist** for
gathering requirements. For each relevant property, ask the developer a targeted question:

- **Field-binding entries** (`inputProperty`, `minValueProperty`, a `@P .Field` reference, or a
  `PROPERTY`/`VALUEINPUT` format): *"Which case/data **field** should this read and update?"*
- **Label / helper entries** (`label`, `helperText`): *"What label/helper text should users see?"*
- **SELECT entries** (`format: SELECT` with a `source`): *"Which option do you want? (list the
  valid values from `source`)."*
- **Widget data entries** (`dataPage`, `contextProperty`, `groups`, `groupProperty`):
  *"Which data page / grouping / case context drives this widget?"*

(Per `launchpad-data-model.md`, always call a case/data element a **Field**, never a "property"
— even when the config format keyword is `PROPERTY`.)

> **Every app-specific name is a configurable property, never hardcoded.** Like the gallery
> **Card Gallery** (which exposes `dataPage`, `detailsDataPage`, `detailsViewName` as
> properties), expose every application field / data-page / view / rule the component needs as a
> `config.json` property the developer sets in Studio — never a string literal in `index.tsx`.
> **Write clear author helper text in each property's `label`** (the label is what the developer
> sees in the config panel, e.g. "List Data Page name to get all objects"); use a `LABEL`-format
> property for longer inline guidance. Only Launchpad platform ids (`pyID`, …) appear in code.

## Adaptation rules

- **Folder = `name` = `componentKey`** in `config.json` (use the project's library prefix,
  e.g. `Pega_<Library>_<Name>`).
- Keep the gallery component's **data-binding approach**; only change field names, labels, and
  visuals to fit the discovered model + theme.
- Prefer Cosmos components (`@pega/cosmos-react-core`) — see `frontend-packages.md`.
- Follow the PConnect/PCore usage in `pcore-pconnect-apis.md`.
- Do not copy Infinity-only imports or `master`-branch APIs.
