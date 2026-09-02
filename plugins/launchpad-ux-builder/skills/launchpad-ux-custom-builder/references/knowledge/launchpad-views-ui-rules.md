# Knowledge: Launchpad views & UI rules (placement)

Helps the agent decide **where** a component can live and which view/region to target,
based on the `View` rules read via MCP (`mcp-rulebase-queries.md`).

## View concepts

- A **View** defines a layout for a context (case details, form, page, portal landing).
- Views contain **regions** (e.g. A/B regions in a template) that host fields, widgets,
  and templates.
- **Case-level** placements: Details region, Form (during assignments), Utilities pane.
- **Portal-level** placements: landing page / dashboard tiles.

## Placement → component type

| Placement request | Component type / subtype |
|-------------------|--------------------------|
| Case Details summary / KPIs | Template `DETAILS` (or Widget `CASE`) |
| Case Utilities pane panel | Widget `CASE` |
| During a step / assignment form | Template `FORM` / Field |
| Portal landing tile / dashboard | Widget `PAGE` |
| Reusable across case + portal | Widget `["PAGE","CASE"]` |
| Single specialized input | Field (matching subtype) |

## OOTB Constellation templates & widgets — RECOMMEND THESE BEFORE building custom

Constellation/Launchpad ships many **out-of-the-box** display templates and widgets that an
author configures in Studio **with no custom code**. If one of these already covers the request,
**recommend it and do NOT build a custom DXCB component** — a custom build is only justified when
no OOTB option meets the need (or the user explicitly wants behavior OOTB can't provide).

Common OOTB templates/widgets to check first (verify availability in the app's view-layout /
widget pickers — this list is **not exhaustive** and varies by Launchpad version):

| If the request sounds like… | OOTB Constellation option (no custom code) |
|-----------------------------|--------------------------------------------|
| Cards / tiles from a list or data page ("**card gallery**", product cards, gallery) | **Card Gallery** (a.k.a. Gallery) template |
| Rows/columns of records ("table", "grid", "list of records") | **Table** / **Simple Table** / **List** template |
| Grouped fields / case summary details | **Details** / **Fields** template |
| Tabbed sections | **Tabs** template |
| Collapsible sections | **Accordion** template |
| Chronological events / case history | **Timeline** / **Case history (audit)** widget |
| To-dos / open assignments | **To-do** / **Assignments** widget |
| Attachments / files | **Attachments** widget |
| Followers / collaboration / feed | **Followers** / **Pulse** widget |
| Charts / metrics from a report | **Insights** / **Chart** widget |

**Card Gallery is OOTB — do not hand-build a "card gallery" Widget.** When the request maps to
an OOTB template like Card Gallery, tell the user plainly: *"Constellation already ships a
**Card Gallery** template — you can configure it directly in Studio (point it at your list/data
page) with no custom component. I'd recommend that over a custom build. Want me to guide you
through configuring the OOTB template, or do you have a specific need it can't meet that
justifies a custom component?"* Only proceed to a custom component if the user confirms the OOTB
option is insufficient.

## How to use existing views

1. List `View` rules for the target context to confirm a compatible region exists.
2. Confirm the authoring context (applies-to class) matches the component's data binding.
3. After publish, the component appears in the relevant picker:
   - Widget → widget picker (Portal or Case/Utilities).
   - Template → view layout picker (Details/Form/Page).
   - Field → the field's **Display as** options.

## Guardrails

- Confirm the placement with the user when multiple regions are valid.
- Ensure the component's `type`/`subtype` in `config.json` matches the intended placement,
  or Studio authors will not find it in the expected picker.
