# Knowledge: Reading a Launchpad app via MCP

This module explains how the agent reads a connected Launchpad application through the
MCP rulebase channel. **This is the source of truth** — always query live before
recommending or generating a component.

## Prerequisites

- The MCP server is configured with the provider connection (`LP_*` env / token from the
  OAuth login in flow step 1).
- The target application namespace and branch are known.

## Core MCP tools

| Tool | Purpose |
|------|---------|
| `getAppInfo` | Confirm connection; return the Application rule namespace, description, and platform version. Call this **first**. |
| `list_rules_by_query` / `rulebase_list_rules_by_query` | List rules of a given type (CaseType, DataObject, View, Theme, etc.), optionally with content. |
| `validate_rule_json` | Validate any rule JSON the agent generates. |
| `rulebase_get_workspace_changes` | See pending changes in the working branch. |

## Discovery sequence

1. **Confirm connection & platform version**
   - Call `getAppInfo`. Use the platform version to pick the matching DXCB line
     (see `references/flow/04-scaffold-dxcb.md`).

2. **Read the case model**
   - List `CaseType` rules to enumerate case types the component could target.
   - For the chosen case type, resolve its class to get the applies-to context.

3. **Read the data model**
   - List `DataObject` / data classes and their fields (see `launchpad-data-model.md`
     for field-type interpretation).
   - Capture field names, types, and whether they are single-value, embedded, or lists.

4. **Read relationships**
   - Identify references and embedded data so a Widget/Template can navigate or display
     related records correctly.

5. **Read existing views / UI rules**
   - List `View` rules to understand where the component can be placed and what regions
     exist (see `launchpad-views-ui-rules.md`).

6. **Read the theme**
   - List/resolve the `Theme` rule to extract color and typography tokens
     (see `launchpad-theme.md`). Required for theme-accurate screenshots.

## Output the agent should assemble

After discovery, build an internal **context snapshot**:

- Target case type + applies-to class.
- Candidate fields (name, type, single/list/embedded).
- Relationships relevant to the request.
- Placement options (case details / utilities / form / portal page).
- Theme tokens (primary/brand colors, typography).

This snapshot drives the UX recommendation (flow step 3) and the mock screenshot
(flow step 6). Never guess these values — read them.

## Notes

- Prefer `includeContent=true` only when field-level detail is needed, to keep payloads small.
- If a query fails or returns empty, ask the user a targeted clarifying question rather
  than assuming.
