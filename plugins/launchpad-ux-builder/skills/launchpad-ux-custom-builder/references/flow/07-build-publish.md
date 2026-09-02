# Flow 07 — Build and publish (programmatic only, no interactive CLI)

Goal: compile the component and publish it to the provider, **reusing the OAuth access token
captured at login (flow 01)** as the publish credential (`Authorization: Bearer <access_token>`).
**The DXCB interactive CLI is never used, and there is no browser/AAT path.**

## CRITICAL — never use `npm run buildComponent` / `npm run publish` from the agent

The DXCB CLI commands (`buildComponent`, `publish`, `authenticate`) are **interactive** — they
use `inquirer` prompts that block on stdin. In agent/CI contexts:
- Piping input is unreliable (inquirer's list/confirm widgets don't accept piped stdin well).
- The process spins indefinitely on "Select component to build" or similar prompts.

**The agent must ALWAYS use the programmatic path below.** If the programmatic path fails,
tell the user to run the CLI manually in their own terminal — never attempt to automate it.

## CRITICAL — never register a separate OAuth client or ask for a client secret

Publishing **reuses the token already obtained in flow 01** (the browser AAT, or the OAuth
access token from the connected MCP server). It does **NOT** use the DXCB `authenticate` flow.
So the agent must **NEVER**:
- ask the user to create/register a **separate OAuth client** for publishing,
- ask for a **Client Secret** or mention a **Confidential** client type,
- reference the DXCB CLI redirect (`https://localhost:4010/`), PKCE registration, or grant type,
- run `npm run authenticate` / the DXCB `authenticate` task.

If you catch yourself about to ask for a client secret or a new registration, **STOP** — the
publish credential is the SAME token from your existing connection. Read it fresh (Step 3) and
POST it (Step 4). The only thing you may ask the user for is to re-run `opencode mcp auth
<name>` **if** the existing token is expired and can't be refreshed.

**Copilot CLI equivalent:** instead of `opencode mcp auth`, read the SAME token from the macOS
Keychain (`copilot-mcp-oauth`, Step 3) — the user clicks **“Always Allow”** once so future reads
are silent. This is still reusing your existing connection's token — NOT a separate/confidential
client, NOT a secret, NOT the DXCB `authenticate` task.



## Steps

0. **PRECONDITION — mock confirmed.** Do not start this flow until the flow-06 SVG mock has
   been rendered, opened in the browser, and the user has confirmed the look and feel.

### Runtime readiness preflight — check the app CSP

Before building or requesting publish approval, verify whether the app uses the **default
Content Security Policy** in App Settings. A component can build and publish successfully yet
fail to load in the browser at runtime when the default policy is active.

1. If Authoring MCP exposes an app-setting tool or an authoritative rule containing the CSP
  selection, read it and report the result.
2. Do not guess a rule type, infer the value from an empty MCP result, or treat an unrelated
  CSP rule as the app's active setting.
3. If MCP cannot return the active setting, ask the developer to check **App Settings → Content
  Security Policy** and confirm that the app is not using the default policy before publish.
4. If the default policy is active, clearly warn that it may prevent the custom component from
  loading at runtime, then continue the normal build and publish flow. This is informational
  and must not become a publish gate.

This check is separate from `devBuild=false`: a development bundle can fail because it uses
`eval`, while an app-level default CSP can block a production bundle at runtime.

### Step 1 — Build (production) programmatically

From the DXCB project root, call the DXCB library build function directly:

```js
node --input-type=module -e '
import path from "path";
const PKG = path.resolve("node_modules/@pega/custom-dx-components/src");
const { default: bundleComponent } = await import(path.join(PKG,"tasks/bundle/index.js"));
await bundleComponent("<ComponentKey>", false, false); // (key, sourceMap=false, devBuild=false)
'
```

- `devBuild=false` is **mandatory** — dev builds use webpack `eval` which is blocked by
  Launchpad CSP.
- If this import path fails (DXCB version differences), try alternative paths:
  - `tasks/build-comp/index.js`
  - Check `node_modules/@pega/custom-dx-components/src/tasks/` for the actual module names.
- If programmatic build fails entirely, tell the user: "Please run `npm run buildComponent`
  in your terminal, select the component, and answer `N` to development build."

### Step 2 — Zip to base64

```js
const { zipComponent } = await import(path.join(PKG, "tasks/publish/helper.js"));
const { zipContent, configContent } = await zipComponent("<ComponentKey>");
```

`zipContent` is the base64-encoded zip the service expects.

### Step 3 — Get the publish credential + resolve write isolation

The publish credential is the **OAuth access token from the connected MCP server** (flow 01) —
there is no browser/AAT path. There is **no** `~/.pega_studio_session` file — the coding
assistant stores the OAuth token instead. **This is the common cause of a false "all sessions
expired" at publish: you're looking in the wrong place.** For opencode, read
`~/.local/share/opencode/mcp-auth.json`, find the entry for the server (e.g.
`lp-<provider>`), and extract its **access token** (field `access`, or
`tokens.accessToken` depending on version) → `Authorization: Bearer <access_token>`. opencode
keeps this token refreshed while the MCP server is connected, so **read it fresh at publish
time** (don't cache an earlier value). Only if the stored token is truly expired and can't be
refreshed, ask the user to re-run `opencode mcp auth <name>`.

**For Copilot CLI, the token lives in the macOS Keychain** (service `copilot-mcp-oauth`), not a
file. **BEFORE you run the read, present this heads-up to the user verbatim** so the Keychain
dialog isn't confusing:
> 🔐 One-time macOS Keychain step (first publish only): a system dialog will pop up — *“security
> wants to use your confidential information stored in ‘copilot-mcp-oauth’ in your keychain”*.
> • If it asks for a password, type your **Mac login password** — the same one you use to unlock
>   your laptop. It is **NOT** a Pega / Copilot / Launchpad password.
> • Click **“Always Allow”** (not “Allow”, not “Deny”) so every future publish is silent.
> You only need to do this once.

Then read the token and pipe it **straight into the `Authorization: Bearer` header — never print
or echo the token**:
```bash
# read the item's account hash (metadata only), then read the secret inline
ACCT=$(security find-generic-password -s copilot-mcp-oauth 2>/dev/null | awk -F\" '/"acct"/{print $2}')
TOKEN=$(security find-generic-password -s copilot-mcp-oauth -a "$ACCT" -w)   # macOS prompts on FIRST read
```
After the user clicks **“Always Allow”**, `security` is authorized on the item's ACL, so **every
later publish reads it silently** — no prompt, no re-login — reusing the same MCP token Copilot
keeps refreshed. **Applies to Copilot CLI only — the opencode instructions above are unchanged.**

Decode the JWT access token to resolve the publish isolation. **The isolation is the token's
`tenant_id`** — there is exactly one tenant per token, and that tenant IS the isolation the
`assetsUpdate` endpoint expects. Do **NOT** use `isolation-id` or `isolation-ids.write[0]`: on a
cluster with multiple isolations those can point at a **different** isolation and publish to the
wrong app.
```js
const tok = accessToken;
const claims = JSON.parse(
  Buffer.from(tok.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"), "base64").toString()
);
const iso = claims["tenant_id"];                 // the single tenant = the publish isolation
if (!iso) throw new Error("No tenant_id in token — cannot resolve publish isolation");
// sanity: confirm the token can write this tenant — do NOT fall back to another isolation
const writes = (claims["isolation-ids"] || {}).write || [];
if (writes.length && !writes.includes(iso)) {
  throw new Error(`Token has no write access to tenant ${iso}`);
}
```

Check `claims.exp` — if expired: re-read the refreshed token from the assistant's store, or
re-run `opencode mcp auth <name>`.

### Step 4 — Get the user's publish go-ahead (HARD GATE), then POST to `assetsUpdate`

**Before publishing, get explicit consent.** The design-mock approval (flow 06) confirmed the
**look and feel** — it is **not** permission to write to the provider. Publishing modifies the
user's Launchpad app, so first present a one-line summary and ask for a clear go-ahead:

> Ready to publish **<ComponentKey>** (<type>) to **<app>** (isolation `<tenant_id>`). Shall I publish now?

**Do not POST until the user confirms.** If they decline or want changes, stop and iterate.

Once confirmed, use the OAuth access token as `Authorization: Bearer <access_token>`.

```
POST {frontendServer}/pegalaunchpad/c11n/isolations/{iso}/v102/assetsUpdate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "type": "CustomComponent",
  "zipContent": "{base64}",
  "componentName": "{componentKey}",
  "pxUpdateDateTime": "",
  "environmentID": "{iso}"
}
```

- `{frontendServer}` is the app's frontend URL (derived from the MCP/Studio URL host).
- **`201 Created`** with `"<ComponentKey> has been saved!!!"` = success.
- Never print the token value.
- If direct fetch fails with a network error, retry through corporate proxy with undici
  `ProxyAgent`.

### Step 5 — Report the result and offer ongoing support

- Confirm success and tell the user where the component appears in Studio:
  - Widget → Widget picker (Portal or Case/Utilities).
  - Template → View layout picker (Details/Form/Page).
  - Field → The field's **Display as** options.
- **Print a "Launchpad reuse & provenance summary"** (leadership assurance that Pega Launchpad
  assets were used before anything new). Include, concisely:
  - **OOTB first:** the OOTB view/template or UX Booster that was checked and why it couldn't
    meet the need (why a custom component was justified at all).
  - **Grounded in:** the exact `master`-branch gallery component it was adapted from
    (e.g. `Pega_Extensions_StarRatingInput`) — the source-of-truth pattern, not invented.
  - **Docs consulted:** `LAUNCHPAD_VS_PLATFORM.md` + `Component_Build_Guide.md` (confirm both
    were read to keep the code Launchpad-safe).
  - **Cosmos components used:** list the `@pega/cosmos-react-core` components (e.g. `Input`,
    `Flex`, `FormField`, `Button`).
  - **PConnect/PCore APIs used:** fields (`getStateProps().value`, `updateFieldValue`),
    data (`getDataApiUtils().getData` / `getDataPageUtils`), navigation (`getActionsApi`,
    `getSemanticUrlUtils`), name mapping (`getMappedKey`).
  - **New/custom code:** exactly what (if anything) was written from scratch and the reason no
    Cosmos/PConnect/PCore equivalent existed — kept minimal.
  - One-line takeaway: "Reused Launchpad/Cosmos assets first; custom code only where no
    platform asset fit."
- **Hand over the targeted debug guide** (from flow 05 Step 7): the symptom → first-check table
  for THIS component, and how to toggle the built-in debug logger (flip `DEBUG` / the `debug`
  config property) to trace the data-page name, namespace, and response keys in the browser
  console. This lets the developer self-diagnose the first test **without** another publish.
- Offer a live in-app preview to verify placement.
- **Always tell the user they can report issues back.** After publishing, explicitly say:
  "If you see any issues (wrong data, layout problems, console errors, or it doesn't render),
  report back and I'll diagnose, fix the code, rebuild, and republish for you — no CLI needed
  on your end." This closes the feedback loop and ensures the user knows the agent can iterate
  without them needing to manually run commands.

## Manual fallback (user runs in their terminal)

If the programmatic path fails, instruct the user to run these commands themselves:

```bash
cd <project-path>
nvm use 24
npm run buildComponent
# Answer: select the component, then N for development build
npm run publish
# Answer: select the component, then N for development build
```

The agent should NOT attempt to run these commands — only provide the instructions.

## Troubleshooting — component published but not working

1. **Ask the user to open browser DevTools Console** — most failures surface as console errors.

2. **Check Content Security Policy (CSP):**
   - `Uncaught EvalError: ... 'unsafe-eval'` → published a **dev build**. Republish with
     `devBuild=false`.
   - Other CSP errors → re-check the active **Content Security Policy** in App Settings. If the
     default policy is selected, switch to the supported policy/configuration for custom
     components; do not advise broadly disabling or relaxing CSP directives.

3. **Bust the cache** — hard-refresh (Cmd+Shift+R / Ctrl+F5) after republishing.

## Guardrails

- **Never run interactive DXCB CLI commands from the agent.** They hang on stdin prompts.
- **Always use programmatic build + `assetsUpdate` service** as the primary path.
- **Confirm before publishing** — this changes the provider.
- Never print tokens/secrets.
- `devBuild=false` is mandatory for Launchpad (CSP blocks eval).
