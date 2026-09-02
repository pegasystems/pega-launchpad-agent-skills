# Flow 01 — Connect & authenticate

Goal: connect the agent to the target Launchpad app and obtain a **token** the agent can
reuse for MCP reads and for publishing. Never capture or store the raw password.

## Assistant configuration matrix (authoritative)

The machine-readable source for this matrix is
`references/assistant-mcp-config.json`. Read that file first and use only the entry matching
the detected assistant. Never choose a configuration from a generic MCP example. If the
assistant is ambiguous, ask the user before writing configuration.
The assistant's config key, entry shape, and redirect URI must come from this matrix; do not
mix fields between rows.

| Assistant | Config location and key | Required remote entry | Redirect URI |
|-----------|-------------------------|-----------------------|--------------|
| OpenCode | `opencode.json` -> `mcp` | `type:"remote"`, `url`, `enabled:true`, `oauth:{clientId}` | `http://127.0.0.1:19876/mcp/oauth/callback` |
| VS Code | `.vscode/mcp.json` -> `servers` | `type:"http"`, `url`, `enabled:true`, `oauthClientId` | `http://127.0.0.1:62629/` |
| Copilot CLI | `~/.copilot/mcp-config.json` -> `mcpServers` | `type:"http"`, `url`, `enabled:true`, `oauthClientId` | `http://127.0.0.1:62629/` |
| Claude Code | `.mcp.json` or `~/.claude.json` -> `mcpServers` | `type:"http"`, `url`, `oauth:{clientId,callbackPort:55620}` | `http://localhost:55620/callback` |
| Codex | `~/.codex/config.toml` -> `mcp_servers.<name>` | `url`, `enabled=true`, `oauth.client_id` | `http://127.0.0.1:5555/callback/<id>` |
| Cursor | `.cursor/mcp.json` -> `mcpServers` | `url`, `auth:{CLIENT_ID}` | `cursor://anysphere.cursor-mcp/oauth/callback` |

Before authentication, verify the complete row match: config location, top-level key, server
name, URL, type, enabled value, OAuth client-ID field and nesting, and redirect URI. If any
field does not match, stop and correct it before starting OAuth.

## Step 0 — Connect: app URL first, then self-check (ask Client ID only if needed)

> **STEP 0.0 — IDENTIFY YOUR ASSISTANT FIRST (HARD GATE).** You are running inside a specific
> coding assistant and you know which one you are (e.g. **GitHub Copilot CLI**, **opencode**,
> **Claude Code**, **Cursor**, **Codex**). Everything in this flow — the **MCP config file/key**,
> the **redirect URI**, exact MCP entry shape, and the **auth/restart commands** —
> MUST use **YOUR** assistant's row from the tables below. Many examples here show **opencode**
> (redirect `19876`, `opencode mcp auth`, `opencode --continue`); **do NOT
> copy those unless you ARE opencode.** For **GitHub Copilot CLI**, use: config
> `~/.copilot/mcp-config.json` → `mcpServers`, redirect `http://127.0.0.1:62629/`,
> the exact `mcpServers` wrapper, and the **Copilot CLI restart variant** (relaunch with
> `copilot --continue` — there is **no** `mcp auth` subcommand; Copilot authenticates on launch).
> If you genuinely cannot tell which assistant you are, **ASK the user before configuring** —
> never silently default to opencode.

**One server = one provider** (each provider has its own **isolation/tenant**, i.e. one iso/gw),
and it serves MANY apps via `find_application` — so you rarely need a new server; only a
DIFFERENT provider (different iso/gw) needs one. **Multiple providers can share a cluster**, so
name servers by provider (below). Follow this order and **never re-ask for values already saved
in the config**:

1. **Are Launchpad MCP tools already available** in this session (e.g. `*_find_application` /
   `*_list_rules`)? If **yes**, a connection already exists → **do not ask for a URL or Client
   ID.** **Ask the user for the app name** (never derive it from a URL) and call
   `*_find_application` with it, then go straight to discovery (flow 02).

2. **Otherwise, ask the user for the Studio app URL FIRST** (before asking for a Client ID).
   Derive the environment MCP URL from it — `https://<host>/app/<iso>/<gw>/core-authoring/mcp`
   — and verify it returns **401** (not 404). **Do this SILENTLY: never echo the parsed host,
   iso/gw, or MCP endpoint back to the user — it's internal noise.** Just proceed to the next
   step (or, if you must acknowledge, a simple "Got it" is enough).

3. **Self-check the client config for a server matching this environment** (same URL / same
   iso+gw):
   - **Found and connected** → use it: **ask the user for the app name** and call
     `*_find_application` with it → discovery. **Do NOT ask for a Client ID.**
   - **Found but not authenticated** → give the explicit auth+restart steps below. **Do NOT ask
     for a Client ID (it's already saved).**
     > The server `<name>` is configured. To finish connecting:
     > 1. Press **Ctrl+C** to exit this opencode session.
     > 2. Run: `opencode mcp auth <name>`
     > 3. Complete the login in the browser.
   > 4. Restart **resuming this chat**: run `opencode --continue` (reloads the new server, keeps
   >    our conversation). Plain `opencode` = fresh session with no memory; if you use it,
   >    re-state your request.
   > 5. Then say “continue” (with `--continue`) or re-state your request — I'll pick up the
   >    connected tools automatically.
   - **Not found (no connection for this environment)** → tell the user a connection isn't set
     up yet and **ask for the OAuth Client ID, INCLUDING how to create one.** Do not just ask
     for the ID — present this concise guide (**replace `<REDIRECT_URI>` with the ACTIVE
     assistant's value from the redirect-URI table** — opencode →
     `http://127.0.0.1:19876/mcp/oauth/callback`, Copilot CLI → `http://127.0.0.1:62629/`):
     > I don't have a connection set up for this app yet, so I'll need an **OAuth Client ID**.
     > If you already have one for this environment, paste it. Otherwise create it once in your
     > Launchpad app (takes a minute):
     > 1. In your Launchpad app, click the **9-dot menu → Administration Setup**, then open
     >    **OAuth 2.0 client registrations** and **add a new client registration**.
     > 2. Create the client (any name). Type **Public**, grant type **Authorization Code**,
     >    **Require PKCE = Yes**, and **tick the MCP checkbox** — there is **no client secret**.
     > 3. Add the **redirect URI** `<REDIRECT_URI>`. Tip:
     >    register the other assistants' callbacks too so the same client works everywhere
     >    (see the redirect-URI table / Prerequisites).
     > 4. Save and copy the **Client ID**, then paste it here.
     Then configure the server (name `lp-<provider>` — ask the user for the provider name,
     slugified — with the verified URL) and give the
     **same full auth+restart block from Step 5, verbatim** (Ctrl+C → `opencode mcp auth <name>`
     → browser → `opencode --continue`). This holds even if another app's/environment's server
     already exists and coexists or was disabled — never shorten it to "run `opencode` again".

**Ask for the Client ID only when no server for the environment exists.** Never loop: if the URL
or Client ID were already provided and written to the config, read them — don't re-ask.

## Authentication — OAuth only

Launchpad connections use **OAuth Remote MCP exclusively**. There is no browser-based
`connect_provider` path and no auth-method choice to make. The user creates an OAuth client in
their Launchpad app, provides the **Client ID** (a public PKCE identifier — never a secret),
and the coding assistant handles the token exchange via its local OAuth callback. This applies
to every environment (Production, Pre-production, Trials, Staging, Development).

**Do NOT ask the user to "choose an authentication method."** Ask only for the Studio app URL
and — when no server for the environment exists yet — the OAuth Client ID.

---

## Coding assistant support

The OAuth Remote MCP method is set up **by the agent at runtime**: the skill asks the user for
the app URL and OAuth Client ID, detects the active coding assistant, and writes the remote
MCP entry to that assistant's **native** MCP config using the assistant-specific shape and
OAuth callback (redirect) URI below.

| Coding Assistant | Config location | OAuth callback (redirect) URI |
|-----------------|-----------------|-------------------------------|
| opencode | `opencode.json` → `mcp` | `http://127.0.0.1:19876/mcp/oauth/callback` |
| Copilot (VS Code) | `.vscode/mcp.json` → `servers` | `http://127.0.0.1:62629/` |
| Copilot CLI | `~/.copilot/mcp-config.json` → `mcpServers` | `http://127.0.0.1:62629/` |
| Claude Code | `.mcp.json` / `.claude/mcp.json` → `mcpServers` | `http://localhost:55620/callback` |
| Codex | `~/.codex/config.toml` → `[mcp_servers.*]` | `http://127.0.0.1:5555/callback/<id>` |
| Cursor | `.cursor/mcp.json` → `mcpServers` | `cursor://anysphere.cursor-mcp/oauth/callback` |

> **The redirect URI must be pre-registered on the Launchpad OAuth client.** The agent cannot
> register it server-side. If OAuth fails, tell the user to add the assistant's exact redirect
> URI (above) to the OAuth client's allowed redirect URIs in the Launchpad app.
>
> **NEVER invent a redirect URI.** Use the EXACT value from the table verbatim. For **opencode**
> it is always `http://127.0.0.1:19876/mcp/oauth/callback` — do NOT make up a different port or
> path (e.g. `localhost:8765/callback` is WRONG and causes `redirect_uri mismatch`).

---

## OAuth Remote MCP setup

This uses the coding assistant's native remote MCP with OAuth support. The user creates an
OAuth client in their Launchpad app, provides the Client ID, and the assistant handles the
token exchange via PKCE. No browser-based `connect_provider` and no custom login scripts.

### Prerequisites

The user creates a "Coding Assistant" OAuth client in their Launchpad app **once**:
1. In the Launchpad app, click the **9-dot menu → Administration Setup**, then open
   **OAuth 2.0 client registrations** and **add a new client registration**.
2. Create the client (any descriptive name). Type **Public**, grant type **Authorization Code**,
   **Require PKCE = Yes**, and **select the MCP checkbox**. There is **no client secret**.
3. **Register the redirect URIs up front — add ALL of these in one go.** Registering every
   assistant's callback now means the same client works everywhere and you never hit a
   mid-flow `redirect_uri mismatch`:
   ```
   http://127.0.0.1:19876/mcp/oauth/callback     # opencode
   http://127.0.0.1:62629/                        # Copilot (VS Code + CLI)
   http://localhost:55620/callback                # Claude Code
   http://127.0.0.1:5555/callback/<id>            # Codex (path suffix varies — see Troubleshooting)
   cursor://anysphere.cursor-mcp/oauth/callback   # Cursor
   ```
4. Copy the generated **Client ID**.

### Steps

1. **Ask the user for:**
   - The Studio app URL (to extract the frontend host).
   - The OAuth Client ID they created (the Client ID is a public PKCE identifier, not a
     secret — **never** ask for a Client Secret).

2. **Derive the MCP URL from the Studio app URL — never guess it.** Keep the host + iso + gw
   and replace the rest with `core-authoring/mcp`:
   ```
   Studio: https://<host>/app/<iso>/<gw>/c11n/appauthoring/apps/<app>/branches/<branch>/overview
   MCP:    https://<host>/app/<iso>/<gw>/core-authoring/mcp
   ```
   `/dx/api/application/v2/mcp` is WRONG for authoring/trials apps and 404s — never use it.

3. **Register the server (configure it directly in the assistant's native config — this is the
   primary, reliable path).** Do all of the following:
   a. **Verify the URL first:** POST to the MCP URL; it must return **401** (endpoint exists,
      needs OAuth). If it returns **404**, the URL is wrong — stop and re-derive; do not write.
   b. **Name it after the PROVIDER:** `lp-<provider>` (e.g. `lp-warrantyclaims`) — **ask the
      user for the provider name** and slugify it (lowercase, hyphens). Multiple providers can
      share a cluster and **each provider has its own isolation/tenant**, so the provider name is
      what makes the server unique. That provider's server still serves its many apps via
      `find_application`, so it's one server **per provider**, not per app.
   c. **Dedupe:** if the config already has a server with this same URL, **reuse it** — do not
      add a duplicate.
   d. **Detect the active assistant** (ask if ambiguous) and write the entry using the matching
      template below, merging into any existing config (don't overwrite unrelated entries).

  For Copilot CLI, write the exact full file shape shown below and re-read it before restart.
  The top-level key must be `mcpServers`; do not substitute the VS Code or Codex wrapper.

   **opencode** — `opencode.json` (under `mcp`):
   ```json
   "<server-name>": {
     "type": "remote",
     "url": "<MCP_URL>",
     "enabled": true,
     "oauth": { "clientId": "<CLIENT_ID>" }
   }
   ```

   **Copilot (VS Code)** — `.vscode/mcp.json` (under `servers`):
   ```json
   "<server-name>": {
     "type": "http",
     "url": "<MCP_URL>",
     "enabled": true,
     "oauthClientId": "<CLIENT_ID>"
   }
   ```

   **Copilot CLI** — `~/.copilot/mcp-config.json` (under `mcpServers`) — same shape as VS Code,
   different file/key:
   ```json
   "<server-name>": {
     "type": "http",
     "url": "<MCP_URL>",
     "enabled": true,
     "oauthClientId": "<CLIENT_ID>"
   }
   ```
   > **Copilot CLI key gotcha:** the top-level wrapper key is EXACTLY `mcpServers` (camelCase) —
   > **NOT** `mcp_servers` (that's Codex's TOML style) and **NOT** `servers` (that's VS Code). A
  > wrong key fails with `Failed to read configuration … mcpServers: Required`. Full file shape:
   > `{ "mcpServers": { "<server-name>": { "type":"http", "url":"…", "enabled":true, "oauthClientId":"…" } } }`

   **Claude Code** — `.mcp.json` / `.claude/mcp.json` (under `mcpServers`):
   ```json
   "<server-name>": {
     "type": "http",
     "url": "<MCP_URL>",
     "oauth": { "clientId": "<CLIENT_ID>", "callbackPort": 55620 }
   }
   ```

   **Codex** — `~/.codex/config.toml` (TOML):
   ```toml
   mcp_oauth_callback_port = 5555

   [mcp_servers.<server-name>]
   url = "<MCP_URL>"
   enabled = true

   [mcp_servers.<server-name>.oauth]
   client_id = "<CLIENT_ID>"
   ```

   **Cursor** — `.cursor/mcp.json` (under `mcpServers`):
   ```json
   "<server-name>": {
     "url": "<MCP_URL>",
     "auth": { "CLIENT_ID": "<CLIENT_ID>" }
   }
   ```

   **VERIFY THE FULL CONFIG SHAPE (HARD GATE \u2014 before any `mcp auth`).** The #1 failure is
   putting the Client ID in the wrong place, or any deviation from the exact per-assistant
   template above (wrong/extra/missing key, wrong nesting, or wrong redirect URI): if the assistant can't find it, it attempts
   **Dynamic Client Registration**, which Launchpad rejects (`does not support dynamic client
   registration`) or which triggers a redirect/DCR failure. After writing, **re-read the file**
   and confirm the ENTIRE entry matches the template for that assistant exactly (all keys,
   nesting, types, and the redirect URI shown below):

   | Assistant | File -> key | Exact shape (ALL keys must match) | Redirect URI (must be registered) |
   |-----------|-------------|-----------------------------------|-----------------------------------|
   | opencode | `opencode.json` -> `mcp` | `type:"remote"`, `url`, `enabled:true`, `oauth:{ clientId }` | `http://127.0.0.1:19876/mcp/oauth/callback` |
   | Copilot (VS Code) | `.vscode/mcp.json` -> `servers` | `type:"http"`, `url`, `enabled:true`, `oauthClientId` (top-level, NOT under `oauth`) | `http://127.0.0.1:62629/` |
   | Copilot CLI | `~/.copilot/mcp-config.json` -> `mcpServers` (camelCase — NOT `mcp_servers`/`servers`) | `type:"http"`, `url`, `enabled:true`, `oauthClientId` (top-level, NOT under `oauth`) | `http://127.0.0.1:62629/` |
   | Claude Code | `.mcp.json` -> `mcpServers` | `type:"http"`, `url`, `oauth:{ clientId, callbackPort:55620 }` (no `enabled`) | `http://localhost:55620/callback` |
   | Codex | `~/.codex/config.toml` | top-level `mcp_oauth_callback_port=5555`; `[mcp_servers.<name>]` `url`+`enabled=true`; `[mcp_servers.<name>.oauth]` `client_id` | `http://127.0.0.1:5555/callback/<id>` |
   | Cursor | `.cursor/mcp.json` -> `mcpServers` | `url`, `auth:{ CLIENT_ID }` (NO `type`, NO `oauth`, NO `enabled`) | `cursor://anysphere.cursor-mcp/oauth/callback` |

  If the written field doesn't match, **fix it before proceeding.**
   Note: Copilot/VS Code uses the loopback redirect above; if your VS Code build requires a
   custom-scheme redirect (`vscode://...`), register that exact URI on the OAuth client and use
   it in place of the loopback.
4. **Confirm the redirect URI is registered.** Because all callback URIs were registered up
   front (Prerequisites), this is normally already satisfied. If OAuth later fails with a
   redirect error, add the exact URI for the active assistant and retry.

5. **Give the user explicit auth-and-restart steps** (do not just say "restart"). After the
   config is written, present the EXACT block below **verbatim** — including step 2
   (`opencode mcp auth <name>`) and step 4 (`opencode --continue`). **This is required even when
   a server for a different app/environment already existed** (e.g. you just added a second
   server): a coexisting or newly-disabled server does NOT change these steps. Never emit a
   shortened version like "press Ctrl+C and run `opencode` again" — that drops the `mcp auth`
   step and loses `--continue`, so auth fails or the chat memory is lost. **Do NOT re-ask for
   the URL or Client ID — they're already saved.**
   > The MCP server `<name>` is configured. To finish connecting:
   > 1. Press **Ctrl+C** to exit this opencode session.
   > 2. Run: `opencode mcp auth <name>`
   > 3. Complete the login in the browser that opens.
   > 4. Restart **resuming this chat**: run `opencode --continue` (reloads the new server AND
   >    keeps our conversation). Plain `opencode` starts a fresh session with **no memory** —
   >    if you use it, re-state your request (e.g. “build a component for <app>”).
   > 5. Then say “continue” (only meaningful with `--continue`) or re-state your request — I'll
   >    detect the connected tools and list the app's case types and data types automatically.

   **If the active assistant is Copilot CLI, present THIS block verbatim instead of the opencode
   block above** (config lives in `~/.copilot/mcp-config.json` → `mcpServers`; **there is NO
   `copilot mcp auth` command — Copilot CLI's `mcp` subcommands are only add/get/list/remove, and
   Copilot authenticates on launch. NEVER emit `copilot mcp auth <name>`.**):
   > The MCP server `<name>` is configured. To finish connecting:
   > 1. Press **Ctrl+C** to exit this Copilot session.
   > 2. Run `copilot --continue` (resumes this chat and loads the new server). Plain `copilot`
   >    starts fresh with **no memory** — if you use it, re-state your request.
   > 3. Copilot detects `<name>` and prompts to authenticate — approve it (or type `/mcp`).
   >    Complete the login in the browser that opens (redirect `http://127.0.0.1:62629/`).
   > 4. Then say “continue” or re-state your request — I'll detect the connected tools and list
   >    the app's case types and data types automatically.

   Note: you rarely need to disable another environment's server — different environments
   coexist. Only disable/replace when the SAME environment URL is duplicated.

6. **Verify the connection** — the server should show as connected via OAuth
   (`opencode mcp list`).

7. **Auto-discover the app and list case types/data types** (HARD GATE — do this before asking
   which component):
   - **Ask the user for the app name** — do **NOT** derive the app from the Studio URL (it only
     identifies the environment). Then call `find_application` with that name to resolve the app
     and its **working branch**.
   - List **case types** via rule type `CaseType`, and **data types via rule type `DataObject`**
     (NOT `DataType` — that returns nothing). Scope `search_rules` to the app's working branch
     and namespace; if a list returns only `PegaPlatform` rules you're on the wrong branch —
     query the app's feature/working branch.
   - **Present both lists to the user**, then ask which component to build.

### Token management

- The coding assistant stores and auto-refreshes the OAuth token in its own MCP-auth store
  (location is assistant-specific; consult its documentation).
- For the **publish step** (flow 07), read the access token from the assistant's stored auth
  file and use it as `Authorization: Bearer <token>` on the `assetsUpdate` service call.
  **Copilot CLI exception:** its token lives in the macOS **Keychain** (`copilot-mcp-oauth`), not
  a file — read it with `security find-generic-password` and have the user click **“Always Allow”**
  once (their macOS login password) so later reads are silent. See flow 07 Step 3.

### Mid-session tool availability

Writing the MCP config mid-conversation usually does **not** hot-load the server, so the
`<app-name>_*` tools may be absent in the current session. **Preferred (no reload):**
- Call the remote MCP over raw JSON-RPC via `fetch()` (init → notify → tools/call), using the
  captured OAuth token — this lets the flow continue immediately.
- The `Accept: application/json, text/event-stream` header is required for the Launchpad
  MCP endpoint.
- In a new conversation, the tools are available natively as `<app-name>_find_application`,
  `<app-name>_list_rules`, etc.

### Troubleshooting

- **`redirect_uri mismatch` / `invalid redirect`:** the active assistant's callback URI is not
  registered on the OAuth client. Add the exact URI from the Prerequisites list and retry.
  **Codex** appends a random path segment (e.g. `.../callback/RCVLxGBsohNB`); register the full
  URI it prints on first auth.
- **Tools don't appear after config write:** the client hasn't reloaded MCP. Either start a new
  session, or proceed in-session via JSON-RPC (above).

---

## Security guardrails

- Only the **token** is retained; passwords are entered on the trusted Launchpad page.
- Do not echo tokens or secrets in chat or logs.
- Never capture or store Client Secrets via chat — for the OAuth Remote MCP method, only the
  Client ID is needed (PKCE handles the security).
- Reuse tokens until they expire; then re-authenticate.

## Notes

- If MCP is already configured with a service/machine token, this step can be fully
  headless — prefer that when available.
- The OAuth Remote MCP path works without the local `launchpad-ux` stdio MCP server — it
  connects directly to the Launchpad app's built-in MCP endpoint.
