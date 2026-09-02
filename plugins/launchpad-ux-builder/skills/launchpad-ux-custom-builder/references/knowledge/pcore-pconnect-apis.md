# Knowledge: PConnect & PCore APIs for DXCB components

Implementation reference for wiring a Launchpad DXCB component to the Constellation runtime.
Pair this with a concrete example from `constellation-gallery.md` (the `master` branch is the
source of truth — this doc explains the APIs those examples use).

> **This is a curated subset of the most-used APIs, not an exhaustive list.** There is no
> official public catalog of the full `PCore` / `PConnect` surface. When you need an API that
> isn't documented here, consult the authoritative sources before inventing one: the gallery
> `LAUNCHPAD_VS_PLATFORM.md` and `Component_Build_Guide.md`, and the live component code on the
> gallery `master` branch.

## Launchpad-safe APIs — READ FIRST (source: gallery `LAUNCHPAD_VS_PLATFORM.md`)

Gallery components run in **both** Pega Platform and Launchpad. Never hard-code Platform rule/
property names or depend on raw REST response shapes. The canonical rules:

- **`getMappedKey(key)`** (from a gallery component's `../shared/utils`, or implemented in the
  generated DXCB project as shown below) — wrap **every** property, data-page,
  data-object, view, local-action, and flow-type name in this before use. It qualifies the
  name for the namespace and maps Platform IDs to Launchpad equivalents (`pyID`→`businessID`/
  `ID`, `pxObjClass`→`class`, and resolves data-page names — so you do **not** hand-write a
  `D_` prefix or a bare name; `getMappedKey` produces the correct one).
  ```ts
  export function getMappedKey(key: string): string {
    const q = PCore.getNameSpaceUtils().getDefaultQualifiedName(key);
    return PCore.getEnvironmentInfo().getKeyMapping(q) || q;
  }
  ```
- **Fetch data with the PCore data API** (not raw REST):
  ```ts
  const caseId = pConn.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_ID);
  const payload = { dataViewParameters: { [getMappedKey('pyID')]: caseId } };
  PCore.getDataApiUtils()
    .getData(getMappedKey(dataPage), payload, pConn.getContextName())
    .then((res: any) => { /* read rows via getMappedKey('pyLabel'), etc. */ });
  ```
  Also available: `getDataObjectView()`, `PCore.getDataPageUtils().getPageDataAsync()`.
- **Guard Platform-only APIs** with capability detection — do NOT branch on `isLaunchpad`:
  ```ts
  if (!PCore.getRestClient().doesRestApiExist('readDataObject')) { /* Launchpad-safe fallback */ }
  ```
- **Current case ID** comes from `PCore.getConstants().CASE_INFO.CASE_INFO_ID` — never a
  hard-coded `pyID` / `pyGUID` / `caseInfo.businessID` path.
- **Infinity identifiers are Infinity-only — NEVER use them raw in Launchpad.** `pyID`,
  **`pyGUID`**, `pzInsKey`, `pxObjClass`, `pyStatusWork`, `pyLabel`, … are **Infinity** naming.
  Never bind or read them raw (`.pyID`, `.pyGUID`, `@P .pyGUID`, `getValue('.pyID')`) — in
  Launchpad they resolve to nothing. Always pass them through **`getMappedKey('<name>')`**, which
  maps them to their Launchpad equivalents (e.g. `pyID` → `PegaPlatform__BusinessID`). For the
  **current record / case id** (e.g. a data-page `ID` parameter), read
  **`getMappedKey('ID')`** (→ `PegaPlatform__ID`) or
  `PCore.getConstants().CASE_INFO.CASE_INFO_ID` — **not** a `@P .pyID` / `@P .pyGUID` PROPERTY
  binding.
- **Navigate** with `getActionsApi()` (`openWorkByHandle`, `openLocalAction`, `createWork`,
  `showCasePreview`) and `PCore.getSemanticUrlUtils()` — never hand-build URLs.

**Canonical references (read before wiring data/actions):**
- `https://github.com/pegasystems/constellation-ui-gallery/blob/master/LAUNCHPAD_VS_PLATFORM.md`
- `https://github.com/pegasystems/constellation-ui-gallery/blob/master/Component_Build_Guide.md`

### Resolving namespaces & data-page names (the #1 "data page not found" cause)

**Launchpad namespaces every application rule name.** A rule reference must be qualified with
its namespace before use at runtime — e.g. the Platform data page `Worklist` becomes
`PegaPlatform__Worklist`; `CustomerDetails` in an app with namespace `Insurance` becomes
`Insurance__CustomerDetails`. The separator is a **double underscore `__`** (never `$$`).

**The `NamespaceUtils` class provides three qualification APIs** (official Launchpad docs —
"Namespacing"). Call them via `PCore.getNameSpaceUtils()` (gallery-verified casing; the docs
also spell it `getNamespaceUtils`):

| API | Prefixes | Use when |
|-----|----------|----------|
| `getDefaultQualifiedName(ruleName)` | the **default `PegaPlatform`** namespace → `PegaPlatform__X` | the rule name is **hardcoded and belongs to the Pega Platform layer** |
| `getQualifiedName(ruleName, namespace)` | the **application's** namespace → `<Namespace>__X` | the rule name is **hardcoded and specific to the application** |
| `getQualifiedNameForComplexRuleReferences(ruleName, { namespace, marker })` | namespace applied per segment | **complex references**: property refs, multi-segment paths, deep `caseInfo.content` paths |

`getQualifiedNameForComplexRuleReferences` behavior:
- **Marker-based deep path** — qualifies only segments **after the last occurrence** of the
  marker (default marker `caseInfo.content`):
  `X.caseInfo.content.View.Field` → `X.caseInfo.content.MyApp__View.MyApp__Field`.
- **Multi-segment path** (no marker, has dots) — qualifies **each** segment:
  `country.state.city` → `MyApp__country.MyApp__state.MyApp__city`.
- **Single segment** (no dots) — qualifies the whole name: `pyDetails` → `MyApp__pyDetails`.
- **Preserves leading dots** (`.pyRuleName` → `.MyApp__pyRuleName`) and **does not re-namespace**
  an already-namespaced value (`MyApp__pyDetails` → unchanged).

**⚠️ CHOOSE THE RIGHT API BY WHO OWNS THE RULE — this is the crux.**
- **Platform identifiers** (`pyID`, `pxObjClass`, `pyLabel`, `pzInsKey`, `Worklist`, …) →
  `getMappedKey(name)`. `getMappedKey` wraps `getDefaultQualifiedName` (which **always** prefixes
  `PegaPlatform__`) plus `getKeyMapping` (which maps e.g. `pyID` → the app's business ID).
  Verified gallery source:
  ```ts
  export function getMappedKey(key: string): string {
    const namespacedKey = PCore.getNameSpaceUtils().getDefaultQualifiedName(key);
    const mappedKey = PCore.getEnvironmentInfo().getKeyMapping(namespacedKey);
    return mappedKey || namespacedKey;
  }
  ```
- **App-specific rules** (YOUR data pages, YOUR fields, YOUR views) →
  `PCore.getNameSpaceUtils().getQualifiedName(name, appNs)`. **`getMappedKey` /
  `getDefaultQualifiedName` will NOT work for these** — they force `PegaPlatform__`, so an app
  data page or field resolves to the wrong namespace and 404s / returns `undefined`.

**Get the app namespace at runtime** (never hardcode it):
```ts
const appNs = PCore.getEnvironmentInfo().getApplicationName().split('__')[0]; // → "FloatingFleet"
```

**How do you know which namespace a name belongs to? Ask the MCP rulebase — don't guess.** This
is the straightforward, deterministic path: during discovery (flow 02) every rule / field /
data-page comes back **namespace-qualified**, so you know its owner *before* writing code:
- app-owned (e.g. `ProviderManagementApp__ResourceList`, `ProviderManagementApp__FreeCapacity`)
  → `getQualifiedName(name, appNs)`
- platform-owned (e.g. `PegaPlatform__CountryList`, `PegaPlatform__Name`) → `getMappedKey(name)`

**A data page or field can be platform-owned even if it *sounds* app-specific** — reference
lists like `CountryList` and inherited fields like `Name` / `BusinessID` live under
`PegaPlatform__`. **Never assume the app namespace** — use the owner the rulebase reported. Build
the component's **namespace map** (name → owner) at discovery time and qualify each name from it.
Only if a name wasn't discovered, fall back to "app-qualified first, then platform
(`getMappedKey`)" — but the rulebase is the source of truth.

Official reference: Launchpad docs → **Namespacing** and **APIs in the NamespaceUtils class**
(`.../platform/launchpad/namespacing.html`).

**For an APP data page, qualify with the app namespace — NOT `getMappedKey`.** Never pass a bare
name or a hand-built `D_` prefix to `getData` / `getPageDataAsync`:
```ts
const appNs = PCore.getEnvironmentInfo().getApplicationName().split('__')[0];
const dp = PCore.getNameSpaceUtils().getQualifiedName(dataPage, appNs); // FloatingFleet__AircraftDataList
PCore.getDataApiUtils().getData(dp, payload, pConn.getContextName());
```
Passing `dataPage` bare (or `D_dataPage`, or `getMappedKey(dataPage)` which yields
`PegaPlatform__…`) is the most common cause of "data page cannot be resolved / not found". If it
still won't resolve after `getQualifiedName`, confirm the data-page name exists in the connected
app (via MCP discovery) and that you queried the app's **working branch**, not `PegaPlatform`.

### CRITICAL — pick the API by rule ownership; never hand-build namespaces

**App-specific rule (your data page / field / view) → `getQualifiedName(name, appNs)`. Platform
identifier (`pyID`, `pxObjClass`, `Worklist`, …) → `getMappedKey(name)`.** For property /
multi-segment / deep `caseInfo.content` references, use
`getQualifiedNameForComplexRuleReferences`. Do NOT:
- Use `getMappedKey` / `getDefaultQualifiedName` for an **app** data page or field — they force
  `PegaPlatform__` and resolve to the wrong namespace (404 / `undefined`)
- Pass bare/unqualified names to `getData` (e.g. `getData('AircraftDataList', {})`)
- **String-concatenate the prefix yourself** (`appNs + '__' + name`). The separator is `__`
  (never `$$`), but always let a `NamespaceUtils` API build it
- Hardcode the app namespace — read it from
  `getEnvironmentInfo().getApplicationName().split('__')[0]`
- Add a configurable "namespace" prop, or try multiple fallback name formats in a cascade

Use one sanctioned call, no fallbacks.

### Response field names are namespace-prefixed — read them by rule ownership

Launchpad API responses return field keys with a `{Namespace}__` prefix — **app fields carry the
app namespace, Platform fields carry `PegaPlatform__`:**
```json
{
  "FloatingFleet__TailNumber": "N123FF",
  "FloatingFleet__Model": "Challenger 350",
  "PegaPlatform__BusinessID": "Aircraft-944HAK",
  "PegaPlatform__Status": "Open-Active"
}
```

**Read APP fields via `getQualifiedName(field, appNs)` and PLATFORM fields via `getMappedKey`:**
```ts
const appNs = PCore.getEnvironmentInfo().getApplicationName().split('__')[0]; // "FloatingFleet"
const ns = PCore.getNameSpaceUtils();

// CORRECT
const dp = ns.getQualifiedName(dataPage, appNs);            // FloatingFleet__AircraftDataList
const response = await PCore.getDataApiUtils().getData(dp, {});
response.data.data.forEach((row: any) => {
  const tailNumber = row[ns.getQualifiedName('TailNumber', appNs)]; // → row['FloatingFleet__TailNumber']
  const model      = row[ns.getQualifiedName('Model', appNs)];      // → row['FloatingFleet__Model']
  const businessId = row[getMappedKey('pyID')];                     // → row['PegaPlatform__BusinessID']
});

// WRONG — bare names, or getMappedKey on an app field (yields PegaPlatform__TailNumber)
const t1 = row['TailNumber'];               // undefined — key doesn't exist
const t2 = row[getMappedKey('TailNumber')]; // undefined — wrong namespace (PegaPlatform__)
```

**This applies to ALL data API responses** — list data pages, lookup data pages, and data object
views. The namespace prefix is always present; choose the API by who owns the field.

## PConnect — per-component context

`getPConnect` is passed in via props; `const pConn = getPConnect()`. Each component instance
has its own PConnect. Use it for case context, config metadata, field updates, view refresh,
and localization.

| API | Purpose |
|-----|---------|
| `pConn.getInheritedProps()` | Pull standard Constellation props (label, visibility, required…). |
| `pConn.getConfigProps()` | Resolved `config.json` config for this instance. |
| `pConn.resolveConfigProps(obj)` | Resolve `@P .Field` references in an object to live values. |
| `pConn.getRawMetadata().config` | Raw config; read `@P .Field` reference strings (strip `@P `). |
| `pConn.getCaseInfo()` | CaseInfo: `getKey()`, `getClassName()`, `getCurrentAssignmentViewName()`. |
| `pConn.getActionsApi()` | Actions: `updateFieldValue`, `triggerFieldChange`, `refreshCaseView`, `createWork`, `openWorkByHandle`, `showCasePreview`. |
| `pConn.getValue(ref, pageRef?)` | Read a value from the store for a reference. |
| `pConn.getDataObject(ctx?)` | The resolved data object for the context (includes `caseInfo`). |
| `pConn.getContextName()` | The component's data-context name (needed for correct reads/writes). |
| `pConn.getLocalizedValue(str)` | Localized label/tooltip/ARIA text. |

### Writing a case field (Field/Template pattern)

```ts
const actions = pConn.getActionsApi();
const propName = pConn.getStateProps().value; // the bound field for a Field component
actions.updateFieldValue(propName, newValue);   // on change
actions.triggerFieldChange(propName, newValue);  // on blur → validation
```

### Reading a case field for DISPLAY — editor vs. observer (READ THIS FIRST)

Before writing any read logic, decide which of the two roles your component plays. This is the
single most common cause of "the value doesn't update live":

- **EDITOR** — the component **edits its own bound field** (slider, rating, custom input). It
  changes the value itself, so it re-renders from its own state/handlers.
- **OBSERVER** — the component **displays fields that are edited *elsewhere*** on the view
  (a summary card, a badge, a preview that mirrors other form fields). It must be *told* when
  those fields change.

**`format: PROPERTY` behaves differently for each.** The resolved value arrives as a prop of
the same name, but Constellation only *pushes a new value + re-render* to the component that is
**editing** that field. For an **observer**, the PROPERTY prop is resolved at initial render /
view refresh and is **NOT** re-pushed on every keystroke — so an observer that just reads the
prop looks frozen even when the field is correctly mapped.

> **RULE — bind case/data fields with `"format": "PROPERTY"` (never `"TEXT"`).** `PROPERTY`
> gives the developer a **field picker** in the Studio config panel (so they select a real
> field, and you get the resolved value + reactivity). `"TEXT"` is **only** for free-text config
> that is *not* a field — e.g. a data-page name, a view name, a heading. Never bind a field as
> `TEXT` and type its name.

> **Do not use `Pega_Extensions_RangeSlider` as your reactivity reference for an observer.**
> RangeSlider *looks* like "PROPERTY props are reactive," but its live behavior comes from its
> own internal `useState` + drag/keyboard handlers (it is an **editor**). Copying it into a
> passive display gives you a component that renders once and never updates.

#### Pattern A — EDITOR (component edits its own field)

Declare the bound field as `"format": "PROPERTY"`; read the resolved value straight from props.

```jsonc
// config.json
"properties": [ { "name": "creditLimit", "label": "Credit limit field", "format": "PROPERTY" } ]
```
```tsx
// index.tsx — the resolved VALUE arrives as props.creditLimit; you drive changes yourself
const { creditLimit } = props;
const propName = getPConnect().getRawMetadata().config?.creditLimit?.replace('@P ', '') || '';
getPConnect().getActionsApi().updateFieldValue(propName, next); // then refresh (see below)
```

#### Pattern B — OBSERVER (component mirrors fields edited elsewhere) — needs TWO pieces

Keep `"format": "PROPERTY"` in config (so the author still maps the field the same way), but in
`index.tsx` you must supply the reactivity yourself:

1. **Subscribe to the store so React actually re-renders** when any field changes, and
2. **Re-read the current value fresh on each render — from the WORKAREA child context**, not the
   component's own context (see the critical note below).

> **CRITICAL — read from the workarea child context, not `getContextName()`.** A DETAILS
> template renders in a **parent** context (e.g. `app/primary_1`), but the live form stages
> in-progress edits in a **child "workarea" context** (e.g. `app/primary_1/workarea_1`). The
> parent's `caseInfo.content.<field>` stays **empty until the user submits** and the commit
> merges the child into the parent. So `getValue(ref, getContextName())` reads *committed* data
> and the display **lags until submit** (most visibly with picklist / Pick list fields). To track
> live edits you must read the value from the **deepest** matching store context.

```tsx
import { useEffect, useReducer } from 'react';

const pConn = getPConnect();
const [, forceUpdate] = useReducer((c: number) => c + 1, 0);

useEffect(() => {
  const PCore = (window as any).PCore;
  const store = PCore?.getStore?.();
  return store?.subscribe ? store.subscribe(() => forceUpdate()) : undefined;
}, []);

const contextName = pConn.getContextName?.();

// Read a mapped field's LIVE value from the deepest matching context (the workarea),
// falling back to the component context, then getValue, then the resolved prop.
const readLive = (configKey: string, resolvedValue: unknown): unknown => {
  const ref = pConn.getRawMetadata?.()?.config?.[configKey];
  if (typeof ref !== 'string' || !ref.trim()) return resolvedValue;
  const fieldRef = ref.replace('@P ', '').trim();
  const fieldKey = fieldRef.replace(/^\./, ''); // e.g. CreditCardApplication__ProductVariant
  try {
    const data = (window as any).PCore?.getStore?.()?.getState?.()?.data ?? {};
    const ctxNames = Object.keys(data)
      .filter((c) => c === contextName || (contextName && c.startsWith(`${contextName}/`)))
      .sort((a, b) => b.length - a.length); // deepest (workarea) first
    for (const c of ctxNames) {
      const v = data?.[c]?.caseInfo?.content?.[fieldKey];
      if (v !== undefined && v !== null && v !== '') return v;
    }
  } catch { /* fall through */ }
  try {
    const live = pConn.getValue(fieldRef, contextName);
    if (live !== undefined && live !== null && live !== '') return live;
  } catch { /* fall through */ }
  return resolvedValue;
};

const creditLimit = readLive('creditLimit', creditLimitProp);
```

> Both pieces are required. The subscription alone re-renders but still reads stale/committed
> data; the fresh read alone has nothing to trigger the re-render. Note embedded fields use a
> double-underscore key (`.CaseType__FieldName`) stored at
> `data[ctx].caseInfo.content['CaseType__FieldName']`.

> **Anti-pattern (do NOT do this):** binding as `"format": "TEXT"` and typing a field-name
> string, then reading with `getDataObject()`/bare `getValue('.Field')` **without** the context.
> That resolves against saved/last-committed content and the wrong context, so the display stays
> "stuck." Use `format: PROPERTY` + the observer pattern above instead.

### Always render field values through a display guard (reference/embedded fields can be objects)

A resolved field value is **not** always a string. **Reference fields** (and embedded/related
data) resolve to an **object**, not a primitive — rendering it directly shows `[object Object]`
or throws. **Wrap every field value you display in a small `toDisplayString()` guard** (a
defensive helper you define in the component — the gallery ships no such util):

```ts
// coerce any resolved field value to a safe display string
function toDisplayString(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    // a resolved reference / embedded object — prefer a human label
    const o = v as Record<string, unknown>;
    return String(o.pyLabel ?? o.label ?? o.pyDescription ?? o.name ?? o.value ?? '');
  }
  return String(v);
}
```
```tsx
// render — never print the raw value
<Text>{toDisplayString(fieldValue)}</Text>
```

Primitives pass through unchanged; objects become a sensible label instead of `[object Object]`.
Wrap **every** displayed field value — you rarely know up front which fields are references.

#### Troubleshooting "value not updating" — check in this order

1. **Is the field mapped?** Open the component's config panel in Studio and confirm each
   `PROPERTY` slot is bound to a real field. Unmapped → prop is empty and never changes.
2. **Editor or observer?** If it mirrors *other* fields, it is an observer — apply Pattern B
   (store subscription + fresh read from the **workarea child context**), not the bare-prop
   RangeSlider pattern.
3. **Reading the wrong context?** If an observer only updates **after submit**, you are reading
   the parent/committed context. Read from the deepest `{contextName}/…` context (the workarea)
   as shown in Pattern B.
4. **Fresh bundle loaded?** Hard-refresh / reopen the view so the republished bundle is used.

### Refreshing the case view after a change

```ts
const caseKey = pConn.getCaseInfo().getKey();
const viewName = pConn.getCaseInfo().getCurrentAssignmentViewName();
pConn.getActionsApi().refreshCaseView(caseKey, viewName, '', { autoDetectRefresh: true });
```

## PCore — global runtime (`window.PCore`)

Application/shell services not scoped to one component. Guard with optional chaining.

| API | Purpose |
|-----|---------|
| `PCore.getStore()` | Redux store; `subscribe(cb)` to react to data changes. |
| `PCore.getDataApiUtils()` | Load data pages / data sources for widgets. |
| `PCore.getPubSubUtils()` | Cross-component publish/subscribe. |
| `PCore.getEvents()` | Well-known Constellation lifecycle events (assignment submitted, etc.). |
| `PCore.getSemanticUrlUtils()` | Build semantic URLs for case navigation. |
| `PCore.getNameSpaceUtils()` | Namespace qualification (`NamespaceUtils`): `getDefaultQualifiedName(name)` → `PegaPlatform__` (Platform rules); `getQualifiedName(name, ns)` → app namespace; `getQualifiedNameForComplexRuleReferences(name, {namespace, marker})` → property/multi-segment/deep paths. Wrapped by `getMappedKey`. |
| `PCore.getEnvironmentInfo()` / `getLocaleInfo()` | Operator/locale/app info; `getEnvironmentInfo().getKeyMapping(name)` maps Platform IDs to Launchpad names. |

```ts
const PCore = (window as any).PCore;
const dataApiUtils = PCore?.getDataApiUtils?.();
const events = PCore?.getEvents?.();
```

## PConnect vs PCore

- **PConnect** — inside one component: case context, field updates, view refresh, localization.
- **PCore** — app-wide: data pages, pub/sub, events, semantic URLs, store subscription.

## Pattern summary by type

- **Field** — PConnect-driven: `getInheritedProps`, `getActionsApi().updateFieldValue`,
  `getLocalizedValue`; PCore only for reference data/global events.
- **Template (DETAILS/FORM/PAGE)** — PConnect for config (`getRawMetadata().config`),
  updates, refresh; PCore for related data sets and global events.
- **Widget (PAGE/CASE)** — PConnect for read/display of case fields (context-aware) and
  `getActionsApi()` (open/preview/create); PCore for data pages, pub/sub, events, navigation.
