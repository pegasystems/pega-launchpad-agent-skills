---
name: launchpad-byoa-mcp
description: 'Set up or troubleshoot a Launchpad authoring MCP connection for a local coding assistant, including Claude Code, OpenCode, Copilot, Cursor, Codex, VS Code, and Kiro. Use for OAuth registration, endpoint selection, client configuration, sign-in, or connection verification. Not for the built-in Launchpad AI Assistant or customer-facing contexts.'
---

# Bring Your Agent: Set Up Launchpad Vibe Coding

Use this procedure to connect a local coding assistant to Launchpad for authoring, or to troubleshoot an existing connection. It is intended for both people and agents; no plugin is required. Installing this skill does not configure MCP.

## Start Here

**For people:** Install this skill using your distribution's installation guide, then follow the applicable steps below for your assistant. The [repository installation guide](https://github.com/pegasystems/pega-launchpad-agent-skills/blob/master/INSTALL.md) is available online even if this skill was installed on its own. Agent instructions such as "Say" and "Ask" describe how the agent should guide you; when working manually, perform the accompanying action yourself. Complete portal registration and browser login personally.

**For agents:** Execute this as an interactive workflow, not as a guide to print in full. Perform authorized local operations yourself and pause for user-dependent actions. Reuse any confirmed harness, workspace, installation status, URL, and client ID. Resume at the first incomplete step; for troubleshooting, inspect the reported failure and relevant existing configuration first. Reading this file does not itself register skills or MCP tools with the harness.

Open the destination workspace in your coding agent and ask:

```text
Use the installed launchpad-byoa-mcp/SKILL.md to guide me through
OAuth registration, MCP endpoint calculation, agent configuration,
authentication, and verification for my Launchpad system.
```

Have your Launchpad application URL (or explicit MCP endpoint for a custom deployment) and access to **Administrator Setup** available. The agent needs permission to read and edit the selected harness's configuration. Shell access helps with validation and authentication, but browser login remains your action. Do not provide passwords, client secrets, or tokens to the agent. In command examples, replace the entire `<placeholder>` with a properly quoted value for your shell; do not enter the angle brackets literally.

If invoked in the built-in Launchpad AI Assistant or a customer-facing context, stop without presenting setup instructions.

## Workflow Rules

1. Identify the **running harness** from reliable session context. A skill stored in `.opencode/skills/` or an installed `opencode` executable does not prove the current agent is OpenCode. If the harness is unknown, ask: "Which agent are you setting up: OpenCode, Kiro CLI, Kiro IDE, or another harness?" If the user explicitly targets a different harness, use that target. Distinguish Kiro CLI from Kiro IDE; do not send CLI-only slash commands to the IDE.
2. Inspect only the selected harness's relevant workspace configuration. Default to workspace scope; do not change global configuration without explicit approval. If multiple config files or conflicting scopes affect the same server, ask which to update rather than creating a competing file. Discover CLI availability and version with the host shell's command lookup and documented help; do not install or upgrade a harness automatically.
3. Use the current workspace by default; if multiple workspace roots make the destination ambiguous, ask which to use. Tell the user which harness, workspace, skills location, and config destination you will use, reusing confirmed decisions without asking again. Show only that harness's instructions at each step. The other harness sections below are reference branches, not a checklist to present together. People reading this file manually should follow only their selected harness's sections.
4. Prompt for one user-dependent step at a time using the harness's question tool if available, otherwise ask in chat and wait. Reuse supplied values and validated existing configuration. Keep step status in the conversation; on resume, check the completed prerequisites rather than restarting. Never invent a client ID, endpoint, callback, or successful result.
5. Once inputs for a local operation are available, perform it with available filesystem, URL-parser, shell, and MCP tools, subject to harness permissions. Explain planned edits before making them. If a capability is unavailable, provide only the exact selected-harness action the user must perform and wait for its result.
6. Never request passwords, client secrets, access tokens, or refresh tokens in chat or question tools. This setup uses a public OAuth client, so no client secret belongs in config. The client ID is not a secret. Let the user complete login and consent in the harness-owned browser flow; do not read or print credential stores or put tokens in commands or files.

### Completion Gates

| Step | User input or action | Agent action | Gate before continuing |
|---|---|---|---|
| 1 (prerequisite) | Install this skill if needed | Follow the distribution's installation guide | This skill and its supporting files are available; discovery limitations reported |
| 2 | Register/reuse a public OAuth client and provide its client ID | Present only the selected harness's verified callback and registration settings | User confirms registration settings and supplies a nonempty client ID; for Codex, finalize its endpoint-specific callback before login |
| 3 | Provide application URL or explicit MCP endpoint, if not already known | Parse the URL and derive or preserve the endpoint | Valid HTTPS endpoint; nonstandard paths confirmed by the user |
| 4 | Resolve config conflicts or approve replacing an existing server, if needed | Merge selected server into the effective config and validate it | Valid syntax and selected-harness configuration accepted, or limitation reported |
| 5 | Complete browser login/consent; reload the session if required | Start supported auth flow, inspect connection status, and verify tool availability | Authenticated connection and Launchpad tools observed, not merely a saved config |

## 1. Prerequisite: Install This Skill

If the skill is already loaded or its installation was confirmed, continue without reinstalling. If installation is missing or incomplete, use the distribution's installation instructions or the [repository installation guide](https://github.com/pegasystems/pega-launchpad-agent-skills/blob/master/INSTALL.md). This skill does not require the other standalone skills to be installed.

## 2. Register an OAuth Client in Launchpad

Start by saying "Step 2 of 5: register an OAuth client for <selected harness>." Ask whether the user already has a public OAuth client for this environment. If so, ask them to confirm the settings below and provide its client ID; do not create a duplicate. Otherwise, guide them through the portal action below, then pause for their client ID and confirmation. Do not assume portal administration is available through MCP before this connection exists.

In the target Launchpad environment, open **Administrator Setup** from the top-left menu, then open **OAuth 2.0 client registrations**, add a registration, and save its client ID.

Configure the registration with:

| Setting | Value |
|---|---|
| Client type | Public |
| MCP Client | Enabled |
| Grant type | Authorization code |
| Require PKCE | Enabled |
| Redirect URLs | Add the exact callback URL(s) required by the agent, using the registration form's format |

Use the callback documented for the target agent:

| Agent | Redirect URL |
|---|---|
| OpenCode | `http://127.0.0.1:19876/mcp/oauth/callback` |
| Claude Code | `http://localhost:55620/callback` |
| GitHub Copilot CLI | `http://127.0.0.1:62629/` |
| Codex | Endpoint-specific; see the Codex note below |
| Cursor desktop | `http://localhost:8787/callback` |
| Cursor web and Cloud Agents | `https://www.cursor.com/agents/mcp/oauth/callback` |
| VS Code | `http://127.0.0.1:33418` and `https://vscode.dev/redirect` |
| AWS Kiro CLI | `http://localhost:8787/callback` |

Present only the row for the selected harness. Verify the callback against available installed-version help or current documentation before asking the user to register it. If it cannot be verified, label it as the guide's expected callback and ask the user to confirm it against their client; do not silently substitute a URL. The source guide notes that Cursor, VS Code, and Kiro were not validated when it was written. Confirm current support with the agent's documentation if using one of these clients.

Corrections from the current agent documentation:

- **Codex:** the callback path can depend on the MCP server URL; do not reuse an example callback from another server. Determine the endpoint in step 3 first, then use the installed client's documented flow to obtain the exact callback. If a client ID is needed before the callback can be determined, use an existing public client or, only if the registration form permits it, create one and update its redirect URL before login. If neither is possible, stop and report the blocker rather than guessing a callback or claiming registration is complete. Use the same callback port during configuration and login.
- **Cursor:** register the URL for the surface being used; register both only when both desktop and web/Cloud Agents will use the registration. See the [Cursor MCP documentation](https://cursor.com/docs/mcp).
- **Kiro:** the configured `redirectUri` is sent exactly as written, and `localhost` and `127.0.0.1` are not interchangeable, so register the identical value.

## 3. Determine the MCP Endpoint URL

Say "Step 3 of 5: determine the MCP endpoint." Reuse an explicitly supplied endpoint or a matching existing server entry, confirming that it belongs to the intended application/environment. Otherwise ask: "What is your Launchpad application URL, or the exact MCP endpoint if your environment uses a custom path?"

Use a standard URL parser, not string replacement. Require an absolute HTTPS URL with a hostname and no embedded credentials. For a standard application URL such as `https://providername.systemname.launchpad.io/c11n/appauthoring/apps?...`, derive `https://providername.systemname.launchpad.io/authoring/mcp` from its origin, discarding the application path, query, and fragment. Derive the standard OAuth metadata URL as `<origin>/.well-known/oauth-authorization-server`.

Preserve the path of an explicitly supplied MCP endpoint, including nonstandard paths such as `/app/.../core-authoring/mcp`; never replace it with `/authoring/mcp`. Ask for an exact endpoint for custom hosts or ambiguous application URLs instead of guessing. Do not carry query strings or fragments from an application URL; if an explicit endpoint includes them, clarify before editing config. Show the computed endpoint briefly and proceed to step 4 when unambiguous. For a nonstandard deployment, confirm the endpoint and metadata URL with the user or trusted deployment documentation.

## 4. Configure the Agent

Say "Step 4 of 5: configure <selected harness>." With the endpoint and client ID from the previous steps, perform the configuration edit yourself when permitted; do not merely hand the user a JSON block. Default the server name to `launchpad`, or reuse the confirmed existing server name for this endpoint. Ask before overwriting an entry that points to a different environment or changing its client ID.

Read the existing effective file before editing and merge only the selected server entry, preserving other servers, settings, comments, and formatting. For JSONC, use a JSONC-aware parser/editor or a narrowly scoped edit; never parse it as strict JSON or rewrite the whole file to remove comments. Create missing workspace directories/files only for the selected destination. Validate the resulting syntax with a format-aware parser and, where available, the installed harness's schema or config-loading check before authentication. An HTTP 401 before login is not evidence of a bad endpoint. Do not change global config, delete credentials, or disable unrelated servers to make this check pass.

### OpenCode

Use the existing effective workspace `opencode.json` or `opencode.jsonc`; if none exists, create `opencode.json` at the project root. Honor an existing explicitly selected config path rather than moving it. Add the entry under `mcp`:

```json
{
   "mcp": {
      "launchpad": {
         "type": "remote",
         "url": "<Launchpad MCP endpoint>",
         "enabled": true,
         "oauth": {
            "clientId": "<OAuth client ID>",
            "redirectUri": "http://127.0.0.1:19876/mcp/oauth/callback",
            "auth_server_metadata_url": "https://providername.systemname.launchpad.io/.well-known/oauth-authorization-server"
         }
      }
   }
}
```

The source guide specifies `oauth.auth_server_metadata_url` as a Launchpad workaround. Preserve this requirement, using the metadata URL from step 3, but verify installed-version support before editing: the public [OpenCode MCP documentation](https://opencode.ai/docs/mcp-servers/) does not document this field or `redirectUri`. If support cannot be verified or the installed build rejects them, stop and report the compatibility blocker; do not silently remove the workaround or claim this template works on every OpenCode version. Authenticate only in step 5.

### GitHub Copilot CLI

Add the server to `~/.copilot/mcp-config.json` (or `$COPILOT_HOME/mcp-config.json`), or to `.mcp.json` / `.github/mcp.json` in the project (project files load only after the folder is trusted). The `.github/copilot-mcp.json` and `~/.config/github-copilot/mcp.json` paths in the source guide are not documented by current Copilot CLI. Remote servers require `type` (`http` or `sse`), `url`, and `tools`; the static OAuth client ID is `oauthClientId`:

```json
{
   "mcpServers": {
      "launchpad": {
         "type": "http",
         "url": "<Launchpad MCP endpoint>",
         "tools": ["*"],
         "oauthClientId": "<OAuth client ID>"
      }
   }
}
```

`copilot mcp add --transport http launchpad <Launchpad MCP endpoint>` creates the entry in the user config, but it has no option for the client ID, so add `oauthClientId` to the file afterward. Copilot CLI documents no setting for the OAuth redirect URI; the callback in Section 2 (`http://127.0.0.1:62629/`) must match what the installed CLI uses.

### AWS Kiro CLI

Add the server under `mcpServers` in `.kiro/settings/mcp.json` (workspace) or `~/.kiro/settings/mcp.json` (user):

```json
{
   "mcpServers": {
      "launchpad": {
         "url": "<Launchpad MCP endpoint>",
         "oauth": {
            "clientId": "<OAuth client ID>",
            "redirectUri": "http://localhost:8787/callback"
         }
      }
   }
}
```

Use the workspace file by default. Check whether the active Kiro custom agent supplies its own MCP server configuration; if so, resolve the effective destination before editing rather than assuming the workspace file is loaded. Before editing, confirm the `oauth` fields against the installed version or current [Kiro MCP documentation](https://kiro.dev/docs/mcp/configuration/); the source guide's Launchpad integration is unvalidated. If support is unverified, stop and report the limitation. Add scopes only if required by trusted Launchpad documentation. For **Kiro IDE**, verify its current remote OAuth configuration support separately before writing this CLI template. If unsupported or unverified, explain the limitation and ask whether the user wants to target Kiro CLI; do not silently switch harnesses.

### Visual Studio Code

Warning: this configuration hasn't been validated yet.

Add a workspace configuration in `.vscode/mcp.json` using VS Code's `servers` format:

```json
{
   "servers": {
      "launchpad": {
         "type": "http",
         "url": "<Launchpad MCP endpoint>",
         "oauth": {
            "clientId": "<OAuth client ID>"
         }
      }
   }
}
```

Alternatively, run **MCP: Add Server** from the Command Palette and configure the remote HTTP server. VS Code opens a browser to authenticate on the first connection. Register the VS Code redirect URLs listed in Section 2 with the Launchpad OAuth client. The Launchpad integration has not been validated; verify the connection in your environment. The [VS Code configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration) describes both the VS Code and portable formats; do not assume their OAuth fields are interchangeable.

### Claude Code

Add the server with the callback port from Section 2 (`55620`). The example uses project scope and writes a shared `.mcp.json`; use `--scope local` instead if the user does not want to share the configuration. Check for an existing server and confirm before replacing it.

```sh
claude mcp add --scope project --transport http --client-id <OAuth client ID> --callback-port 55620 launchpad <Launchpad MCP endpoint>
```

Omit `--client-secret`; the Launchpad client is a public client.

### Codex CLI

With the user's approval, add the server to `~/.codex/config.toml`. Check the installed `codex mcp add --help` first and do not overwrite an existing server without confirmation. Use port `5555` consistently when obtaining and registering the actual callback and when logging in:

```sh
codex -c mcp_oauth_callback_port=5555 mcp add launchpad --url <Launchpad MCP endpoint> --oauth-client-id <OAuth client ID>
```

The override applies to this command only; it does not persist the callback port. Determine the exact redirect URI using the installed client's documentation or output, register it before authentication, and stop if it cannot be verified.

### Cursor

Add the server to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global). Cursor uses `auth.CLIENT_ID` for a pre-registered OAuth client. The source guide marks Cursor as not yet validated.

```json
{
   "mcpServers": {
      "launchpad": {
         "url": "<Launchpad MCP endpoint>",
         "auth": {
            "CLIENT_ID": "<OAuth client ID>"
         }
      }
   }
}
```

## 5. Authenticate and Verify

Say "Step 5 of 5: authenticate and verify <selected harness>." Use the actual configured server name, not a hardcoded example. Explain that you will initiate authentication and the user must complete browser login and consent. Run supported noninteractive commands yourself when shell access is available; do not start a second interactive agent just to enter a slash command. If only a session command is supported and you cannot invoke it, prompt the user to enter it in their existing session and pause for the result. If the CLI is missing or tools are restricted, provide the exact manual action rather than installing software or claiming it ran.

After authentication, inspect status and discover available tools through the selected harness. If the current session has not picked up the edited config, ask for its documented MCP reload/reconnect action or a session restart, then resume verification. Do not call a tool from another environment as proof. If an appropriate read-only Launchpad tool is available, use it to verify access; never create or mutate an application merely to test setup. Report separately whether configuration, authentication, connection, tool discovery, and any read-only check succeeded. Claim setup complete only when the connection is authenticated and Launchpad tools are available; otherwise state exactly what remains unverified.

### OpenCode

```sh
opencode mcp auth <server-name>
opencode mcp list
```

Confirm the server is connected and its tools are listed. For connection diagnostics, run `opencode mcp debug <server-name>`.

### Claude Code

Authenticate from a Claude Code session with `/mcp` and select the server, or run:

```sh
claude mcp login <server-name>
claude mcp list
claude mcp get <server-name>
```

Confirm the server status is connected and its tools are available.

### GitHub Copilot CLI

Start `copilot`, run `/mcp auth <server-name>` to open the OAuth browser flow, then `/mcp show <server-name>` to check status and tools. From the terminal, check status and tools with:

```sh
copilot mcp get <server-name>
```

### Codex CLI

```sh
codex -c mcp_oauth_callback_port=5555 mcp login <server-name>
codex mcp list
```

Complete the browser flow, confirm the server is listed without an authentication error, then try a low-impact Launchpad MCP tool. If these subcommands are unavailable in the installed version, check `codex mcp --help` for its current command syntax.

### Cursor

Open Cursor's **Customize** page, select the Launchpad MCP server, complete OAuth if prompted, and confirm the server is enabled and its tools appear under **Available Tools**. If it fails, open the Output panel and select **MCP Logs**. The source guide marks Cursor as unvalidated; see the Cursor redirect URL note in Section 2.

### Visual Studio Code

Run **MCP: List Servers** from the Command Palette, select the Launchpad server, and start it if needed. VS Code opens a browser for OAuth on first connection. Confirm the server is running and its tools appear in **Configure Tools** in Chat. The source guide marks the Launchpad integration as unvalidated.

### AWS Kiro CLI

Start `kiro-cli`, enter `/mcp`, and select the configured Launchpad MCP server. Kiro displays an authentication URL; open it in a browser and complete user authentication. Return to Kiro and confirm the server is connected and its tools are available. To re-authenticate later, run `/mcp auth <server-name>` (`/mcp cancel-auth` aborts a stuck flow; `/mcp logout` clears stored credentials). If it fails, run `/logdump --mcp` to collect MCP logs; **Kiro - MCP Logs** in the Output panel applies to the Kiro IDE only. The source guide marks the Launchpad integration as unvalidated.

For Kiro CLI, prompt for `/mcp` or `/mcp auth <server-name>` in the existing Kiro session unless available session tools can invoke it. Automate supported status checks only after checking installed help; do not invent a terminal equivalent for a slash command. For Kiro IDE, use its documented MCP connection/authentication controls and **Kiro - MCP Logs**, not CLI-only slash commands. Verify tools in the active IDE session.

Token lifetime is determined by the registration, not necessarily one day. If authentication or connection fails, first verify the MCP endpoint, client ID, exact redirect URL, authorization-code grant, PKCE, and MCP-client setting. Check the installed client's logs and trusted Launchpad documentation before proposing changes. Do not change registration settings, log out, or clear stored credentials without the user's approval. Redact sensitive data before sharing diagnostics.

## Distribution Notes

Distribute this file with any supporting files in the `launchpad-byoa-mcp/` skill directory. Do not bundle workspace MCP configuration, OAuth credentials, authentication caches, staging files, or backups. Installing the files alone does not guarantee the assistant has discovered them.
