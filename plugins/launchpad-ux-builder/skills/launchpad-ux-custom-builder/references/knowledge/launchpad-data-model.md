# Knowledge: Launchpad data model (classes, fields, relationships)

This module teaches the agent to interpret the case/data structure it reads via MCP
(`mcp-rulebase-queries.md`) so it can pick and wire the right component. Distilled from the
Launchpad case-data-modeling and datamodel knowledge.

## Terminology — always say "Field" (never "Property")

In Launchpad, a data element on a case type or data object is a **Field**. **Always call it a
"Field"** in every user-facing message, recommendation, question, and generated label — e.g.
say "the **Applicant Name field**", never "the Applicant Name property". Do not use "property"
for a Launchpad data element under any circumstances.

- User-facing labels the agent authors (config.json `label`, chat text, field-mapping panels)
  must read "… field" (e.g. "Applicant name field"), never "… property".
- "Property" is reserved **only** for internal Constellation/pCore API names that literally
  contain the word — e.g. `getConfigProps()`, `getStateProps().value`, a `@P .Field`
  *property reference* in metadata. These are code identifiers, not how you describe the data
  element to the user. Even then, describe what they bind to as a **field**.

## Classes and case types

- A **case type** is a class the user works a case against; it has a primary/applies-to
  class used as the component's authoring context (`getPConnect` operates in this context).
- A **data object** is a reusable class holding structured data (referenced or embedded by
  case types).
- When targeting a component, resolve **which class** the field lives on so
  `updateFieldValue` / `getStateProps().value` bind to the correct field.

## Field types → Cosmos component mapping

Map each Launchpad field type to the preferred Cosmos control for a **Field** component.
Prefer `@pega/cosmos-react-core` components over raw HTML.

| Launchpad field type | Field subtype (config.json) | Preferred Cosmos control |
|----------------------|-----------------------------|--------------------------|
| Text (short)         | `Text` / `Text Input`       | `Input` |
| Text (long)          | `Paragraph`                 | `TextArea` |
| Integer              | `Integer`                   | `Input type=number` / slider |
| Decimal / Currency / Percentage | `Decimal` / `Currency` / `Percentage` | `Input` with format |
| Boolean              | `Boolean`                   | `Checkbox` / `Switch` |
| Date / DateTime / TimeOfDay | `Date` / `DateTime` / `TimeOfDay` | `DatePicker` / `DateTimePicker` |
| Picklist             | `Picklist`                  | `Select` / `RadioButtonGroup` |
| Email / Phone / URL  | `Email` / `Phone` / `URL`   | `Input` with matching type |

For multi-field visualizations, use a **Widget** (dashboard/utilities) or **Template**
(layout region) instead of a Field.

## Single value vs list vs embedded

- **Single value:** bind directly with `getStateProps().value`.
- **List (page list):** a Widget/Template that iterates; source the rows from a data page.
- **Embedded page:** navigate into the embedded class context before binding.

Always confirm cardinality from the MCP read — it changes the component type.

## Relationships

- **Reference / record (ObjectReference) fields** point to another case/data record. A custom
  DXCB **Field cannot replace the "Display As" of a reference/record field** — Launchpad does
  not allow a custom Field to take these over. **Use a Widget instead** to display or navigate
  to the referenced record (PCore semantic URLs / navigation APIs), and gate any data-object
  read with `doesRestApiExist('readDataObject')` (see `pcore-pconnect-apis.md`).
- **Embedded data** is inline; render within the same context.
- Identify relationships when the request implies "show related …" or "pick from …".

## Data pages & rule names (Launchpad)

- Reference a data page by its **RuleResolutionID** — but do **not** hand-write a `D_` prefix
  (Infinity convention) or a bare name. **Qualify by rule ownership**: an **app** data page →
  `PCore.getNameSpaceUtils().getQualifiedName(dataPage, appNs)` (with
  `appNs = PCore.getEnvironmentInfo().getApplicationName().split('__')[0]`); a **Platform**
  identifier → `getMappedKey(name)`. **Do not use `getMappedKey`/`getDefaultQualifiedName` for
  an app data page** — they force `PegaPlatform__`. See `pcore-pconnect-apis.md`
  §"Resolving namespaces."
- The same ownership rule applies to property, view, field, and local-action names — app-owned
  → `getQualifiedName(name, appNs)`, Platform-owned → `getMappedKey(name)`.

## Choosing the component type from the data

Decision guide (after reading the model):

- Single field, specialized control → **Field** (matching subtype).
- Panel/card on a landing page → **Widget** subtype `PAGE`.
- Panel in the case Utilities pane → **Widget** subtype `CASE`.
- KPIs/summary in case Details → **Template** subtype `DETAILS`.
- Custom form/page layout → **Template** subtype `FORM` / `PAGE`.

## Guardrails

- Never invent field names or types — use exactly what MCP returned.
- Respect required/read-only/disabled metadata discovered on the field.
- If the requested data isn't present in the model, tell the user and propose the closest
  existing field or a model change.
