# Flow 02 — Discover the app via MCP

Goal: build a live **context snapshot** of the app before recommending anything.
See `references/knowledge/mcp-rulebase-queries.md` for tool details.

## Steps

1. **Confirm connection & notify the user.** Once the OAuth MCP connection is established and
   `getAppInfo` returns, **tell the user the MCP connection is successful**.

2. **Ask the user for the app name, then resolve it.** Do **NOT** derive the app from the Studio
   URL — the URL only identifies the **environment**, which hosts many apps. Ask the user which
   app (by name), then call `find_application` with that name to resolve the app and its
   **working branch**. Record the platform version (drives DXCB version selection in flow 04).

3. **Auto-list case types and data types (no need to be asked).** Immediately query and
   present, in one message:
   - **Case types** — list `CaseType` rules (label + applies-to class).
   - **Data types** — list `DataObject` rules (the data-type rule type is **`DataObject`**, not
     `DataType`).
   Scope queries to the resolved app's **working branch** and namespace; if results are only
   `PegaPlatform` rules, you're on the wrong branch. Keep it a clean, scannable list.

4. **Suggest candidate components, then ask which to build.** Do **NOT** ask an open,
   unopinionated "what do you want to build?". After showing the lists, **propose 2–4 concrete
   component ideas grounded in the discovered case types / data objects** — each as: component
   **type** (Field / Widget / Template) + a one-line what-it-does tied to a specific case type or
   field (e.g. "a **Widget** showing a Dealer's financing programs from the Financing Program
   data", "a **Template** summarizing Lending Application eligibility at a glance"). If an **OOTB**
   Constellation template already covers an idea, say so and recommend OOTB over custom (see
   `launchpad-views-ui-rules.md`). Then ask the user to **pick one or describe their own**. This
   is the single main design input; do not proceed to recommendation until answered.

5. **Read the data model** — for the chosen context, list data objects/fields. Capture
   name, type, and cardinality (single / list / embedded). Interpret with
   `references/knowledge/launchpad-data-model.md`.

5a. **Build the namespace map (source of truth for code generation).** For every field, data
   page, view, and rule the component will use, record its **owning namespace** from the
   rulebase — the rules come back namespace-qualified, so you know the owner: `PegaPlatform` vs
   the app namespace (e.g. `ProviderManagementApp`). **Do not assume the app namespace** — a
   reference data page like `CountryList` or an inherited field like `Name` / `BusinessID` is
   often `PegaPlatform`-owned. **Present this map to the user** as a table before generating code:

   | Name (bare) | Kind | Owner namespace | Qualify with |
   |-------------|------|-----------------|--------------|
   | `ResourceList` | data page | `ProviderManagementApp` | `getQualifiedName('ResourceList', appNs)` |
   | `FreeCapacity` | field | `ProviderManagementApp` | `getQualifiedName('FreeCapacity', appNs)` |
   | `CountryList` | data page | `PegaPlatform` | `getMappedKey('CountryList')` |
   | `Name` | field | `PegaPlatform` | `getMappedKey('Name')` |
   | `pyID` (record id) | platform id | `PegaPlatform` | `getMappedKey('pyID')` → `PegaPlatform__BusinessID` |

   This map drives flow 05 code generation: **app-owned → `getQualifiedName(name, appNs)`,
   platform-owned → `getMappedKey(name)`** (see `pcore-pconnect-apis.md`). The developer configures
   **bare** names; the component qualifies them at runtime using this map.

6. **Read relationships** — note references/embedded data relevant to the request.

7. **Read views** — list `View` rules to know valid placements/regions
   (`references/knowledge/launchpad-views-ui-rules.md`).

8. **Read the theme** — resolve the `Theme` rule and extract tokens for later
   theme-accurate screenshots (`references/knowledge/launchpad-theme.md`).

## Output

Assemble the context snapshot:

- Target case type + applies-to class
- Candidate fields (name, type, cardinality, required/read-only)
- Relevant relationships
- Placement options
- Theme tokens

## Guardrails

- Never assume field names/types — read them.
- On empty/failed queries, ask one targeted clarifying question instead of guessing.
