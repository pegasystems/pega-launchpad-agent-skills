# Preferred frontend packages for Launchpad Custom UX

This reference lists the **preferred public NPM packages** that should be used when building Launchpad Custom UX components, and that Astro should prioritize when generating React code. The main goal is to keep components aligned with Constellation/Launchpad standards while avoiding unnecessary third‑party UI libraries.

---

## Primary UI library – `@pega/cosmos-react-core`

- **Package:** `@pega/cosmos-react-core`
- **NPM:** https://www.npmjs.com/package/@pega/cosmos-react-core
- **Purpose:** Primary Cosmos React UI library used by Constellation and Launchpad custom UX. Provides layout, form controls, typography, icons, and common widgets.
- **Examples of commonly used components (see `assets/Pega_Extensions_*`):**
  - `Flex`, `Grid` – layout containers.
  - `FormControl`, `FormField` – form field wrappers with labels, status, and helper text.
  - `Text`, `Icon`, `Badge` – text and decorative display components.
  - `QRCode` – QR code rendering component (see `Pega_Extensions_QRCode`).
  - `withConfiguration` – HOC to bind configuration and PConnect metadata into the React component.

**Astro behaviour:**

- Prefer Cosmos components from `@pega/cosmos-react-core` over raw HTML elements or third‑party UI kits for:
  - Layout and structure.
  - Forms and validation surfaces.
  - Basic visualization and typography.
- Start from how these components are used in `assets/Pega_Extensions_*` (for example, QR code, rating, meter, calendar) and follow the same composition patterns.
- Ensure `@pega/cosmos-react-core` is present in the DXCB project's `package.json` dependencies with a compatible version.

---

## Additional Cosmos feature packages (on top of core)

Use these **only when the use case requires the extra functionality**, always together with `@pega/cosmos-react-core`:

- **`@pega/cosmos-react-work`**  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-work  
  Worklist / work object–oriented components for Constellation portals. Use when building widgets or templates that need standard worklist/work item patterns beyond what core provides.

- **`@pega/cosmos-react-condition-builder`**  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-condition-builder  
  Condition / rule builder UI. Use when you need an inline condition editor instead of building one from scratch.

- **`@pega/cosmos-react-rte`**  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-rte  
  Rich text editor components aligned with Cosmos. Prefer this over generic RTE libraries when a full RTE is required.

- **`@pega/cosmos-react-dnd`**  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-dnd  
  Drag‑and‑drop helpers for Cosmos layouts. Use for boards, re‑ordering, or drag interactions (for example, Kanban-like experiences).

- **`@pega/cosmos-react-social`**  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-social  
  Social/collaboration UI elements. Use when implementing activity feeds or social features consistent with Cosmos.

- **`@pega/cosmos-react-cs`**  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-cs  
  Customer Service–oriented Cosmos components. Use only if the scenario is explicitly CS‑centric and you need CS‑specific patterns.

---

## Tooling and dev utilities (build / test / configs)

These packages support **tooling, builds, and tests**. They are usually configured once at project setup time and should not be added as runtime dependencies of individual DXCB components unless there is a very specific, documented need.

- **`@pega/cosmos-react-build`** – build helpers for Cosmos React.  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-build

- **`@pega/cosmos-react-tools`** – Cosmos React development tools.  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-tools

- **`@pega/cosmos-react-test-utils`** – testing utilities for Cosmos React.  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-test-utils

- **`@pega/cosmos-react-demos`** – demos and example applications.  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-demos

- **`@pega/cosmos-react-wss`** – WSS helpers for Cosmos React.  
  NPM: https://www.npmjs.com/package/@pega/cosmos-react-wss

Shared front‑end configs (linting/formatting/TS) – use only when bootstrapping or standardizing a DXCB project; these are **not** runtime UI dependencies:

- **`@pega/eslint-config`** – ESLint config.  
  NPM: https://www.npmjs.com/package/@pega/eslint-config

- **`@pega/prettier-config`** – Prettier config.  
  NPM: https://www.npmjs.com/package/@pega/prettier-config

- **`@pega/tsconfig`** – TypeScript config.  
  NPM: https://www.npmjs.com/package/@pega/tsconfig

- **`@pega/stylelint-config`** – Stylelint config.  
  NPM: https://www.npmjs.com/package/@pega/stylelint-config

- **`@pega/cspell-config`** – cspell config.  
  NPM: https://www.npmjs.com/package/@pega/cspell-config

- **`@pega/configs`** – bundle of Pega front‑end configs.  
  NPM: https://www.npmjs.com/package/@pega/configs

---

## Related SDKs and DX tooling

These packages are related to the broader React SDK and DX component tooling ecosystem. They are usually wired in by DXCB or the Constellation React SDK itself and **should not be added directly as dependencies of individual custom components** unless there is a documented advanced scenario.

- **`@pega/dx-component-builder-sdk`**  
  NPM: https://www.npmjs.com/package/@pega/dx-component-builder-sdk  
  Utilities for building custom DX components. This underpins the DXCB tooling and may already be present in DXCB‑generated projects.

- **`@pega/react-sdk-components`**  
  NPM: https://www.npmjs.com/package/@pega/react-sdk-components  
  React SDK infrastructure components and bridge.

- **`@pega/react-sdk-overrides`**  
  NPM: https://www.npmjs.com/package/@pega/react-sdk-overrides  
  React SDK override hooks and customizations.

- **`@pega/constellation-dx-components-build-utils`**  
  NPM: https://www.npmjs.com/package/@pega/constellation-dx-components-build-utils  
  Build utilities for Constellation DX components. Used at build time, not at runtime inside components.

- **`@pega/auth`**  
  NPM: https://www.npmjs.com/package/@pega/auth  
  OAuth 2.0 client library (supports Infinity and Launchpad). **Do not import this directly into DXCB components**; authentication should be handled by the hosting application/SDK, not inside UI components.

---

## How Astro should use this reference

When generating a new Launchpad custom component, Astro should:

1. **Always start with `@pega/cosmos-react-core`** for layout, forms, and basic visualization. Only add additional Cosmos feature packages if the use case truly requires them.
2. Inspect imports in existing examples (for example, `assets/Pega_Extensions_QRCode/index.tsx`) and reuse the same packages and components where possible.
3. Ensure required packages are present in the DXCB project's `package.json` dependencies with compatible versions.
4. Avoid pulling in tooling/config packages or SDK/build utilities as runtime dependencies unless the scenario is clearly advanced and documented.
5. Consult the NPM documentation linked above for each package when composing new UIs or deciding between available components.
