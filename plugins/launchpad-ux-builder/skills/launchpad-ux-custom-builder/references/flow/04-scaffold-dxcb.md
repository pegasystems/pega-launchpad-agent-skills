# Flow 04 — Set up the DXCB project locally (manual scaffold, no interactive CLI)

Goal: produce a ready-to-build DXCB project **without running the interactive `npx ... init`
CLI**. The agent creates the project structure directly — `package.json`,
`tasks.config.json`, `tsconfig.json`, `src/components/` — and installs dependencies via
`npm install`. This is faster, non-interactive, and avoids stdin issues in agent contexts.

## Step 0 — Reuse an existing DXCB setup first (ask before scaffolding)

**Always check for an existing local DXCB project before running any setup.**

1. **Ask the user once:** "Do you already have a DXCB project set up locally?"
   - **If yes → ask for the project path** (the folder containing `tasks.config.json` and
     `src/components/`). Then **skip everything below** and go straight to flow 05 (develop
     the component) inside that path.
   - **If no → proceed with manual scaffold** (steps below).
2. **Validate the provided path** before using it:
   - Confirm `tasks.config.json` exists at the path.
   - Confirm `src/components/` exists.
   - Read `tasks.config.json` and verify `server` matches the **currently connected provider**.
     If it differs, ask whether to update the config or scaffold fresh.
   - If the path is missing either file, tell the user and offer to scaffold a new one.
3. **Only create the new component** in the existing project — do not overwrite config or
   reinstall dependencies unless a build error shows they're missing.

## Steps (fresh scaffold only)

0. **Ask for the target path.** Before creating anything, ask the user where they want the
   DXCB project created. Never assume or pick a path — always ask explicitly.

1. **Ask for Organization and Library names.** These become the component key prefix
   (`Pega_<Library>_<ComponentName>`) and the publish library. Ask once, up front.

2. **Ensure the required Node/npm.** Detect the installed Node version. DXCB 25.1.x requires
   Node 24.4.1+. If missing/incorrect, install or switch via `nvm`.

3. **Create the project structure directly (no interactive CLI).** Write these files:

   ```
   <project-root>/
   ├── package.json            # scripts + dependencies
   ├── tasks.config.json       # DXCB config (server, library, serverType)
   ├── tsconfig.json           # TypeScript config
   └── src/
       └── components/
           └── <ComponentFolder>/
               ├── index.tsx
               └── config.json
   ```

   ### `package.json`
   ```json
   {
     "name": "<project-name>",
     "version": "1.0.0",
     "description": "<description>",
     "scripts": {
       "buildComponent": "node node_modules/@pega/custom-dx-components/bin/index.js buildComponent",
       "publish": "node node_modules/@pega/custom-dx-components/bin/index.js publish",
       "authenticate": "node node_modules/@pega/custom-dx-components/bin/index.js authenticate",
       "lint": "eslint src --ext .ts,.tsx --quiet"
     },
     "dependencies": {
       "@pega/custom-dx-components": "~25.1"
     },
     "devDependencies": {
       "@pega/cosmos-react-core": "~9.20.0",
       "@types/react": "^18.2.0",
       "react": "^18.2.0",
       "typescript": "^5.3.0"
     }
   }
   ```

   ### `tasks.config.json`
   ```json
   {
     "components-directory-path": "src/components",
     "server-config": {
       "rulesetName": "<Library>Lib",
       "rulesetVersion": "01-01-01",
       "sourceOfComponents": "Server",
       "devBuild": false,
       "devServerPort": "3030",
       "serverType": "launchpad",
       "server": "<frontend-url>",
       "clientId": "",
       "clientSecret": "",
       "grantType": "authCode",
       "redirectUri": "https://localhost:4010/",
       "authService": "pega"
     },
     "component": {
       "library": "<Library>",
       "type": "",
       "version": "1.0.0",
       "subtype": "",
       "description": "",
       "icon": ""
     },
     "usePromotedWebPack": false,
     "libraryModeCL": false,
     "showDebug": false
   }
   ```

   ### `tsconfig.json`
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "jsx": "react",
       "moduleResolution": "node",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "declaration": true,
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

4. **Install dependencies** — `npm install`. No interactive prompts needed.

5. **Verify TypeScript compiles** — run `npx tsc --noEmit` to catch type errors before
   attempting the DXCB build.

## Build approach — programmatic only (no interactive CLI)

The DXCB interactive CLI (`npm run buildComponent`) uses `inquirer` prompts that block on
stdin and cannot be reliably automated. **Never use the interactive CLI for building.**

Instead, use the **programmatic build** described in `references/flow/07-build-publish.md`:
```js
import { bundleComponent } from "@pega/custom-dx-components/src/tasks/bundle/index.js";
await bundleComponent("<ComponentKey>", false, false); // key, sourceMap, devBuild
```

If the programmatic import fails (e.g. path changes across DXCB versions), fall back to
telling the user to run `npm run buildComponent` manually in their terminal and answer the
prompts themselves.

## Guardrails

- **Never run `npx @pega/custom-dx-components init`.** It is fully interactive and cannot be
  reliably automated in agent/CI contexts. Scaffold manually instead.
- **Never run `npm run buildComponent` or `npm run publish` from the agent.** These use
  `inquirer` prompts that hang on blocked stdin. Use the programmatic build + `assetsUpdate`
  service path, or tell the user to run them manually.
- **Prefer reuse over scaffolding.** Always ask whether a project exists first.
- **Always ask for the target path** before creating anything.
- **Always ask for Org and Library names** — never assume them.
- Pin the resolved DXCB and Node versions for reproducibility.
