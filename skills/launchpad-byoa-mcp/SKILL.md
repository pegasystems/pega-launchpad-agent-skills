---
name: launchpad-byoa-mcp
description: Use when a user wants to connect a Pega Launchpad environment to an MCP-capable coding tool, register the Launchpad Vibe MCP server, configure OAuth
---

# BYOA Launchpad MCP Setup

## Overview

Use this skill to register the Pega Launchpad Vibe MCP server in a AI coding assistant. Collect the Launchpad URL, tool(s), server name, and OAuth Client ID; construct the Launchpad MCP endpoint; then merge the tool-specific server entry into the right configuration file. Never request, display, or store an OAuth client secret.

## Setup

1. Briefly explain that setup needs the Launchpad application URL, the coding tool(s), a server name, and an OAuth Client ID for the Launchpad registration. Ask whether the user already has a Client ID. If they do not, help them create a public OAuth client registration before requesting the ID. Some tools do not put the ID explicitly in their config.
2. Collect the Launchpad URL and coding tool(s). Ask which configuration scope to use when the tool supports project and global settings. Use the available structured question tool when supported.
3. Validate and normalize the URL:
   - It must start with `https://`.
   - Accept the application URL with or without a trailing `/apps`.
   - Preserve the tenant and environment path. Use `/app/` when the hostname is `pegaservice.net` or ends in `.pegaservice.net`; do not add `/app/` for other hosts.
   - Remove a trailing `/apps` if present, then append `/core-authoring/mcp` to form the MCP URL.
4. Ask for a short server name that does not collide with an existing server entries.
5. Read the target configuration file before changing it. Merge only the new server entry; preserve every other server and setting. If the file is malformed or the server name already exists, explain the conflict and ask before replacing anything.
6. Write the tool-specific configuration below. Validate JSON or TOML syntax where possible, and report the exact file changed.
7. Guide the user through browser authentication and verify the server is connected before saying setup is complete.

Example endpoint construction:

```text
Application URL: https://cluster.pegaservice.net/app/tenant-123/env-456/apps
MCP URL:         https://cluster.pegaservice.net/app/tenant-123/env-456/core-authoring/mcp

Application URL: https://cluster.example.net/tenant-123/env-456
MCP URL:         https://cluster.example.net/tenant-123/env-456/core-authoring/mcp
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
Refer to publicly available documentation on how to configure OAuth for AI assistant tool that the user specified, i.e. [OAuth section of OpenCode](https://opencode.ai/v2/docs/mcp-servers#oauth).

Prefer Project specific configuration when possible.

Most tools require the following:
- Pre-registered LaunchPad client ID
- Local callback port typically ranging from 1 through 65535, default may vary based on the AI assistant tool
- Pre-registered loopback URI whose path and port reach the local callback listener

## Authentication and verification

On first connection, the coding tool should open a browser or display an authorization URL. Have the user sign in to Launchpad, authorize the application, and return to the coding tool. If the browser does not open, copy the displayed URL into a browser.

Verify the connection using the tool's MCP status command or panel. Then test a Launchpad operation such as finding an application, listing branches, or searching for rules. Say the server is connected only after the tool confirms it; otherwise report that configuration was saved and identify the remaining authentication or connection step.

## Troubleshooting

| Symptom | Checks |
|---|---|
| Server does not connect | Confirm the HTTPS application URL, preserve its tenant/environment path, use `/app/` only when the hostname is `pegaservice.net` or ends in `.pegaservice.net`, and end the endpoint with `/core-authoring/mcp`. Opening the endpoint may return `401` before authentication; that alone is expected. |
| `redirect_uri_mismatch` | Confirm the OAuth registration contains the exact callback URL for the tool, including hostname, port, path, and trailing slash. |
| Authentication fails | Confirm the user can sign in to Launchpad and that the OAuth registration belongs to the correct environment. Clear cached tokens and retry if needed. |
| Tool does not detect the server | Check JSON/TOML syntax, top-level config key, file location, and server name; restart or refresh the tool. |

## Quick reference

| Tool | Config file | Scope |
|---|---|---|
| OpenCode | `.opencode/opencode.json` or `~/.config/opencode/opencode.json` | Project / global |
| Cursor | `.cursor/mcp.json` | Project |
| Claude Code | `.mcp.json` or `~/.claude.json` | Project / global |
| Codex | `~/.codex/config.toml` or `codex.json` | Global / project |
| GitHub Copilot | `.github/copilot-mcp.json` or `~/.config/github-copilot/mcp.json` | Project / global |
| VS Code | `.vscode/mcp.json` or `settings.json` | Project |

## Common mistakes

- Creating a confidential client or putting a client secret in a local MCP config instead of using a public client with PKCE.
- Replacing an existing config file instead of merging the new server entry.
- Guessing callback URLs for Cursor or VS Code when they are not listed above.
- Claiming the server is connected before authentication and a status check succeed.
