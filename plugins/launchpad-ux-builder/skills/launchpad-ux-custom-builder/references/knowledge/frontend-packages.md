# Knowledge: Preferred frontend packages (Cosmos-first)

Keep custom components aligned with Constellation and avoid unnecessary third-party UI kits.
Follow this **priority order** when generating/adapting React code.

## Priority order

1. **Use an existing `@pega/cosmos-react-core` component.** Before writing any custom UI,
   check Cosmos for a component that already meets the need. Common exports: `Input`,
   `Button`, `Text`, `Flex`, `Grid`, `Card`, `Badge`, `Icon`, `FormField`, `FormControl`,
   `Select`, `Checkbox`, `RadioButton`, `DatePicker`, `Modal`, `Table`, `Tabs`, `Switch`,
   `Link`, `Status`, and many more. If one fits, use it directly.
2. **Compose multiple Cosmos components.** Combine layout (`Flex`, `Grid`, `Card`) with form
   controls (`Input`, `Select`, `Button`) and `FormField`/`FormControl` wrappers for labels,
   validation, and accessibility. Use theme tokens for styling.
3. **Only then write custom markup** — when no Cosmos component or composition fits (unique
   visualization, third-party lib, novel interaction). Even then, use Cosmos internally where
   possible and keep raw HTML minimal.

Always export via `withConfiguration` from `@pega/cosmos-react-core`.

## Primary library

- **`@pega/cosmos-react-core`** — https://www.npmjs.com/package/@pega/cosmos-react-core
  Layout, form controls, typography, icons, `withConfiguration`. Must be in the DXCB project's
  `package.json`.

## Additional Cosmos feature packages (only if truly needed)

Add alongside core **only** when the use case requires it:

- `@pega/cosmos-react-work` — worklist / work-object components.
- `@pega/cosmos-react-condition-builder` — inline condition/rule editor.
- `@pega/cosmos-react-rte` — rich text editor.
- `@pega/cosmos-react-dnd` — drag-and-drop (boards, reordering).
- `@pega/cosmos-react-social` — activity feeds / social UI.
- `@pega/cosmos-react-cs` — Customer-Service-specific components.

## Do NOT add as component runtime deps

- Tooling/config: `@pega/cosmos-react-build`, `-tools`, `-test-utils`, `-demos`, `-wss`,
  `@pega/eslint-config`, `@pega/prettier-config`, `@pega/tsconfig`, `@pega/stylelint-config`,
  `@pega/cspell-config`, `@pega/configs` — project-setup only.
- SDK/build: `@pega/dx-component-builder-sdk`, `@pega/react-sdk-components`,
  `@pega/react-sdk-overrides`, `@pega/constellation-dx-components-build-utils` — wired by DXCB.
- `@pega/auth` — never import into a component; auth belongs to the host app/SDK.

## Guidelines

- Reuse the `import` statements from the closest gallery component (`constellation-gallery.md`)
  so packages/versions match.
- Ensure any imported package is a dependency in the DXCB project's `package.json`.
- Do not add packages "for convenience" if the project already has an adequate option.
