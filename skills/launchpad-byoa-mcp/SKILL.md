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
   - Remove a trailing `/apps` if present, then append `/authoring/mcp` to form the MCP URL.
4. Ask for the preferred short server name and identify the configuration scope.
5. Before editing, read and validate the target configuration and any other active scopes the tool combines with it. Confirm the files are parseable, use the tool's expected structure, and contain no pre-existing duplicate keys, server names, or normalized MCP URLs. If a file is malformed, ambiguous, or already invalid, stop and explain the issue; do not write into or replace it.
6. Check existing server entries by name and normalized MCP URL:
   - If a valid entry already points to the requested MCP URL, reuse it rather than adding a duplicate.
   - If the preferred name is unused and the URL is not already registered, use that name.
   - If the preferred name points to a different URL, leave that entry and all its settings unchanged. Add the new URL under a different, unique short name, preferably `<preferred-name>-<environment>`; if that name is taken, choose another distinguishing suffix and check again. Never overwrite, rename, or delete the existing entry, even if asked to reuse its name.
   - If the URL is already registered under another name in an active scope, reuse that entry instead of creating a duplicate.
7. Merge only the necessary new entry and preserve every other server and setting. Validate the proposed configuration against the tool's format and structure before writing, and write only if validation succeeds. After writing, reread and validate it again: confirm there are no duplicate keys, server names, or normalized MCP URLs; the MCP URL is registered exactly once in the effective configuration; the existing conflicting entry is unchanged; and unrelated settings are preserved. Use a validator that detects duplicate JSON keys; a permissive JSON parser may silently accept them. If reusing an existing entry, make no file change and verify that entry instead. If validation fails or cannot be performed, do not write an unvalidated configuration or claim setup is complete; report the exact file and issue, or that no change was needed.
8. Guide the user through browser authentication and verify the server is connected before saying setup is complete.

Example endpoint construction:

```text
Application URL: https://cluster.pegaservice.net/app/tenant-123/env-456/apps
MCP URL:         https://cluster.pegaservice.net/app/tenant-123/env-456/authoring/mcp

Application URL: https://cluster.example.net/tenant-123/env-456
MCP URL:         https://cluster.example.net/tenant-123/env-456/authoring/mcp
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
Use the selected assistant's official MCP documentation for its current OAuth configuration; server formats and callback behavior vary by tool.

| AI assistant | Official MCP/OAuth configuration |
|---|---|
| GitHub Copilot CLI | [Adding MCP servers](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers) — documents HTTP server setup, but not a pre-registered OAuth client ID. |
| VS Code | [MCP configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration) |
| Claude Code | [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp) |
| OpenCode | [MCP servers and OAuth](https://opencode.ai/docs/mcp-servers/) |
| Cursor | [Model Context Protocol (MCP)](https://cursor.com/docs/mcp) |
| Codex | [MCP documentation](https://developers.openai.com/codex/mcp/) |

Prefer Project specific configuration when possible.

Callback settings are required whenever the selected tool exposes them. Check the tool's current MCP configuration schema and, if its remote-server OAuth settings accept `redirectUri` or `callbackPort`, explicitly configure the supported callback field in the MCP entry; do not rely on a default. Prefer the full `redirectUri` when supported, since it pins the host, port, and path. If only `callbackPort` is supported, set the port from the registered redirect URI. If both are supported and `redirectUri` takes precedence, set `redirectUri`; otherwise follow the tool's schema for whether both are needed. The configured callback must exactly match a redirect URL registered in LaunchPad, including hostname, port, path, and trailing slash. If the tool exposes neither setting, use its documented callback URI and have the user register that exact URI.

For OpenCode, the remote MCP `oauth` object accepts `redirectUri` and `callbackPort`. Prefer setting `redirectUri` to the registered URI; OpenCode documents `callbackPort` as a shorthand that is ignored when `redirectUri` is set.

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
| Server does not connect | Confirm the HTTPS application URL, preserve its tenant/environment path, use `/app/` only when the hostname is `pegaservice.net` or ends in `.pegaservice.net`, and end the endpoint with `/authoring/mcp`. Opening the endpoint may return `401` before authentication; that alone is expected. |
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
- Reusing a server name that points to a different Launchpad URL; preserve it and register the new URL with a unique name.
- Adding a second entry for an MCP URL already registered in an active configuration scope.
- Treating a successful permissive JSON parse as proof that the file has no duplicate keys or valid tool-specific structure.
- Guessing callback URLs for Cursor or VS Code when they are not listed above.
- Claiming the server is connected before authentication and a status check succeed.
