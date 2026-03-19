---
name: launchpad-ux-custom-components
description: Introduces Custom UX in Pega Launchpad / Constellation, when to build custom components, and what design information is needed.
tags: [launchpad, constellation, custom-ux, components, frontend]
---

## Overview

This skill introduces **Custom UX** for Pega Launchpad built on the **Constellation** design system. It explains:

- When you should consider building **custom Constellation components** instead of using only out-of-the-box views and templates.
- What information and design inputs are required before implementing a custom component.
- How Custom UX fits into the overall Launchpad architecture and DX patterns.

Custom components extend the standard Constellation UX by adding **specialized visualizations, interactions, or integrations** while still respecting Launchpad's design language and runtime model.

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
   - Which **frontend stack** will be used (for example, React-based Constellation extension)?
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

   - Answer prompts for project name, organization, version, and description.  
   - Keep your **organization/library names reasonably short** so you have room for meaningful component names.

2. **Configure `tasks.config.json`**  
   After initialization, DXCB creates a `tasks.config.json` file that controls:
   - Where components live (for example, `components-directory-path: "src/components"`).
   - How to connect to your **Launchpad Provider** (under `server-config`).
   - The default component library metadata.

   For Launchpad, make sure you align at least:
   - `server-config.server` – the Provider frontend URL.  
   - `server-config.clientId` and `clientSecret` – OAuth client credentials for DXCB.  
   - `server-config.isolationID` – the Provider isolation ID.

   Treat credentials as **sensitive** and follow your internal security practices when storing or sharing this file.

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
- **Field components** – single-property controls with a field subtype (Integer, Text, Decimal, etc.).

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

- App Studio authors can **discover** your component in the right context.  
- DXCB generates an appropriate **starter implementation**.  
- The component appears where you expect it (widget pickers, layout templates, or field Display-as options).

### From DXCB project to Launchpad App Studio

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

After a successful publish, your component will appear in App Studio as:

- A **Widget** in widget pickers (Portal or Case / Utilities, depending on `type` and `subtype`).  
- A **Template** in view layout pickers (Details, Form, Page).  
- A **Field** in the **Display as** options for fields of the matching type.

### How Astro should gather requirements for a new component

When a developer asks Astro to build a **new custom component**, the agent should:

1. **Identify the closest matching example**  
    - Look at:
       - `examples/dxcb-examples/*` for simple patterns, and
       - `assets/Pega_Extensions_*` for full, production-ready implementations.
    - Choose the example whose `config.json.type` and `subtype` (Field / Widget / Template) and overall behavior best match the request.

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

For full, production-ready component examples that were previously published, see `assets/` (for example, the `Pega_Extensions_*` components listed below).

When generating **new custom components**, the agent should:

- First look at the `assets/Pega_Extensions_*` folders to reuse folder structure, build scripts, and publishing patterns.
- Prefer to **clone and adapt** an existing prebuilt component that matches the requested pattern (template, widget, or field) instead of starting from scratch.

Examples of prebuilt components under `assets/`:

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

- **Clone the pattern of an existing field component** under `assets/Pega_Extensions_*` (for example, `Pega_Extensions_StarRatingInput`) instead of inventing a new structure.
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
      - `const propName = pConn.getStateProps().value;` (the case property name backing the field).
   - On change, update the case property using `actions.updateFieldValue(propName, newValue)` only when the value actually changes.
   - On blur, trigger validation and suggestions handling using `actions.triggerFieldChange(propName, newValue)` and, when applicable, `pConn.ignoreSuggestion()`.
- **Respect Constellation display modes and status**:
   - If `displayMode === 'DISPLAY_ONLY'`, do not render an editable input; return a non-editable representation (for passwords, a masked `Text` value).
   - Use `validatemessage`, `hasSuggestions`, and similar props to drive the field `status` (`'error'`, `'pending'`, etc.) on the Cosmos `Input`, following patterns from existing `Pega_Extensions_*` field components.

### Preferred frontend packages

When generating or adapting React components for Launchpad Custom UX, the agent should:

- **Prefer Pega's public NPM packages** for Constellation UI instead of introducing generic UI libraries.
- Inspect `import` statements in existing examples (for example, components under `assets/Pega_Extensions_*`) and **reuse those packages and components** in new code.
- Ensure any imported packages are added to the target project's `package.json` dependencies.

For a detailed list of preferred packages, see `references/frontend-packages.md`. In particular:

- Treat `@pega/cosmos-react-core` as the **primary UI library** for layout, form controls, typography, and basic visualization.
- Add additional Cosmos feature packages only when the use case needs them, and avoid adding tooling/SDK packages as runtime dependencies of individual DXCB components unless there is a clearly documented advanced scenario.