---
name: byoa-launchpad-mcp
description: Use when a user wants to connect a Pega Launchpad environment to an MCP-capable coding tool, register the Launchpad Vibe MCP server, configure OAuth, or troubleshoot Launchpad MCP setup in OpenCode, Cursor, Claude Code, Codex, GitHub Copilot, or VS Code.
---

# BYOA Launchpad MCP Setup

## Overview

Use this skill to register the Pega Launchpad Vibe MCP server in a coding tool. Collect the Launchpad URL, tool(s), server name, and OAuth Client ID; construct the Launchpad MCP endpoint; then merge the tool-specific server entry into the right configuration file. Never request, display, or store an OAuth client secret.

## Setup

1. Briefly explain that setup needs the Launchpad application URL, the coding tool(s), a server name, and an OAuth Client ID for the Launchpad registration. Ask whether the user already has a Client ID. If they do not, help them create a public OAuth client registration before requesting the ID. Some tools do not put the ID explicitly in their config.
2. Collect the Launchpad URL and coding tool(s). Ask which configuration scope to use when the tool supports project and global settings. Use the available structured question tool when supported.
3. Validate and normalize the URL:
   - It must start with `https://`.
   - Remove a trailing `/apps`, `/home`, or slash; preserve the rest of the application path.
   - Append `/core-authoring/mcp` to form the MCP URL.
4. Ask for a short server name that does not collide with an existing server entry.
5. Read the target configuration file before changing it. Merge only the new server entry; preserve every other server and setting. If the file is malformed or the server name already exists, explain the conflict and ask before replacing anything.
6. Write the tool-specific configuration below. Validate JSON or TOML syntax where possible, and report the exact file changed.
7. Guide the user through browser authentication and verify the server is connected before saying setup is complete.

Example endpoint construction:

```text
Application URL: https://cluster.example.net/app/tenant-123/env-456/apps
MCP URL:         https://cluster.example.net/app/tenant-123/env-456/core-authoring/mcp
```

## OAuth client registration

If the user has no OAuth Client ID, guide them through Launchpad:

1. Open the Launchpad environment.
2. Open the top-left menu and select **Administrator Setup**.
3. Find **OAuth 2.0 client registrations** and select **Add**.
4. Use the following values:

| Field | Value |
|---|---|
| Client Type | `Public` |
| MCP Client | `true` (checked) |
| Access Token Expiry | `86400` seconds or lower |
| Grant Type | `Authorization Code` |
| Require PKCE | `true` (checked) |
| Redirect URLs | Add the callback URL(s) for the coding tool(s) being configured |

5. Save the registration and have the user copy the generated Client ID. Do not ask for or put a client secret in a local config file.

Public clients use PKCE rather than a client secret because locally running coding tools cannot keep a secret confidential. MCP Client enables the MCP token behavior; an expiry of `86400` seconds is 24 hours. A shorter expiry is valid if required by the user's security policy.

Register the callback URLs for the selected tools:

| Tool | OAuth redirect URL |
|---|---|
| OpenCode | `http://127.0.0.1:19876/mcp/oauth/callback` |
| Claude Code | `http://localhost:55620/callback` |
| GitHub Copilot | `http://127.0.0.1:62629/` |
| Codex | `http://127.0.0.1:5555/callback/RCVLxGBsohNB` |

Cursor and VS Code callback URLs are not specified here. Check the tool's current MCP OAuth documentation instead of guessing. One Launchpad registration can serve multiple tools if all required callback URLs are added as a comma-separated list. A callback mismatch can cause `redirect_uri_mismatch`; compare the URI, including port and trailing slash, exactly.

Ask for the Client ID only, not a secret. A single Client ID can be used across tools when its registration includes each tool's callback URL.

## Tool configuration

Use placeholders until the user has supplied their URL, Client ID if required, and server name. Follow the indicated transport and configuration key. For existing files, merge the shown server object into the existing top-level key rather than replacing the file.

### OpenCode

Config file: project `opencode.json` or global `~/.config/opencode/opencode.json`.

Merge under `mcp`:

```json
{
  "mcp": {
    "<SERVER_NAME>": {
      "type": "remote",
      "url": "<MCP_URL>",
      "enabled": true,
      "oauth": {
        "clientId": "<CLIENT_ID>"
      }
    }
  }
}
```

After writing, have the user restart OpenCode or reload the session. Browser authentication should start on first connection.

### Cursor

Config file: `.cursor/mcp.json` in the project root. Create it if absent. Merge under `mcpServers`:

```json
{
  "mcpServers": {
    "<SERVER_NAME>": {
      "type": "streamable-http",
      "url": "<MCP_URL>",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

Cursor normally handles OAuth through browser discovery when the server responds with 401; do not add `clientId` by default. If the environment requires an explicit ID, add:

```json
"oauth": {
  "clientId": "<CLIENT_ID>"
}
```

Restart Cursor or use **MCP: List Servers** from the Command Palette, then authenticate when prompted.

### Claude Code

Config file: project `.mcp.json` or global `~/.claude.json`. Merge under `mcpServers`:

```json
{
  "mcpServers": {
    "<SERVER_NAME>": {
      "type": "http",
      "url": "<MCP_URL>",
      "oauth": {
        "clientId": "<CLIENT_ID>"
      }
    }
  }
}
```

Alternatively, add the server with:

```bash
claude mcp add --transport http "<SERVER_NAME>" "<MCP_URL>"
```

Have the user run `/mcp` to check status and authenticate in the browser on first use.

### Codex

Global TOML config: `~/.codex/config.toml`. Merge:

```toml
[mcp_servers.<SERVER_NAME>]
type = "remote"
url = "<MCP_URL>"
```

Then authenticate with:

```bash
codex mcp login <SERVER_NAME>
```

Alternatively, use project `codex.json` and merge under `mcpServers`:

```json
{
  "mcpServers": {
    "<SERVER_NAME>": {
      "type": "remote",
      "url": "<MCP_URL>",
      "oauth": {
        "clientId": "<CLIENT_ID>"
      }
    }
  }
}
```

After browser login, restart Codex.

### GitHub Copilot

Recommended project config: `.github/copilot-mcp.json`. Global config: `~/.config/github-copilot/mcp.json`. Merge under `servers`:

```json
{
  "servers": {
    "<SERVER_NAME>": {
      "type": "http",
      "url": "<MCP_URL>",
      "headers": {}
    }
  }
}
```

Copilot normally discovers OAuth from the server, so omit `oauth.clientId` by default. Add it only when the Copilot host's setup instructions or authentication error explicitly requires an ID; having a Launchpad Client ID does not by itself mean it belongs in this config. If required, add:

```json
"oauth": {
  "clientId": "<CLIENT_ID>"
}
```

Restart the editor or run the MCP refresh command supported by the user's Copilot host, then authenticate when prompted. Verify through that host's MCP server list or status view. The refresh command is host-specific; do not invent a universal Copilot CLI command.

### VS Code

Recommended project config: `.vscode/mcp.json`. Alternatively, add the server under `mcp.servers` in VS Code `settings.json`.

For `.vscode/mcp.json`, merge under `servers`:

```json
{
  "servers": {
    "<SERVER_NAME>": {
      "type": "http",
      "url": "<MCP_URL>",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

For `settings.json`, merge under `mcp.servers`:

```json
{
  "mcp": {
    "servers": {
      "<SERVER_NAME>": {
        "type": "http",
        "url": "<MCP_URL>",
        "headers": {
          "Content-Type": "application/json"
        }
      }
    }
  }
}
```

Use **MCP: List Servers** from the Command Palette to verify the server and authenticate in the browser when prompted.

## Authentication and verification

On first connection, the coding tool should open a browser or display an authorization URL. Have the user sign in to Launchpad, authorize the application, and return to the coding tool. If the browser does not open, copy the displayed URL into a browser.

Verify the connection using the tool's MCP status command or panel. Then test a Launchpad operation such as finding an application, listing branches, or searching for rules. Say the server is connected only after the tool confirms it; otherwise report that configuration was saved and identify the remaining authentication or connection step.

## Troubleshooting

| Symptom | Checks |
|---|---|
| Server does not connect | Confirm the base URL and `/core-authoring/mcp` path, client ID, network/VPN access, and configuration file location. Opening the endpoint may return `401` before authentication; that alone is expected. |
| `redirect_uri_mismatch` | Confirm the OAuth registration contains the exact callback URL for the tool, including hostname, port, path, and trailing slash. |
| Authentication fails | Confirm the user can sign in to Launchpad and that the OAuth registration belongs to the correct environment. Clear cached tokens and retry if needed. |
| Tool does not detect the server | Check JSON/TOML syntax, top-level config key, file location, and server name; restart or refresh the tool. |

## Quick reference

| Tool | Config file | Scope |
|---|---|---|
| OpenCode | `opencode.json` or `~/.config/opencode/opencode.json` | Project / global |
| Cursor | `.cursor/mcp.json` | Project |
| Claude Code | `.mcp.json` or `~/.claude.json` | Project / global |
| Codex | `~/.codex/config.toml` or `codex.json` | Global / project |
| GitHub Copilot | `.github/copilot-mcp.json` or `~/.config/github-copilot/mcp.json` | Project / global |
| VS Code | `.vscode/mcp.json` or `settings.json` | Project |

## Common mistakes

- Keeping the `/apps` or `/home` suffix in the MCP URL, or dropping the Launchpad application path before appending `/core-authoring/mcp`.
- Creating a confidential client or putting a client secret in a local MCP config instead of using a public client with PKCE.
- Replacing an existing config file instead of merging the new server entry.
- Guessing callback URLs for Cursor or VS Code when they are not listed above.
- Claiming the server is connected before authentication and a status check succeed.
