---
name: launchpad-ux-custom-components
description: Introduces Custom UX in Pega Launchpad / Constellation, when to build custom components, and what design information is needed.
tags: [launchpad, constellation, custom-ux, componen       -                    - Context / filter fields (for example, `contextField`, `setCaseID`):
             - *"Should the widget filter by the current case? If yes, which field carries the context?"*
          - Layout-specific fields (for example, `groups`, `groupField`):
             - *"Which statuses or groups should appear as columns, and which field drives grouping?"*ELD bindings (for example, `inputProperty`, `minValueProperty`, `maxValueProperty`):
             - *"Which case field should this component read and update?"*or **Field** components:
          - FIELD bindings (for example, `inputProperty`, `minValueProperty`, `maxValueProperty`):
             - *"Which case field should this component read and update?"*
          - LABEL / helper text fields (for example, `label`, `helperText`):
             - *"What label and helper text should users see for this control?"*
          - SELECT options (for example, `format`, `maxRating`):
             - *"Which option do you prefer for [config name]? (list valid values from `source`.)"*
       - For **Widget** components:tend]
---

## Overview

This skill introduces **Custom UX** for Pega Launchpad built on the **Constellation** design system. It explains:

- When you should consider building **custom Constellation components** instead of using only out-of-the-box views and templates.
- What information and design inputs are required before implementing a custom component.
- How Custom UX fits into the overall Launchpad architecture and DX patterns.

Custom components extend the standard Constellation UX by adding **specialized visualizations, interactions, or integrations** while still respecting Launchpad's design language and runtime model.

## Mandatory conversation flow before generating code

**IMPORTANT**: When a user requests a custom component, the agent MUST follow the step-by-step conversation flow defined in `references/conversation-flow.md`. 

**Do NOT generate any code until all steps are completed and the user confirms.**

The flow ensures:
1. **Step 1**: Verify OOTB Constellation components cannot meet the requirement
2. **Step 2**: Check UX Boosters catalog at https://launchpad.io/ux-boosters
3. **Step 3**: Gather detailed requirements (functionality, location, data, interactions)
4. **Step 4**: Present component type recommendation (Field/Widget/Template) and get user confirmation
5. **Step 5**: Only then generate the code

See `references/conversation-flow.md` for the complete conversation script and examples.

---

## Prerequisites

Before building a custom DX component for Launchpad, ensure you have:

1. **Development environment**
   - Node.js (LTS version, e.g., 18.x or 20.x)
   - npm (comes with Node.js)
   - A code editor (VS Code recommended)

2. **Launchpad Provider access**
   - Admin access to your Launchpad Provider
   - An application where you want to use the component

3. **OAuth client credentials for DXCB**
   - In Launchpad Studio, click the 9-dot menu and go to **Administration setup**
   - Add a new **OAuth 2.0 client registration**
   - Note the `clientId` and `clientSecret` for `tasks.config.json`

4. **Provider details**
   - Frontend URL (e.g., `https://your-provider.launchpad.io`)
   - Isolation ID (found in Provider settings)

## When to build Custom UX

Prefer **out-of-the-box Constellation components and templates** whenever they meet the business and UX requirements. Before deciding to build a new custom component, Astro should explicitly warn and remind the user to:

1. **Check the UX Boosters catalog first**  
   - Visit the public catalogue of pre-built Launchpad custom UX components at **https://launchpad.io/ux-boosters**.  
   - Confirm whether a component that meets the requirement already exists and can be installed into the Provider with a single click.

2. **Confirm Constellation / Launchpad does not already support it out of the box**  
   - Verify whether the requested pattern is already available as a standard Constellation view, region template, or field/widget configuration.  
   - If an OOTB option exists, Astro should recommend using that instead of creating a new custom component.

Consider Custom UX only when, after these checks:

- The business needs a **visualization or interaction pattern** that is not available out of the box (for example, a specialized chart, map, scheduler, or composite layout).
- You must **embed an external widget or library** (for example, a third-party map, chart, or document viewer) inside a Launchpad experience.
- You need a **reusable UX pattern** used across multiple case types or portals that cannot be modeled cleanly using existing Constellation building blocks.
- You want to **enhance productivity or clarity** for a specific user role with a tailored view that goes beyond standard form and list patterns.

Before deciding on Custom UX, validate that:

- The required behavior cannot be modeled with standard Constellation views, region templates, and OOTB components (including any UX Boosters you can install).
- The custom experience can still respect Launchpad's **navigation, accessibility, and responsive** guidelines.
- The long-term **maintenance cost** (updates, security, library upgrades) is acceptable.

## What you need before building a Custom UX component

To successfully design and implement a Custom UX component, gather the following information first:

1. **User and use case definition**
   - Who will use the component (persona, role, channel)?
   - In which **portal or page** will the component appear?
   - What **task or decision** should it help the user complete faster or more accurately?

2. **Data and APIs**
   - What **Launchpad data** does the component need (cases, data objects, data pages)?
   - Which **DX APIs or Data View endpoints** will supply the data?
   - What **input properties** (filters, selections, actions) must the component send back to Launchpad?

3. **Interaction and behavior**
   - What are the primary **user actions** (view-only, select, drag-and-drop, edit inline, open details, etc.)?
   - How should the component **react to state changes** (loading, error, empty state, success)?
   - Are there any **business rules** that must be enforced in the UX (selection limits, mandatory steps, validation messages)?

4. **Visual and layout design**
   - Sketches or **wireframes** showing layout, hierarchy, and key states.
   - Alignment with **Constellation design tokens** (colors, typography, spacing) and layout patterns.
   - Guidelines for **responsive behavior** (desktop, tablet, mobile breakpoints).

5. **Technical constraints and libraries**
   - Any **external libraries** or SDKs required (maps, charts, document viewers) and their licensing/security implications.
   - Performance or security considerations (large data sets, PII, external calls).

Documenting these inputs up front helps ensure the Custom UX component is:

- **Grounded in real user needs**,
- **Aligned with Launchpad and Constellation design rules**, and
- **Feasible to implement and maintain**.

## How Custom UX fits into Launchpad and DX

Custom UX components should integrate cleanly with Launchpad's DX approach:

- Use **DX APIs and Data Views** as the primary data access layer instead of calling backend systems directly from the browser.
- Treat the component as **UI logic only**: complex business rules and decisions should remain on the server side where possible.
- Follow Launchpad's **security and access control** model; do not bypass authentication or authorization checks.
- Respect Constellation's **navigation model** (for example, how cases, assignments, and dialogs are opened) so the experience remains consistent.

## DXCB – framework for Custom UX components

**DXCB (Digital Experience Component Builder)** is the framework and tooling used to build **Constellation-compatible custom components**. It provides a standard way to:

- Structure frontend code (typically React-based) as **Constellation extensions**.
- Bind components to **Launchpad data and context** coming from DX APIs and Data Views.
- Package and register components so they appear as **reusable building blocks** in Launchpad portals and views.

Using DXCB ensures that custom components:

- Respect Constellation's **design system** (layout grid, typography, spacing, colors).
- Integrate correctly with Launchpad's **case context, routing, and refresh** model.
- Are more **upgrade-friendly**, because they follow a known extension pattern instead of ad-hoc custom code.

### Getting started with a DXCB project

At a high level, building a Launchpad custom component with DXCB involves:

1. **Initialize a DXCB project**  
   From a terminal, in the folder where you want your DXCB project:

   ```bash
   npx @pega/custom-dx-components@~25.1 init
   ```

   > **Important**: Always check the official Pega documentation for the current recommended version (see **Official Pega documentation** section at the end of this skill).

   - Answer prompts for project name, organization, version, and description.  
   - Keep your **organization/library names reasonably short** so you have room for meaningful component names.

2. **Configure `tasks.config.json`**  
   After initialization, DXCB creates a `tasks.config.json` file. Configure the `server-config` section with your Launchpad Provider details (see Prerequisites):
   - `server` – Provider frontend URL
   - `clientId` and `clientSecret` – OAuth credentials
   - `isolationID` – Provider isolation ID

   Treat credentials as **sensitive** and follow your internal security practices.

3. **Create a component folder**  
   Inside the components directory (for example, `src/components`):
   - Create a folder per component (for example, `range-slider-template`).
   - Add:
     - A `config.json` that defines the component **type**, **subtype**, and configuration.  
     - A React implementation file (for example, `index.tsx`) that uses `getPConnect()` and, where needed, global `PCore`.

### Choosing the right component type

DXCB supports three main kinds of Constellation components:

- **Layout templates** – overall layouts for views (DETAILS, FORM, PAGE).  
- **Widgets** – self-contained panels/cards for dashboards and Utilities (PAGE, CASE, or PAGE & CASE).  
- **Field components** – single-field controls with a field subtype (Integer, Text, Decimal, etc.).

When in doubt, think in terms of Constellation UX patterns:

- **Case details bands and summary cards**  
   - Pattern: KPIs, summary panels in the **Details** region of a case or data view.  
   - DXCB: **Template** with `subtype: "DETAILS"`.  
   - Example: the **Range Slider Template** in `examples/dxcb-examples/range-slider-template/` writes min/max values back to case fields via `getPConnect().getActionsApi().updateFieldValue(...)`.

- **Dashboards and landing page tiles**  
   - Pattern: tiles and insights panels on **portal landing pages**.  
   - DXCB: **Widget** with `subtype: "PAGE"` (or `["PAGE", "CASE"]` if reused in Utilities).  
   - Example: the **Calendar Widget** in `examples/dxcb-examples/calendar-widget/` shows upcoming work items from a Constellation data page and uses `PCore` + `getPConnect()` for navigation and previews.

- **Utilities pane helpers in case view**  
  - Pattern: context panels in the **Utilities pane** of a case (insights, timelines, related work).  
  - DXCB: **Widget** with `subtype: "CASE"`.  

- **Custom field controls**  
   - Pattern: a single input control with a specialized visualization (rating, pill selection, custom slider).  
   - DXCB: **Field** with the appropriate **field subtype** (for example, `"Integer"`, `"Text"`, `"Decimal"`).  
   - Example: the **Star Rating Field** in `examples/dxcb-examples/star-rating-input/` writes an integer score and respects Constellation field behaviors.

Choosing the correct type and subtype ensures:

- Launchpad Studio authors can **discover** your component in the right context.  
- DXCB generates an appropriate **starter implementation**.  
- The component appears where you expect it (widget pickers, layout templates, or field Display-as options).

### From DXCB project to Launchpad Studio

Once you have implemented your component in the DXCB project:

1. **Build the component**  
   Run the DXCB build script from the root of the DXCB project, for example:

   ```bash
   npm run buildComponent
   ```

2. **Authenticate against the target Provider**  
   Use the DXCB authentication script (for example, `npm run Authenticate`) so DXCB can publish to your Launchpad Provider using the `server-config` values in `tasks.config.json`.

3. **Publish the component**  
   Run the publish script (for example, `npm run publish`) to register the component in the Provider.

After a successful publish, your component will appear in Launchpad Studio as:

- A **Widget** in widget pickers (Portal or Case / Utilities, depending on `type` and `subtype`).  
- A **Template** in view layout pickers (Details, Form, Page).  
- A **Field** in the **Display as** options for fields of the matching type.

### How Astro should gather requirements for a new component

When a developer asks Astro to build a **new custom component**, the agent should:

1. **Identify the closest matching example**  
    - Browse the Launchpad reference repository: `https://github.com/pegasystems/constellation-ui-gallery/tree/next/src/components`
    - Choose the component whose `config.json` type and subtype (Field / Widget / Template) and overall behavior best match the request.

2. **Use `config.json.properties` as the question checklist**  
    - Treat the `properties` array in the chosen example’s `config.json` as **view metadata that must be filled in**.  
    - For each relevant property, ask targeted questions to the developer, for example:
       - For **Field** components:
          - PROPERTY fields (for example, `inputProperty`, `minValueProperty`, `maxValueProperty`):
             - *“Which case/data property should this component read and update?”*
          - LABEL / helper text fields (for example, `label`, `helperText`):
             - *“What label and helper text should users see for this control?”*
          - SELECT options (for example, `format`, `maxRating`):
             - *“Which option do you prefer for [property name]? (list valid values from `source`.)”*
       - For **Widget** components:
          - Data source fields (for example, `dataPage`):
             - *“Which data page should this widget use?”*
          - Context / filter fields (for example, `contextProperty`, `setCaseID`):
             - *“Should the widget filter by the current case? If yes, which property carries the context?”*
          - Layout-specific fields (for example, `groups`, `groupProperty`):
             - *“Which statuses or groups should appear as columns, and which property drives grouping?”*
       - For **Template** components:
          - Region configuration (for example, `A` regions):
             - *“Which view or fields should be placed in region A?”*
          - Numeric bounds (for example, `min`, `max`, `step`):
             - *“What is the numeric range and increment you want for this control?”*

3. **Confirm and summarize before generating code**  
    - Summarize the collected answers as a **configuration snapshot** (what properties, data sources, labels, ranges, etc. will be used).  
    - Only then generate:
       - A tailored `config.json` with those values wired in, and
       - An `index.tsx` implementation that:
          - Uses `getPConnect().getRawMetadata().config` to read them, and
          - Follows the PConnect / PCore patterns in `references/PCore-PConnect-APIs.md`.

### Implementation reference – PConnect and PCore

For deeper **code-level** guidance when building DXCB components, use the consolidated reference in this skill folder:

- `references/PCore-PConnect-APIs.md` – how to use per-component **PConnect** APIs (`getPConnect()`) and global **PCore** APIs (data pages, events, pub/sub, semantic URLs) in Launchpad custom components.

This `SKILL.md` stays focused on **when and how** to design custom components and how DXCB fits into Launchpad. The `references/` document is for detailed implementation patterns.

### Reference repository for Launchpad components

> **Important**: For Launchpad, use the **`next` branch** of the Constellation UI Gallery repository as the reference for component patterns and examples:
> 
> **https://github.com/pegasystems/constellation-ui-gallery/tree/next/src/components**
>
> Do NOT use the `master` branch or Infinity-specific repositories, as they may contain patterns not applicable to Launchpad.

When generating **new custom components**, the agent should:

- First browse the components at `https://github.com/pegasystems/constellation-ui-gallery/tree/next/src/components` to find similar patterns.
- Clone and adapt an existing component that matches the requested pattern (template, widget, or field) instead of starting from scratch.
- Follow the folder structure, naming conventions, and implementation patterns from that repository.

Examples of component patterns available in the repository:

- `Pega_Extensions_BarCode` – barcode display/input component.
- `Pega_Extensions_Calendar` – calendar/scheduling widget.
- `Pega_Extensions_IframeWrapper` – wrapper for embedding external content in an iframe.
- `Pega_Extensions_KanbanBoard` – Kanban-style board for work items.
- `Pega_Extensions_Meter` – meter/gauge visualization.
- `Pega_Extensions_QRCode` – QR code display/input component.
- `Pega_Extensions_RangeSlider` – range slider template for numeric ranges.
- `Pega_Extensions_RatingLayout` – rating layout template for case summaries.
- `Pega_Extensions_SignatureCapture` – signature capture field component.
- `Pega_Extensions_StarRatingInput` – star rating input field.
- `Pega_Extensions_UtilityList` – utility list widget for case/portal context.

### Coding pattern for Field components (for example, password input)

When generating a new **Field** component (such as a password input, text input, or similar single-value control), Astro should:

- **Clone the pattern of an existing field component** from the reference repository (for example, `Pega_Extensions_StarRatingInput`) instead of inventing a new structure.
   - Define a named component like `PegaExtensionsPasswordInput`.
   - Export it as default via `export default withConfiguration(PegaExtensionsPasswordInput);` using `withConfiguration` from `@pega/cosmos-react-core`.
- **Use Cosmos field components instead of raw HTML inputs**:
   - For editable text/password-style inputs, render the `Input` component from `@pega/cosmos-react-core` rather than `<input>`/`<label>` HTML elements.
   - For display-only mode, render a `Text` component with a masked value (for example, `'***********'` for passwords) instead of an editable field.
- **Align props with Constellation runtime and config.json**:
   - Accept props like: `getPConnect`, `label`, `value`, `helperText`, `validatemessage`, `hideLabel`, `displayMode`, `hasSuggestions`, `fieldMetadata`, `additionalProps`, `testId`, `disabled`, `readOnly`, `required`.
   - Normalize boolean props that may arrive as strings (for example, treat both `true` and `'true'` as `true`).
   - Use `fieldMetadata` (for example, `fieldMetadata.maxLength`) to set constraints such as `maxLength` on the `Input`.
- **Use PConnect Actions API and state mapping for data binding**:
   - Get the PConnect instance from `getPConnect()` and derive:
      - `const actions = pConn.getActionsApi();`
      - `const propName = pConn.getStateProps().value;` (the case field name backing the field).
   - On change, update the case field using `actions.updateFieldValue(propName, newValue)` only when the value actually changes.
   - On blur, trigger validation and suggestions handling using `actions.triggerFieldChange(propName, newValue)` and, when applicable, `pConn.ignoreSuggestion()`.
- **Respect Constellation display modes and status**:
   - If `displayMode === 'DISPLAY_ONLY'`, do not render an editable input; return a non-editable representation (for passwords, a masked `Text` value).
   - Use `validatemessage`, `hasSuggestions`, and similar props to drive the field `status` (`'error'`, `'pending'`, etc.) on the Cosmos `Input`, following patterns from existing `Pega_Extensions_*` field components.

### Preferred frontend packages

When generating or adapting React components for Launchpad Custom UX, the agent should follow this **priority order**:

1. **First, check `@pega/cosmos-react-core`** (https://www.npmjs.com/package/@pega/cosmos-react-core) for existing components that match the requirement. Common components include: `Input`, `Button`, `Text`, `Flex`, `Grid`, `Card`, `Badge`, `Icon`, `FormField`, `Select`, `Checkbox`, `DatePicker`, `Modal`, `Table`, `Tabs`, and many more. **Use these directly instead of creating custom implementations.**

2. **Second, compose using multiple Cosmos components** if no single component matches. Combine layout, form, and display components from `@pega/cosmos-react-core`.

3. **Third, only create a custom component** when no existing Cosmos component or composition meets the requirement.

- Inspect `import` statements in existing components from the reference repository and **reuse those packages and components** in new code.
- Ensure any imported packages are added to the target project's `package.json` dependencies.

For a detailed list of preferred packages and the full priority guidelines, see `references/frontend-packages.md`.

## Repository conventions and file structure

When creating DXCB components, follow these **naming and structure conventions** to ensure consistency and discoverability:

### Folder and file naming

- **Component folder**: Use `Pega_Extensions_<Name>` format (e.g., `Pega_Extensions_StarRatingInput`, `Pega_Extensions_Calendar`).
- **Folder name must match** the `name` and `componentKey` values in `config.json`.
- **Standard files per component**:

| File | Purpose | Required |
|------|---------|----------|
| `index.tsx` | Main React component implementation | ✅ Yes |
| `config.json` | DX component metadata (type, subtype, properties) | ✅ Yes |
| `Docs.mdx` | Documentation for Storybook/gallery | ✅ Yes |
| `demo.stories.tsx` | Storybook stories for previewing the component | ✅ Yes |
| `demo.test.tsx` | Jest unit tests | ✅ Yes |
| `styles.ts` | Styled-components / CSS-in-JS | Optional |
| `localizations.json` | i18n strings | Optional |

### Component implementation conventions

- **React imports**: Always include the React default import at the top of the file. This ensures JSX works correctly with the DXCB TypeScript configuration:
  ```tsx
  import React, { useState, useEffect, useCallback } from 'react';
  ```
  > **Important**: Never use `import { useState } from 'react'` without the default React import. The DXCB project's tsconfig uses `"jsx": "react"` which requires React to be in scope for JSX transformation.

- **Export with `withConfiguration`**: Always wrap the component using `withConfiguration` from `@pega/cosmos-react-core`:
  ```tsx
  import React from 'react';
  import { withConfiguration } from '@pega/cosmos-react-core';
  
  const PegaExtensionsMyComponent = (props) => { /* ... */ };
  
  export default withConfiguration(PegaExtensionsMyComponent);
  ```

- **TypeScript React patterns**: Use functional components with TypeScript.
- **`getPConnect` typing**: Use `getPConnect?: any` for component props unless a shared stronger type already exists in the repo. Avoid creating duplicate one-off `PegaConnect`, `PegaActionsApi`, or `PegaStateProps` interfaces.
- **Field-style components**:
  - Keep `hideLabel` as the public prop name.
  - Pass `labelHidden={hideLabel}` only to Cosmos controls internally.
  - Type `disabled`, `readOnly`, and `required` as booleans, but coerce runtime string `'true'` values using the shared pattern:
    ```tsx
    const [readOnlyBool, requiredBool, disabledBool] = [readOnly, required, disabled].map(
      (v) => v === true || v === 'true'
    );
    ```

### config.json structure

Ensure your `config.json` follows this structure:

```json
{
  "name": "Pega_Extensions_MyComponent",
  "componentKey": "Pega_Extensions_MyComponent",
  "label": "My Custom Component",
  "description": "A custom component for...",
  "type": "Field",
  "subtype": "Text",
  "properties": [
    {
      "name": "label",
      "label": "Label",
      "format": "TEXT"
    },
    {
      "name": "value",
      "label": "Value",
      "format": "PROPERTY"
    }
  ]
}
```

### Storybook conventions

When creating `demo.stories.tsx` for your component:

- Use `select` controls for props with constrained values instead of free-text inputs.
- Set sensible defaults for common props like `testId`, `hideLabel`, `disabled`, `readOnly`, `required`.
- Document additional stories in `Docs.mdx` if needed.
- Mock PConnect/PCore only as much as needed for the story to render.

## Validation and testing

Before considering a component complete, run these **validation steps** to ensure quality:

### Linting

Run the linter to catch code style issues and potential errors:

```bash
npm run lint
```

To auto-fix issues:

```bash
npm run fix
```

### Build validation

Before publishing, verify the component builds correctly:

```bash
npm run buildComponent
```

### Component delivery checklist

Use this checklist before concluding a component implementation:

- [ ] Folder name follows `Pega_Extensions_<Name>` convention
- [ ] `config.json` `name` and `componentKey` match the folder name
- [ ] `index.tsx` exports a typed component wrapped with `withConfiguration`
- [ ] Field-style components use `hideLabel` (not `labelHidden`) as the public prop
- [ ] Boolean props (`disabled`, `readOnly`, `required`) handle string `'true'` values
- [ ] `getPConnect` follows repo conventions (`getPConnect?: any`)
- [ ] PConnect/PCore usage verified against repo examples or official docs
- [ ] `Docs.mdx` explains the component and matches live props
- [ ] `demo.stories.tsx` renders with appropriate mocks
- [ ] Storybook controls use `select` for constrained props
- [ ] Additional stories documented in `Docs.mdx` under `## Examples`
- [ ] `demo.test.tsx` covers key rendering, behavior, and edge cases
- [ ] `styles.ts` and `localizations.json` exist only when justified
- [ ] Source registration files updated if component must appear in gallery
- [ ] `npm run lint` passes (or issues explicitly reported)
- [ ] Relevant tests pass via `npm run test`
- [ ] Any skipped validation steps are explicitly documented

## Guardrails

When building custom components, follow these rules to avoid common pitfalls:

- **Do not invent DX component metadata.** Mirror the shape and naming patterns from existing components in the repository.
- **Do not hand-edit generated bundles or release artifacts** unless explicitly requested.
- **Do not add package dependencies for convenience** if the repository already has an adequate option. Check existing `package.json` first.
- **Do not leave the component half-finished.** If the request implies a usable component, deliver a complete implementation with all required files.
- **Do not bypass Constellation patterns.** Use Cosmos components instead of raw HTML; respect theming, accessibility, and responsive behavior.
- **Do not skip validation.** Always run `npm run lint` and relevant tests, or explicitly report why validation was skipped.

## Official Pega documentation

For the most up-to-date guidance, refer to these official Pega resources:

| Topic | Documentation Link |
|-------|-------------------|
| **Extending Launchpad with DX components** | https://docs.pega.com/bundle/launchpad/page/platform/launchpad/extend-applications-constellation-dx-components.html |
| **Working with DX components in Launchpad** | https://docs.pega.com/bundle/launchpad/page/platform/launchpad/working-constellation-dx-component-launchpad.html |
| **Initialize a DXCB project** | https://docs.pega.com/bundle/constellation-dx-components/page/constellation-dx-components/custom-components/initialize-project.html |
| **Constellation DX components overview** | https://docs.pega.com/bundle/constellation-dx-components/page/constellation-dx-components/custom-components/custom-components.html |
| **Launchpad vs Infinity differences** | https://docs.pega.com/bundle/launchpad/page/platform/launchpad/differences-constellation-dx-components-launchpad-infinity.html |