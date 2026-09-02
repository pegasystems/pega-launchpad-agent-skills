---
name: launchpad-ux-custom-builder
description: Use this skill for natural requests such as "Build a custom UX component for my Launchpad app", "Create a custom field, widget, or layout template", or "Design and publish a Launchpad component". The skill connects to the Launchpad app, reads its case/data model and theme through MCP, recommends the best UX, generates a theme-accurate SVG mock, and builds and publishes the approved component without requiring the developer to run DXCB setup manually.
license: Apache-2.0
compatibility: Requires an MCP-capable coding assistant, access to a Pega Launchpad environment, Node.js, npm, and network access for DXCB dependencies and publishing.
---

## Overview

`launchpad-ux-custom-builder` is a self-contained orchestration skill that owns the
**entire Custom UX lifecycle** for Pega Launchpad, from a natural-language request to a
published Constellation DX (DXCB) component. It removes the manual DXCB setup burden
(init, `tasks.config.json`, authenticate, build, publish) and replaces it with a guided,
agent-driven flow.

## Interaction contract — SILENT OPERATION (no unsolicited prompts)

**The agent runs the entire flow autonomously and interrupts the user ONLY at the
designated input points below. Never insert confirmations, permission asks, "Allow?",
"Shall I proceed?", "Do you want me to continue?", or clarifying questions between steps.**

**MCP configuration hard gate:** Read `references/assistant-mcp-config.json` first. Never
choose a configuration from a generic MCP example. Use only the entry matching the detected
assistant. If the active assistant is ambiguous, ask the user before writing configuration.
Verify the complete entry (file, key, entry shape, OAuth client-ID placement, and redirect
URI) before authentication.

The only permitted interruptions are:

0. **Connect: app URL first, then self-check (ask Client ID only if needed).** A Launchpad MCP server
   maps to one **provider** (its own isolation/tenant, i.e. one iso/gw) and exposes **many apps**
   via `find_application`; **multiple providers can share a cluster** — so name the server by
   provider and never create a new server per app. **Ask for the Studio app URL FIRST**; derive + verify the
   environment URL **silently** (never echo the parsed host / iso / gw / MCP endpoint back to
   the user — it's internal noise); self-check for a matching server; **ask for the Client ID
   ONLY if no server for that environment exists.** Steps:
   - If Launchpad MCP tools are already available, **use them**: **ask the user for the app
     name** (never derive it from the URL) and call `*_find_application` with it to locate the
     app, then go straight to discovery. **Skip interruptions 1–2.** ("Wrong app connected" is
     usually the same environment — just `find_application` the right one.)
   - If a server for the target environment is configured but unauthenticated → give the user
     the **explicit** steps (never just “restart”): **Ctrl+C** to exit opencode → run
     `opencode mcp auth <name>` → log in in the browser → relaunch **resuming this chat** with
     `opencode --continue` (plain `opencode` loses history — then re-state the request) → say
     “continue”. **Do NOT re-ask for URL/Client ID (already saved).**
   - Only if **no server for the target environment** exists do interruptions 1–2 apply. When
     asking for the Client ID, **also tell the user how to create one**: in the Launchpad app,
     **9-dot menu → Administration Setup → OAuth 2.0 client registrations → add a new
     registration**; type **Public**, grant **Authorization Code**, **Require PKCE = Yes**,
     **tick the MCP checkbox**, no secret; register the redirect URI
     `http://127.0.0.1:19876/mcp/oauth/callback` for opencode — don't just ask for the ID. A
    new server is needed **only for a different environment** (different iso/gw). Reuse an
    existing server with the same URL instead of creating a duplicate.
   See `references/flow/01-connect-auth.md` **Step 0**. **Never re-ask for values already in the
   config — that causes the re-prompt loop.**

1. **OAuth is the only auth method** — handled once at the start, **only when the precheck (0)
   finds no existing connection or configured server.** **Never ask the user to choose an
   authentication type and never offer browser-based login** — OAuth Remote MCP is the sole path
   for every environment (Production, Pre-production, Trials, Staging, Development).
   See `references/flow/01-connect-auth.md`.
2. **App URL + OAuth Client ID (only if needed)** — ask for the Studio app URL once (skipped if
   cached); ask for the OAuth Client ID only when no server for that environment exists. Then
   configure the remote MCP server and authenticate.
3. **OAuth consent** — the user completes the OAuth login/consent in the browser opened by the
   assistant's MCP auth (`opencode mcp auth <name>`). This is a user action, not an agent prompt.
4. **Connection confirmation + component selection** — as soon as the MCP connection
   succeeds, **notify the user that the connection was successful**, **auto-list the app's
   case types and data types** (no need to be asked), and then — **with 2–4 concrete component
   suggestions grounded in that data (not an open question)** — **ask which component the user
   wants to build**. This is the main design input. **HARD RULE: never ask "what do you want to
   build?" before the case types + data objects have been listed** — not right after the URL,
   not before connecting. If the user volunteers a component idea early, acknowledge it but
   still connect and show the lists first, then confirm the component against that data. See
   `references/flow/02-discover-mcp.md`.
4. **One design approval on an SVG mock opened in the browser** — before building **or**
   publishing, author a **theme-accurate SVG** of the component, write it to a temp location
   (OS temp dir, not the project), and **immediately open it in the user's default browser**
   using the system `open` command (macOS) or equivalent (`xdg-open` on Linux, `start` on
   Windows). This is **mandatory** — the agent must always run `open <path>` on the SVG file
   so the user can see the rendered mock in a real browser window. Then ask for their
   explicit look-and-feel confirmation in the chat. This is a HARD GATE: do not build or
   publish until the user confirms. A textual description does NOT satisfy this gate — the
   user must see the rendered SVG in their browser. Use **SVG only** — never install or
   invoke Playwright, Chromium, or Storybook to *generate* the mock (opening the finished
   SVG in the default browser is fine and required). The mock is **ephemeral**: delete it
   after confirmation — never save mock artifacts in the DXCB project or the workspace. Ask
   this exactly once. See `references/flow/06-theme-screenshot.md`.
5. **Publish go-ahead (explicit consent before publishing to the provider).** The design
   approval above confirms the **look and feel** — it is **not** permission to publish. After
   the component is built, present a one-line summary (component name/type + target app /
   environment) and **ask for explicit confirmation before publishing**. Publishing **writes to
   the user's Launchpad app**, so **never publish without this go-ahead.** See
   `references/flow/07-build-publish.md` (Step 4).
5. **Existing DXCB setup?** — before scaffolding a new DXCB project, ask once whether the
   user already has a DXCB project set up locally. If yes, ask for its path and create the
   new component inside it (skip install/init). If no, **ask the user for the target path
   where the new DXCB project should be created** — never assume or invent a path. Then
   scaffold the fresh project at that exact location silently.
   See `references/flow/04-scaffold-dxcb.md` (Step 0).
6. **A genuine blocker** — only when the flow cannot proceed without input (e.g. no cached
   provider and no URL, a preview URL that must be replaced, an unrecoverable auth/network
   error). State the problem and the single needed input in one message.

**CRITICAL — never use the DXCB interactive CLI from the agent.** `npm run buildComponent`,
`publish`, and `authenticate` are interactive (use `inquirer` prompts that block on stdin).
They cannot be reliably automated and will hang indefinitely. The agent must always use the
**programmatic build** (`bundleComponent()`) and **`assetsUpdate` service** for publishing.
If the programmatic path fails, instruct the user to run the CLI manually in their own
terminal — never attempt to run it from the agent. See `references/flow/07-build-publish.md`.

Everything else — installing/detecting DXCB, MCP discovery, reading the theme, generating
code, building, authenticating with a cached/refreshed token, publishing after the single
approval — happens **in the background with no further prompts**. Batch work; do not
narrate step-by-step or request approval to run tools/commands. Pre-approve the plugin's
own MCP tools and scripts so no per-call "Allow" dialog is needed. If something needs the
user's attention, finish silently and report the result (or surface exactly one blocker).

## How it works

The agent must be **grounded in the live Launchpad application**: before recommending or
generating anything, it reads the connected app's case/data classes, field types,
relationships, existing views, and the active **theme** through the MCP rulebase channel.
It then designs a component that fits the real data and matches the app's branding.

## When to use this skill

Use this skill when the user wants to:

- Create a **custom UX component** (Field, Widget, or Layout Template) for a Launchpad app.
- Add a component at **case level** (case details / utilities / form) or **portal/landing level**.
- Have the agent **read the app's structure** and recommend the best-fit component.
- See a **visual preview** of the component (theme-accurate) before publishing.
- **Publish** the component to the provider without manual DXCB commands.

Do NOT use this skill for pure low-code configuration that out-of-the-box Constellation
components already satisfy — first confirm an OOTB view/template or a UX Booster
(https://launchpad.io/ux-boosters) cannot meet the need.

## Two-layer Launchpad knowledge model

The agent's understanding of Launchpad comes from two layers. **Always prefer live data.**

1. **Live grounding (source of truth).** Query the connected rulebase via MCP first
   (`getAppInfo`, `list_rules_by_query`, resolve rules). Read the actual case types, data
   objects, fields, relationships, views, and theme. See
   `references/knowledge/mcp-rulebase-queries.md`.
2. **Curated knowledge modules (interpretation).** Use the bundled references to interpret
   what was read and make good design decisions:
   - `references/knowledge/launchpad-data-model.md` — classes, field types, relationships.
   - `references/knowledge/launchpad-theme.md` — theme tokens → screenshot styling.
   - `references/knowledge/launchpad-views-ui-rules.md` — views, templates, placement.
   - `references/knowledge/constellation-gallery.md` — **source of truth for component
     code**: browse the Constellation UI Gallery `master` branch, pick the closest example,
     and adapt it (never invent structure/data-binding). Includes the
     `config.json.properties`-as-requirements-checklist method.
   - `references/knowledge/pcore-pconnect-apis.md` — PConnect/PCore APIs: reading/writing
     case **fields** reactively, refreshing views, data pages, pub/sub, events.
   - `references/knowledge/frontend-packages.md` — Cosmos-first package priority order.
   - `references/knowledge/proxy-and-controlled-auth.md` — no-`node_modules`-edits policy;
     controlled authenticate script (`useNodeFetch:false`) and publish-through-proxy preload
     (`lp-proxy-preload.mjs`) for corporate/proxied networks.

**Extensibility:** when a new Launchpad concept is needed, add a new module under
`references/knowledge/` and index it here. Keep every module self-contained.

## The end-to-end flow (5 tasks)

Follow these tasks in order. Each maps to detailed references under `references/flow/`.
Limit user interaction to the designated connection, component selection, project location,
design approval, and publish approval gates; everything else runs silently in the background.

1. **Connect & authenticate** (`references/flow/01-connect-auth.md`)
   - **IDENTIFY YOUR ASSISTANT FIRST (HARD GATE).** You know which coding assistant you are
     (e.g. **GitHub Copilot CLI**, **opencode**, Claude Code, Cursor, Codex). Use **YOUR**
    assistant's MCP config location, redirect URI, entry shape, and auth/restart commands
    from flow 01's tables. Examples often show **opencode** (redirect
    `19876`, `opencode mcp auth`) — **do NOT copy them unless you ARE
     opencode.** Copilot CLI → `~/.copilot/mcp-config.json`, redirect `http://127.0.0.1:62629/`,
    relaunch `copilot --continue` (no `mcp auth` subcommand). The config's
     top-level key is EXACTLY `mcpServers` (camelCase) — NOT `mcp_servers`/`servers`. **For Copilot
    CLI you MUST use the exact `mcpServers` wrapper shown in flow 01 and re-read the file before
    restarting.** If unsure
     which assistant you are, **ask the user** — never default to opencode.
   - **FIRST — reuse an existing connection (prevents re-asking loops).** Before asking
     anything, check state: if Launchpad MCP tools are already available (e.g. a
     `*_find_application` tool), **skip auth and go straight to discovery**. If a Launchpad
     server is already in the client config but not yet connected, tell the user **once** to
     run `opencode mcp auth <name>` and start a new session — **never re-ask for the URL or
     Client ID; they're already saved in the config.** See flow 01 **Step 0**.
   - **OAuth Remote MCP is the only authentication method** — never ask the user to choose one
     and never offer browser-based login. Ask for the Studio app URL and (only when no server
     for the environment exists) the OAuth Client ID, then
     **configure the server directly** in the detected assistant's native config (this manual
     path is primary and reliable): (1) derive the MCP URL as
     `https://<host>/app/<iso>/<gw>/core-authoring/mcp` from the Studio URL — never guess,
     never `/dx/api/...`; (2) **verify it returns 401** (POST) — a 404 means wrong URL, stop;
     (3) name it after the PROVIDER `lp-<provider>` (**ask the user for the provider name**,
     slugified) — multiple providers can share a cluster and each has its own isolation/tenant;
     one provider's server still serves its many apps via `find_application`; (4) reuse an
    existing server with the same URL instead of duplicating. **VERIFY the ENTIRE entry matches
    the assistant's template
     exactly before `mcp auth`** — not just the Client ID, but every key, its nesting, and the
     redirect URI (opencode `{type:"remote",url,enabled:true,oauth:{clientId}}`; Copilot
     `{type:"http",url,enabled:true,oauthClientId}` top-level; Claude
     `{type:"http",url,oauth:{clientId,callbackPort:55620}}`; Codex `[mcp_servers.<name>.oauth]
     client_id` + top-level `mcp_oauth_callback_port`; Cursor `{url,auth:{CLIENT_ID}}`). Any
     wrong/extra/missing key or wrong nesting makes the client attempt Dynamic Client
     Registration, which Launchpad rejects. Confirm the redirect URI is registered, then trigger
     the assistant's MCP-auth (reload if needed). **The redirect URI is fixed per assistant — for
     opencode it is EXACTLY `http://127.0.0.1:19876/mcp/oauth/callback`; never invent a port or
    path.** After writing a new server, ALWAYS give the full auth+restart block verbatim
    (flow 01 Step 5):
     Ctrl+C → `opencode mcp auth <name>` → browser login → `opencode --continue` → say
     “continue”. This is required even when another app's server already exists (coexisting or
     disabled) — never shorten it to “press Ctrl+C and run `opencode` again”, which drops the
     `mcp auth` step and loses `--continue`.** **Copilot CLI restart is DIFFERENT — there is NO
     `copilot mcp auth` (its `mcp` subcommands are only add/get/list/remove).** For Copilot CLI
     give: Ctrl+C → relaunch `copilot --continue` → Copilot detects the server and prompts to
     authenticate (approve, or type `/mcp`) → browser login → say “continue”. **Never emit
     `copilot mcp auth <name>` — that command does not exist.** After connecting, **ask the user for the app name**
     (never derive it from the URL) and call `find_application` with it to select the app. See
     `references/flow/01-connect-auth.md`.
   - **When you must ask for the Client ID, INCLUDE how to create it — never just say "create a
     client ID".** Give these exact steps: in the Launchpad app, **9-dot menu → Administration
     Setup → OAuth 2.0 client registrations → add a new registration**; Type **Public**, grant
     **Authorization Code**, **Require PKCE = Yes**, **tick the MCP checkbox**, **no client
     secret**; register **YOUR assistant's redirect URI** (Copilot CLI: `http://127.0.0.1:62629/`;
     opencode: `http://127.0.0.1:19876/mcp/oauth/callback`); then Save and copy the **Client ID**.
   - Auto-configure based on the detected coding assistant (Copilot, Claude Code, Cursor,
     Codex, opencode, and other MCP-capable clients).
   - Notify the user when the MCP connection succeeds.

2. **Choose the component** (`references/flow/02-discover-mcp.md` + `03-recommend-ux.md`)
   - **HARD GATE — discover and show BEFORE asking.** As soon as the connection succeeds you
     MUST, in this order:
     1. **Ask the user for the app name** — do **NOT** derive the app from the Studio URL (the
        URL only identifies the environment, which hosts many apps). Then call
        `find_application` with that name to resolve the app and its **working branch**.
     2. **List its case types AND data types** — case types via rule type `CaseType`, **data
        types via rule type `DataObject`** (NOT `DataType`, which returns nothing). Scope
        `search_rules` to the app's working branch + namespace; if you only see `PegaPlatform`
        rules, switch to the app's feature/working branch.
     3. **Present both lists to the user** (case type names + data type names). Do **not** skip
        this and do **not** jump straight to "which component?".
     4. Only after the lists are shown, **suggest 2–4 concrete component ideas grounded in the
        discovered case types / data (each: type + a one-line purpose tied to a real case type or
        field, flagging any OOTB equivalent), then ask the user to pick one or describe their
        own** — never a blind, open "what do you want to build?".
   - Read the fields, relationships, views, and theme rule for the chosen context via MCP.
   - **Build & present the namespace map (source of truth for code).** For every field / data
     page / view / rule the component will use, record its **owner** from the rulebase
     (`PegaPlatform` vs the app namespace) and show it as a table (name | kind | owner | qualify
     with). **Never assume the app namespace** — reference data pages (`CountryList`) and
     inherited fields (`Name`, `BusinessID`) are often platform-owned. Code then qualifies each
     name by its owner: app-owned → `getQualifiedName(name, appNs)`, platform-owned →
     `getMappedKey(name)`. See flow 02 **Step 5a**.
   - Reply in the **same turn** with your **recommended type & subtype + reasoning + the
     next-best alternative's trade-off** (behavior, where it renders, live-vs-saved data, how
     it's placed/found in Studio) — never a blind, open "which type?" question. Let the user
     confirm or override. (Discover + Recommend are merged: no extra round-trip.)
   - **HARD GATE — OOTB Constellation template/widget first.** Before recommending a custom
     component, match the request against the OOTB Constellation catalog (see
     `references/knowledge/launchpad-views-ui-rules.md`). If an OOTB template/widget already
     covers it — e.g. a **"card gallery" → the OOTB Card Gallery template**, table→Table,
     tabs→Tabs, timeline→Timeline — **recommend configuring that OOTB option in Studio and do
     NOT build custom.** Only build a custom DXCB component after the user confirms no OOTB
     option (or UX Booster) meets the need. Never silently hand-build something that exists OOTB
     (Card Gallery is the canonical example).

3. **Set up DXCB** (`references/flow/04-scaffold-dxcb.md`)
   - **Ask once whether a local DXCB project already exists.** If yes, validate its path
     (`tasks.config.json` + `src/components/`, config matches the connected provider) and add
     the new component there. If no, **ask for the target path** and **scaffold manually**
     (create `package.json`, `tasks.config.json`, `tsconfig.json`, `src/components/` directly —
     never run `npx ... init` which is interactive and hangs).
   - Ensure the required Node version (via nvm if needed); install deps via `npm install`.
   - Set `libraryModeCL` to `false` and `serverType` to `launchpad` in `tasks.config.json`.
   - **`isolationID` is not required** — the publish step uses the token's `tenant_id` as the
     isolation (one tenant per token).

4. **Develop + preview** (`references/flow/05-develop-component.md` + `06-theme-screenshot.md`)
   - **Ground the code in the Constellation UI Gallery (`master` branch).** Find the
     closest-matching component at
     `https://github.com/pegasystems/constellation-ui-gallery/tree/master/src/components`, read
     its live `index.tsx` + `config.json`, and adapt its data-binding pattern — do not invent
     structure. Cosmos-first, correct PConnect/PCore field read/write, `withConfiguration`.
     **Do not create Storybook/demo/story files.**
   - **HARD GATE — apply the Launchpad flavor, not Infinity.** Gallery components run in **both**
     Platform (Infinity) and Launchpad; the difference is handled **in code**. After adapting the
     example, convert every Infinity pattern to its Launchpad-safe form (flow 05 Step 3b):
     namespace-qualify names (`getQualifiedName`/`getMappedKey`), fetch via
     `getDataApiUtils().getData` (no Infinity DX REST / raw `fetch`), **guard Platform-only DX
     APIs with `doesRestApiExist`** (no `isLaunchpad` branches), case ID via
     `getConstants().CASE_INFO.CASE_INFO_ID`, navigate via `getActionsApi()`/`getSemanticUrlUtils()`.
     **Never use raw Infinity identifiers** (`pyID`, `pyGUID`, `pzInsKey`, …) as `.pyID` /
     `@P .pyGUID` bindings — wrap them in `getMappedKey`; a record `ID` param uses
     `getMappedKey('ID')`. Leaving Infinity patterns in means the component **won't work in
     Launchpad**.
   - **No hardcoded app names — make everything configurable.** Every application field /
     data-page / view / rule name must be a **configurable `config.json` property** the developer
     sets in Studio (never a string literal in `index.tsx`) — model the gallery **Card Gallery**
     (`dataPage`, `detailsDataPage`, `detailsViewName`). **Give each property clear author helper
     text in its `label`** so the developer knows exactly what to enter. Only Launchpad platform
     ids (`pyID`, …) may appear in code (via `getMappedKey`).
   - Author a **theme-accurate SVG mock** from the discovered fields + theme tokens,
     write it to a temp path, and **immediately open it in the user's default browser**
     (`open` on macOS, `xdg-open` on Linux, `start` on Windows). This is **mandatory** —
     never skip the browser open step. Then delete the file after confirmation. **SVG only —
     no Playwright or install to *generate* the mock.**
   - **HARD GATE — one design approval:** do NOT build or publish until the user has seen the
     rendered mock in their browser and confirmed the look and feel. A textual description
     does not satisfy this gate.
   - **Bake in debugging aids + hand over a targeted debug guide at build time** (flow 05
     Step 7): add a toggleable, guarded debug logger (traces the resolved data-page name, app
     namespace, and response keys in the browser console — never tokens/PII) and give the user
     the symptom → first-check steps for this component, so the **first** publish is diagnosable
     and you avoid publish-test-republish loops.

5. **Build & publish** (`references/flow/07-build-publish.md`)
   - **PRECONDITION — the SVG mock must be shown & approved first (HARD GATE).** Do NOT build or
     publish unless you have already authored the theme-accurate SVG mock, **opened it in the
     user's browser**, and the user approved the look & feel (Task 4). If that hasn't happened,
     **STOP and do the mock first** — a textual description does not satisfy this gate.
   - **Check runtime CSP readiness before publishing.** If Authoring MCP exposes the app's
     Content Security Policy setting, read it and confirm the app is not using the default
     policy. If MCP does not expose an authoritative value, ask the developer to verify this
     in App Settings. Do not infer CSP state from a missing rule or tool response. Warn that a
    component can publish successfully but fail to load at runtime under the default policy.
    This warning is informational and must not block build or publish.
   - On confirmation, **build the production bundle programmatically** (`bundleComponent(key,
     false, false)`), zip it to base64 (`zipComponent`), and **publish via the `assetsUpdate`
     service** — POST the base64 to
     `{frontend}/pegalaunchpad/c11n/isolations/{writeIsolation}/v102/assetsUpdate`, **reusing
     the OAuth access token captured at login** — NOT a new credential:
     `Authorization: Bearer <access_token>`, read fresh from the assistant's MCP token store
     (opencode: `~/.local/share/opencode/mcp-auth.json`; **Copilot CLI: macOS Keychain
     `copilot-mcp-oauth` via `security find-generic-password` — user clicks “Always Allow” once**).
     **Copilot CLI: BEFORE the Keychain read, tell the user a macOS dialog will appear — enter their
     Mac login password (not a Pega/Copilot password) and click “Always Allow”; it's one-time**
     (flow 07 Step 3 has the exact wording).
     **The publish isolation is the token's
     `tenant_id`** (one tenant per token) — do NOT use `isolation-id` / `writes[0]`, which can
     target the wrong isolation on the same cluster.
   - **Get an explicit publish go-ahead BEFORE the POST.** After building, show a one-line
     summary (component + target app/environment) and ask the user to confirm; **do not POST to
     `assetsUpdate` until they say yes.** The design approval is not publish permission.
   - **NEVER ask the user to register a separate OAuth client, provide a Client Secret, or set
     up a Confidential/DXCB `authenticate` client (e.g. redirect `https://localhost:4010/`).**
     The publish credential is the SAME token from the flow-01 connection. If it's expired,
     re-read the refreshed token or ask the user to re-run `opencode mcp auth <name>` — never a
     client secret. **Never use the interactive DXCB CLI** (`npm run publish` /
     `npm run buildComponent` / `npm run authenticate`) from the agent — it hangs on stdin
     prompts. A `201 Created` / `"<Component> has been saved!!!"` is success.
   - If the programmatic path fails, instruct the user to run `npm run buildComponent` and
     `npm run publish` manually in their own terminal.
   - Report the published component and where it appears in Studio.
   - **Print a "Launchpad reuse & provenance summary"** so leadership can see Pega Launchpad
     assets were used before anything new: the OOTB/UX-Booster checked, the `master`-branch
     gallery component it was grounded in, the Cosmos components used, the PConnect/PCore APIs
     used, and exactly what (if any) custom code was written and why no platform asset fit.
     See `references/flow/07-build-publish.md` (Step 5).
   - **If a developer says the published component "doesn't work"**: first ask them to
     **Inspect** the app and read the **Console** for errors, then check the **Content
     Security Policy** app setting (a restrictive CSP silently blocks custom components) and
     confirm a **production build** (`devBuild=false`) was published. See the Troubleshooting
     section in `references/flow/07-build-publish.md`.

## Guardrails

- **Say "Field", never "Property" for Launchpad data elements.** A data element on a case
  type or data object is a **Field**. In every user-facing message, recommendation, question,
  and generated label, call it a "Field" (e.g. "the **Applicant Name field**"), never a
  "property". "Property" is reserved only for internal Constellation/pCore API identifiers
  that literally contain the word (`getConfigProps`, `getStateProps().value`, a `@P .Field`
  property reference) — never for describing the data element to the user. See
  `references/knowledge/launchpad-data-model.md` (Terminology).
- **Never download or run untrusted third-party code.** The only remote install is Pega's
  official first-party DXCB CLI (`@pega/custom-dx-components`), and only as a library
  dependency (`npm install`), into a user-chosen local path.
- **Never run DXCB interactive CLI commands from the agent.** `npm run buildComponent`,
  `npm run publish`, `npm run authenticate`, and `npx @pega/custom-dx-components init` all
  use `inquirer` prompts that block on stdin and will hang indefinitely in agent/CI contexts.
  Always use the programmatic build (`bundleComponent()`) + `assetsUpdate` service path. For
  scaffolding, create the project files directly (no `init`). If programmatic paths fail,
  instruct the user to run the CLI manually — never attempt it from the agent.
- **Never create files unrelated to the task.** Prefer inline commands or the registered
  MCP over stray harness scripts; clean up any temporary files.
- **Never invent a new authentication/connection driver or script.** Connections use **OAuth
  Remote MCP only** — the assistant's native remote-MCP OAuth handles login and token refresh;
  there is no browser-based `connect_provider` and no custom login script. Do NOT create ad-hoc
  "driver" scripts (e.g. `lp-connect-driver.*`) to trigger auth or connection. Before scripting
  anything, check for an existing MCP tool and use that. See
  `references/flow/01-connect-auth.md`.
- **Never capture or store the raw password or client secret.** Only the OAuth token, in
  secure storage. Read any client secret from a hidden terminal prompt — never via chat.
- **Always ground in live app data** before recommending or generating.
- **Publish via the `assetsUpdate` service, reusing the OAuth access token.** The publish
  path builds the production bundle programmatically, zips it to base64, and POSTs it to
  `{frontend}/pegalaunchpad/c11n/isolations/{writeIsolation}/v102/assetsUpdate` with
  `Authorization: Bearer <access_token>` — the same OAuth token from the flow-01 MCP
  connection (read fresh from the assistant's MCP token store, e.g.
  `~/.local/share/opencode/mcp-auth.json`). Do not register a separate client or run a DXCB
  `authenticate`/`publish`; that interactive CLI is only a fallback. Never print the token.
- **Two gates before a component reaches the provider:** (1) the **design approval** on the SVG
  mock (look-and-feel), and (2) an **explicit publish go-ahead** immediately before publishing
  (it writes to the user's app). **Never publish without the go-ahead.** Do not stack redundant
  "are you sure?" prompts beyond these two gates.
- **Never build or publish before the SVG mock is shown and confirmed.** The mock must be a
  **theme-accurate SVG opened in the user's default browser** (run `open` / `xdg-open` /
  `start` on the temp SVG file — this is mandatory, never skip it). Never use
  Playwright/Storybook to *generate* the mock, but always open the result in the browser.
  Written to a temp path and deleted after confirmation (never saved in the project or
  workspace).- **Always recommend the component type with reasoning — never ask blind.** Whenever the
   choice of **Field vs Widget vs Template** (and subtype) comes up, lead with your
   recommended type/subtype, 2–4 concise reasons tied to the request (what it does, where it
   renders, whether it must reflect live in-form edits vs. saved data, and how the author
   places/finds it in Studio), and the trade-off of the next-best alternative. Then let the
   user confirm or override. Do not present an open, unopinionated "which type do you want?"
   question. See `references/flow/03-recommend-ux.md`.
- **Ground component code in the Constellation UI Gallery `master` branch (required, not
   optional).** Before authoring `index.tsx`/`config.json` you MUST (1) find + read the closest
   `master`-branch example at
   `https://github.com/pegasystems/constellation-ui-gallery/tree/master/src/components` and
   adapt its data-binding pattern — never invent runtime wiring from scratch; and (2) read the
   gallery's **`LAUNCHPAD_VS_PLATFORM.md`** and **`Component_Build_Guide.md`**. Write
   Launchpad-safe code (`getMappedKey`, `getData`, `doesRestApiExist`). When debugging runtime
   behavior (e.g. values not updating), diff against the closest gallery component first.
   See `references/knowledge/constellation-gallery.md`.
- **Reuse-first ladder (UI + behavior) — follow in order, never skip ahead to "new":**
  1. **UI:** use an existing `@pega/cosmos-react-core` component → then a **composition** of
     Cosmos components → then custom markup **only** as a last resort.
  2. **Data, state, actions, navigation:** use **PConnect/PCore APIs** — `getStateProps().value`
     / `updateFieldValue` / `triggerFieldChange` (fields), `getDataApiUtils().getData` /
     `getDataPageUtils` (data), `getActionsApi()` + `getSemanticUrlUtils()` (navigation),
     `getNameSpaceUtils().getQualifiedName(name, appNs)` for app rule names and `getMappedKey`
     for Platform ids. **Never** hand-roll `fetch`/REST calls, direct DOM
     manipulation, hand-built URLs, or bespoke state when a PConnect/PCore API exists.
  3. **Only then** introduce something new (custom markup, a third-party lib, novel wiring) —
     and even then, ground it in the closest gallery component and keep it minimal.
  See `references/knowledge/frontend-packages.md` and `references/knowledge/pcore-pconnect-apis.md`.
- **Respect Constellation patterns.** Cosmos components over raw HTML; honor theme,
  accessibility, and responsive rules.
- **Prefer OOTB / UX Boosters** when they satisfy the requirement.
- **Pin versions** (DXCB and Node) so CI builds are reproducible.
- **Namespace-qualify rule names by ownership — never hand-build prefixes.** Determine each
  name's owner from the **MCP rulebase** (the flow-02 namespace map), never assume: app data
  pages / fields / views → `PCore.getNameSpaceUtils().getQualifiedName(name, appNs)` where
  `appNs = PCore.getEnvironmentInfo().getApplicationName().split('__')[0]`. Platform identifiers
  and platform-owned rules (`pyID`, `pxObjClass`, `Worklist`, reference lists like `CountryList`,
  inherited fields like `Name`/`BusinessID`) → `getMappedKey(name)`. **Do NOT use `getMappedKey`
  / `getDefaultQualifiedName` for an app data page or field** — they force `PegaPlatform__`, so it
  404s / returns `undefined`. Never pass bare names, never hand-build `{ns}__` / `{ns}$$`
  prefixes, never add a "namespace" prop. Responses return keys as `{Namespace}__FieldName` (app
  fields → app ns, Platform fields → `PegaPlatform__`); read each with the matching API.

  ```ts
  // WRONG — getMappedKey forces PegaPlatform__, so an APP field returns undefined
  const key = getMappedKey('FreeCapacity');                     // → PegaPlatform__FreeCapacity ✗
  // RIGHT — app-owned field → getQualifiedName with the app namespace
  const appNs = PCore.getEnvironmentInfo().getApplicationName().split('__')[0];
  const key2 = PCore.getNameSpaceUtils().getQualifiedName('FreeCapacity', appNs); // → ProviderManagementApp__FreeCapacity ✓
  // RIGHT — platform-owned rule/id → getMappedKey
  const id = getMappedKey('pyID');                              // → PegaPlatform__BusinessID ✓
  ```
  See `references/knowledge/pcore-pconnect-apis.md` §"Resolving namespaces."

## References index

- Flow: `references/flow/01-connect-auth.md` … `07-build-publish.md`
- Knowledge: `references/knowledge/mcp-rulebase-queries.md`,
  `launchpad-data-model.md`, `launchpad-theme.md`, `launchpad-views-ui-rules.md`,
  `constellation-gallery.md`, `pcore-pconnect-apis.md`, `frontend-packages.md`,
  `proxy-and-controlled-auth.md`
- Assets: `assets/dxcb-scaffold/`, `assets/component-templates/`
- Example: `examples/walkthrough.md`
