# Flow 05 — Develop the component

Goal: generate `index.tsx` + `config.json` for the confirmed design, wired to the real
fields, following Constellation/Cosmos conventions — **grounded in a real Constellation UI
Gallery component**, not invented from scratch.

## Steps

0. **HARD GATE — ground in the gallery + read the Launchpad docs BEFORE writing any code.**
   You may **not** author `index.tsx` / `config.json` until you have done all three:
   1. **Pick the closest `master`-branch gallery component** at
      `https://github.com/pegasystems/constellation-ui-gallery/tree/master/src/components`
      (by `type`/`subtype` + behavior) and **read its live `index.tsx` + `config.json`** — this
      is the base you adapt (change only field names, labels, visuals). Prefer components marked
      supported in the Build Guide's **Launchpad Support** column.
   2. **Read `LAUNCHPAD_VS_PLATFORM.md`** and apply its rules (`getMappedKey`, `getData`,
      `doesRestApiExist`, case-ID constant, navigation utils).
   3. **Read `Component_Build_Guide.md`** and follow its folder / `config.json` / `index.tsx`
      structure.
      - `https://github.com/pegasystems/constellation-ui-gallery/blob/master/LAUNCHPAD_VS_PLATFORM.md`
      - `https://github.com/pegasystems/constellation-ui-gallery/blob/master/Component_Build_Guide.md`
   **Always attempt the live fetch FIRST.** If you **cannot reach the live gallery** (network /
   GitHub access blocked, fetch error), do **NOT** silently fall back to the local snapshots.
   **Tell the user you can't access the Constellation UI Gallery repo, and ask how they'd like
   to proceed**, offering these options:
   1. **Enable access & retry** — the user allows network / GitHub fetch for the assistant, then
      you retry the live fetch.
   2. **Paste the component** — the user opens the closest gallery component in their browser
      (`https://github.com/pegasystems/constellation-ui-gallery/tree/master/src/components`) and
      pastes its `index.tsx` + `config.json` here.
   3. **Use the bundled offline snapshot** — proceed with `assets/component-templates/` (covers
      only three archetypes, so it may not be the closest match).
   **Wait for the user's choice before writing any code** — do not default to the local snapshot
   on your own. The live `master` gallery + these two docs always take precedence. **Never invent
   structure or data-binding from scratch, and never prefer the local snapshots over the live
   gallery.** See `references/knowledge/constellation-gallery.md`.

1. **Turn `config.json.properties` into a requirements checklist.** Walk the chosen example's
   `properties` and confirm each with the developer: which **field** each binding reads/writes,
   what labels/helper text to show, and which SELECT option values apply. (Always say
   "**Field**", never "property".)

2. **Generate `config.json`.**
   - Set `name` and `componentKey` to `Pega_<Library>_<Name>` (must match the folder name).
   - Set `type` and `subtype` per the design.
   - Fill `properties` (bound fields, labels, options) from the context snapshot. For values a
     Widget must display live, declare them as `@P .Field` references in `defaultConfig` so the
     framework tracks them reactively (see `pcore-pconnect-apis.md`).
   - **Make every app-specific name configurable — NEVER hardcode it in `index.tsx`.** Any
     application **field**, **data-page**, **view**, or **rule** name the component needs must be
     exposed as a `config.json` **property** the developer sets in Studio (a `PROPERTY` / `FIELD`
     binding for a field picker, or a `TEXT` input for a data-page/view name), then read from the
     **resolved config** at runtime. The **only** names allowed directly in code are Launchpad
     **platform** ids (`pyID`, `pxObjClass`, …) via `getMappedKey`. Model this on the gallery
     **Card Gallery**, which exposes `dataPage`, `detailsDataPage`, and `detailsViewName` as
     properties instead of hardcoding them.
   - **Bind case/data fields with `"format": "PROPERTY"`, never `"TEXT"`.** `PROPERTY` gives the
     developer a **field picker** in Studio (they select a real field; you get the resolved
     value + reactivity). Use `"TEXT"` only for free-text that is *not* a field — a data-page
     name, view name, or heading. Binding a field as `TEXT` (typing its name) breaks reactivity
     and resolves against the wrong context. See `pcore-pconnect-apis.md`.
   - **Give every property clear author helper text via its `label`.** In the DX config schema
     the property `label` is what the developer sees in the Studio config panel — make it
     self-explanatory about exactly what to enter (Card Gallery style: "List Data Page name to
     get all objects", "Name of the view used to retrieve case details", "Set to true if using
     in a dashboard"). For longer guidance, add a `LABEL`-format property as an inline note.
     **Every configurable property must carry such helper text** so the developer knows how to
     configure it.

3. **Generate `index.tsx`.**
   - Import React default (`import React, ... from 'react'`) — required by the DXCB tsconfig.
   - Export via `withConfiguration` from `@pega/cosmos-react-core`.
   - **Cosmos-first**: use an existing `@pega/cosmos-react-core` component, else compose
     several, else custom markup as a last resort. See `references/knowledge/frontend-packages.md`.
   - **Guard every displayed field value with a `toDisplayString()` helper.** A resolved field
     value is not always a string — **reference / embedded fields resolve to objects**, so
     rendering them raw shows `[object Object]` or throws. Define the small helper (see
     `pcore-pconnect-apis.md`) and wrap every value you render: `toDisplayString(fieldValue)`.
   - Bind data via `getPConnect()` following `references/knowledge/pcore-pconnect-apis.md`:
     - **Field (writeback):** `const actions = pConn.getActionsApi();`
       `const propName = pConn.getStateProps().value;`
       update with `actions.updateFieldValue(propName, value)` and
       `actions.triggerFieldChange(propName, value)` on blur.
     - **Live display — decide editor vs. observer first** (see
       `references/knowledge/pcore-pconnect-apis.md`):
       - **Editor** (edits its *own* field): read the resolved `format: PROPERTY` value from
         props; it re-renders as you drive the change.
       - **Observer** (mirrors *other* fields edited elsewhere): the `PROPERTY` prop is **not**
         re-pushed on each keystroke. Subscribe to `PCore.getStore()` to force re-render **and**
         re-read fresh each render **from the deepest matching `{contextName}/…` (workarea)
         context** — a DETAILS template's own `getContextName()` context holds only *committed*
         data, so `getValue(ref, getContextName())` makes the display lag until submit. Do **not**
         copy `Pega_Extensions_RangeSlider` (an editor) as an observer reactivity reference — a
         value that won't update live (or only updates after submit) is almost always this
         editor/observer + wrong-context mismatch.
   - Honor `displayMode`, `disabled`, `readOnly`, `required` (coerce string `'true'`).

### Step 3b — Apply the Launchpad flavor (HARD GATE — must run in Launchpad, not Infinity)

Gallery components are written to run in **both** Pega Platform (Infinity) and Launchpad — the
difference is handled **in code**. After adapting the example, convert **every** Infinity-flavored
pattern to its Launchpad-safe form (source: gallery `LAUNCHPAD_VS_PLATFORM.md`). If any Infinity
pattern is left in, the component **fails at runtime in Launchpad**.

- **Rule / field / data-page names → qualify by the OWNER from the flow-02 namespace map**
  (never raw Infinity names, never assume the app namespace): **app-owned** →
  `PCore.getNameSpaceUtils().getQualifiedName(name, appNs)`; **platform-owned** and platform ids
  (`pyID`, `pxObjClass`, `Worklist`, reference lists like `CountryList`, inherited fields like
  `Name`) → `getMappedKey(name)`. The rulebase told you the owner during discovery — use it; do
  not guess. Response keys come back as `{Namespace}__Field`.
- **No hardcoded app names in code:** app field / data-page / view / rule names come from the
  **resolved `config.json` properties** the developer configured — never string literals in
  `index.tsx`. Only platform ids appear in code (via `getMappedKey`). The developer configures
  the app names in Studio; the code only qualifies whatever they entered with `getQualifiedName`.
- **Data → Constellation data API:** `PCore.getDataApiUtils().getData(...)` /
  `getDataPageUtils()`. **Never** call Infinity DX REST endpoints or raw `fetch` /
  `getRestClient()` for standard data.
- **Platform/Infinity-only REST DX APIs** (`readDataObject`, `getDataObjectView`,
  `createDataObject`, …) → **guard with** `PCore.getRestClient().doesRestApiExist('<api>')` and
  provide a Launchpad-safe fallback, or mark the component unsupported on Launchpad. **No
  `if (isLaunchpad)` branches** — use capability detection.
- **Current case ID →** `PCore.getConstants().CASE_INFO.CASE_INFO_ID` (never a hardcoded `pyID` /
  `pyGUID` / `caseInfo.businessID` Infinity path).
- **Never use raw Infinity identifiers.** `pyID`, **`pyGUID`**, `pzInsKey`, `pxObjClass`,
  `pyStatusWork`, `pyLabel` are Infinity naming — never bind/read them raw (`.pyID`, `.pyGUID`,
  `@P .pyGUID`, `getValue('.pyID')`); in Launchpad they resolve to nothing. Wrap them in
  `getMappedKey('<name>')`. For a data-page **`ID`** param (current record), use
  `getMappedKey('ID')` or `CASE_INFO.CASE_INFO_ID` — not a `@P .pyID`/`.pyGUID` PROPERTY.
- **Navigation / actions →** `getActionsApi()` (`openWorkByHandle`, `openLocalAction`,
  `createWork`, `showCasePreview`) + `getSemanticUrlUtils()`. Never hand-build Infinity URLs.
- **Packages →** Cosmos-first (`@pega/cosmos-react-core`); do not pull Infinity-only packages.
- **Build config (flow 04) →** `tasks.config.json` has `serverType: 'launchpad'` and
  `libraryModeCL: false`, and `config.json` `type` / `subtype` match the placement.

See `references/knowledge/pcore-pconnect-apis.md` and the gallery `LAUNCHPAD_VS_PLATFORM.md` for
the exact APIs.

4. **Add supporting files** as needed: `styles.ts`, `create-nonce.ts`, `PConnProps.d.ts`,
   `localizations.json` (plus the template icon SVG for Template components).
   **Do NOT create `demo.stories.tsx`, `demo.test.tsx`, or any Storybook/demo/story files.**
   Storybook is a constellation-ui-gallery development harness only; the Launchpad DXCB
   pipeline (`bundleComponent` → `zipComponent` → `assetsUpdate`) never reads them, so they
   are dead weight that never ships. Component preview is handled by the inline SVG mock
   (flow step 6), not Storybook.

5. **Lint** (`npm run lint`) and fix issues.

6. **Reuse-first self-check (HARD GATE before preview/build).** Confirm the code obeys the
   reuse-first ladder — do not proceed until all pass:
   - [ ] **Grounded in a NAMED `master`-branch gallery component** (cite it), and
         **`LAUNCHPAD_VS_PLATFORM.md` + `Component_Build_Guide.md` were consulted** — not
         invented from scratch.
   - [ ] **UI:** every UI element is a `@pega/cosmos-react-core` component (or a composition of
         them); raw HTML only where no Cosmos option exists.
   - [ ] **Fields:** read/write via PConnect — `getStateProps().value`, `updateFieldValue`,
         `triggerFieldChange` — not local/bespoke state for the bound field.
   - [ ] **Data:** fetched via `PCore.getDataApiUtils().getData` / `getDataPageUtils` — **no**
         raw `fetch`/REST calls.
   - [ ] **Navigation/actions:** via `getActionsApi()` / `getSemanticUrlUtils()` — **no**
         hand-built URLs.
   - [ ] **Rule/field/data-page names qualified by the flow-02 namespace map:** each app-owned
         name via `getQualifiedName(name, appNs)`, each platform-owned name (incl. reference data
         pages / inherited fields) via `getMappedKey(...)`; owner taken from the rulebase, not
         assumed; `appNs = getApplicationName().split('__')[0]`; no bare names, no hand-built
         `D_`/`{ns}__` prefixes.
   - [ ] **Platform-only APIs** gated with `doesRestApiExist(...)` (no `isLaunchpad` branches).
   - [ ] **Current case ID** from `PCore.getConstants().CASE_INFO.CASE_INFO_ID` — not a hardcoded
         `pyID` / `caseInfo.businessID` Infinity path.
   - [ ] **No raw Infinity identifiers:** no `.pyID` / `.pyGUID` / `@P .py*` bindings or
         `getValue('.py*')`; every platform id goes through `getMappedKey`, and a record `ID`
         param uses `getMappedKey('ID')` / `CASE_INFO_ID`.
   - [ ] **Launchpad flavor (not Infinity):** no Infinity DX REST endpoints, raw `fetch` /
         `getRestClient()` for standard data, hand-built URLs, or Infinity-only packages; every
         Platform-only API is capability-guarded. The component is wired to run in **Launchpad**.
   - [ ] **No hardcoded app names:** every app field / data-page / view / rule name is a
         configurable `config.json` property (not a literal in `index.tsx`), and **each property
         has descriptive author helper text in its `label`**. Only platform ids appear in code.
   - [ ] **Field bindings use `format: "PROPERTY"`** (field picker), never `"TEXT"` for a field.
   - [ ] **Displayed field values wrapped in `toDisplayString()`** so reference/embedded fields
         that resolve to objects don't render as `[object Object]`.
   If any item fails, **replace the custom code with the Cosmos/PConnect/PCore equivalent
   before continuing.**

7. **Bake in debugging aids + hand the user a targeted debug guide (so the FIRST publish is
   diagnosable — avoid publish-test-republish loops).** Launchpad only runs the component in the
   real portal/case runtime, so the developer's only diagnostic surface is the **browser
   console**. During the build:
   - **Add a small, guarded debug logger** the developer can toggle (e.g. behind a
     `debug` boolean `config.json` property defaulting to `false`, or a top-of-file
     `const DEBUG = false`). When on, log to the console the facts that pinpoint the common
     failures — **never tokens or PII**:
     - the **resolved data-page name** actually passed to `getData` (should be
       `<AppNs>__<DataPage>`, not `PegaPlatform__…` or bare);
     - the **app namespace** from `getApplicationName().split('__')[0]`;
     - the **response row keys** (should be `<AppNs>__Field`) and each **mapped field value**;
     - for observers, the **context names** seen in the store and which one the value came from.
     ```ts
     const DEBUG = false; // flip to true to trace in the browser console
     const log = (...a: unknown[]) => { if (DEBUG) console.log('[<ComponentKey>]', ...a); };
     log('dataPage →', dp, 'appNs →', appNs);
     log('row keys →', Object.keys(row));
     ```
   - The **defensive guards already required** double as debug aids: `toDisplayString` (objects
     vs `[object Object]`), `doesRestApiExist` (capability), editor/observer + workarea read.
   - **Present the applicable debug steps to the user up front** (at build, and again in the
     flow-07 publish summary) — only the ones relevant to THIS component:
     | Symptom | First check |
     |---------|-------------|
     | Data page 404 / empty | console: is the name `<AppNs>__<DataPage>`? app rule → `getQualifiedName(name, appNs)`, not `getMappedKey` |
     | Fields blank / `undefined` | response keys are `<AppNs>__Field`; read via `getQualifiedName(field, appNs)` |
     | `[object Object]` shown | wrap value in `toDisplayString()` |
     | Value doesn't update / only after submit | editor vs observer; subscribe + read the **workarea** child context |
     | Nothing renders / wrong record | record id via `getMappedKey('ID')` / `CASE_INFO_ID`, never `.pyID`/`.pyGUID` |
     | Stale behavior after republish | hard-refresh / reopen the view to load the new bundle |
   - **Turn the debug logger off (or leave `DEBUG=false`) before publishing** so production is
     quiet; keep the toggle so the developer can re-enable without a rebuild-from-scratch.

## Guardrails

- Ground the component in the closest **`master`-branch** gallery example; never invent
  data-binding wiring from scratch.
- Use exactly the field names/types discovered via MCP.
- Follow the naming/structure conventions (folder = `name` = `componentKey`).
- Do not hand-edit generated bundles.
- **Namespace-qualify by rule ownership — never hand-build prefixes.** App data pages / fields /
  views → `PCore.getNameSpaceUtils().getQualifiedName(name, appNs)` with
  `appNs = PCore.getEnvironmentInfo().getApplicationName().split('__')[0]`. Platform identifiers
  (`pyID`, `pxObjClass`, `Worklist`, …) → `getMappedKey(name)`. **Never use `getMappedKey` /
  `getDefaultQualifiedName` for an app data page or field** — they force `PegaPlatform__` and
  404 / return `undefined`. Never pass bare names to `getData`, never hand-build `{ns}__` /
  `{ns}$$` prefixes, never add a "namespace" prop. See `pcore-pconnect-apis.md`
  §"Resolving namespaces."
- **Responses use `{Namespace}__` prefixed field keys.** Read APP fields via
  `row[ns.getQualifiedName('TailNumber', appNs)]` and PLATFORM fields via
  `row[getMappedKey('pyID')]` — never bare `row['TailNumber']` or `row.TailNumber`. Applies to
  ALL data API responses (list, lookup, data object views).
