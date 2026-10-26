# LaunchPad OAuth Client ID Registration

Use this reference when a user needs to create an OAuth Client ID for the LaunchPad Vibe MCP server. 
This covers the registration in LaunchPad; configure the selected coding tool's MCP server separately using the 
instructions in the parent bring your own agent (BYOA) Launchpad MCP setup. 
Some tools do not expose the Client ID as an explicit config field, so follow that tool's documented schema rather than adding an unsupported setting.

OAuth Client ID can be shared, each user does not need their own client ID.

## Create the registration

1. Open the LaunchPad environment.
2. Open the top-left menu and select **Administrator Setup**.
3. Find **OAuth 2.0 client registrations** and select **Add**.
4. Set the registration fields:

   | Field | Value |
   |---|---|
   | Client Type | `Public` |
   | MCP Client | `true` (checked) |
   | Access Token Expiry | `86400` seconds or lower |
   | Grant Type | `Authorization Code` |
   | Require PKCE | `true` (checked) |
   | Redirect URLs | Add the exact callback URL(s) for the coding tool(s) |

5. Save the registration and copy the generated **Client ID**.

Public clients use PKCE instead of a client secret because locally running coding tools cannot keep a secret confidential. MCP Client enables MCP token behavior. An expiry of `36000` seconds is 24 hours; a shorter expiry is valid if required by the user's security policy. Never request or put a client secret in a local MCP configuration.

## Register tool callback URLs

Add the callback URL for every selected tool. A single LaunchPad registration can serve multiple tools when all required callback URLs are added as a comma-separated list.

| Tool | OAuth redirect URL |
|---|---|
| OpenCode | `http://127.0.0.1:19876/mcp/oauth/callback` |
| Claude Code | `http://localhost:55620/callback` |
| GitHub Copilot | `http://127.0.0.1:62629/` |
| Codex | `http://127.0.0.1:5555/callback/RCVLxGBsohNB` |

Cursor and VS Code callback URLs are not specified here. Check the tool's current MCP OAuth documentation instead of guessing. A callback mismatch can cause `redirect_uri_mismatch`; compare the URI exactly, including hostname, port, path, and trailing slash.

Ask for the Client ID only, not a secret. Use the registration for the same LaunchPad environment the user intends to connect.
