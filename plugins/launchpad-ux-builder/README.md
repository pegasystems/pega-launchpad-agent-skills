# launchpad-ux-custom-builder

A self-contained **Agent Plugin** ([agent-plugins.org](https://agent-plugins.org) v1.0.0)
that lets an agent build, preview, and publish Pega Launchpad **Custom UX (Constellation DX /
DXCB)** components end-to-end from a natural-language request.

The plugin contains one canonical skill. It uses the host assistant's remote OAuth MCP
connection and does not bundle a local MCP server, installer, or `.env` file.
Agent Plugins v1 leaves installation, OAuth, permissions, and updates to each client, so the
provider-specific MCP connection is configured in the host client's native MCP settings.

## What it does (the flow)

1. Detect or establish the host assistant's remote OAuth MCP connection.
2. Discover the app's case/data model, views, and theme via MCP.
3. Recommend the best-fit component (Field / Widget / Template + subtype).
4. Reuse an existing DXCB project or scaffold one non-interactively at a user-selected path.
5. Generate the component (`index.tsx` + `config.json`) wired to real fields.
6. Show a **theme-accurate** SVG mock with sample data.
7. Build, authenticate, and publish to the provider.

See `skills/launchpad-ux-custom-builder/SKILL.md` for the authoritative instructions.

## Structure (Agent Plugins v1.0.0)

```
launchpad-ux-builder/                   # plugin root
├── plugin.json                         # Agent Plugins manifest ($schema + name + metadata)
├── README.md                           # this file
├── skills/
│   └── launchpad-ux-custom-builder/    # the Agent Skill (fixed skills/<name>/ location)
│       ├── SKILL.md                    # orchestration brain + knowledge index
│       ├── references/                 # flow/ (01–07) + knowledge/ modules
│       ├── assets/                     # dxcb-scaffold + component-templates
│       └── examples/
```

## Using the skill

Install the directory containing `plugin.json` using your assistant's Agent Plugins mechanism.
For a local checkout in VS Code, add the plugin root to `chat.pluginLocations`:

```json
{
   "chat.pluginLocations": {
      "/absolute/path/to/pega-launchpad-agent-skills/plugins/launchpad-ux-builder": true
   }
}
```

The plugin is designed to work with MCP-capable assistants such as OpenCode, VS Code/Copilot,
Copilot CLI, Claude Code, Codex, and Cursor. Each assistant owns its own skill loading, MCP
configuration, OAuth authentication, and restart behavior.

After launching your assistant, it may show a generic greeting. Skills are activated after the
user types a matching natural-language request; they are not shown as a startup menu. Ask
naturally:

```text
Build a custom UX component for my Launchpad app.
```

You may also say:

```text
Create a custom field, widget, or layout template for my Launchpad app.
```

or:

```text
Let's start building a UX component for my Launchpad app.
```

The user does not need to mention the skill name. The assistant matches the request to the
skill's description. The skill then checks for the remote MCP connection. If it is not configured, the
flow asks for the Studio app URL and, when needed, an OAuth Client ID; it uses the assistant-specific configuration
mapping in `skills/launchpad-ux-custom-builder/references/assistant-mcp-config.json`, and
provides the exact authentication command for the active assistant.

For local OpenCode testing, link the skill once:

```bash
mkdir -p "$HOME/.config/opencode/skills"
ln -sfn "$(pwd)/skills/launchpad-ux-custom-builder" \
   "$HOME/.config/opencode/skills/launchpad-ux-custom-builder"
```

Other assistants should use their own documented skill or plugin installation path. The MCP
configuration formats and redirect URIs are defined in the assistant mapping file.

After MCP is connected, the flow asks for the app name, lists case types and data types, reads
the relevant fields, views, relationships, and theme, and only then recommends a UX component.
The design preview and publish approval gates remain in place. See
`skills/launchpad-ux-custom-builder/references/flow/` for the detailed flow.

## Tested models

The guided flow and generated components have been validated with:

- Claude Opus 4.6 and 4.8
- Claude Sonnet
- GPT-5.6 Luna Max

## Launchpad-knowledge strategy

The agent understands Launchpad through **two layers**:

1. **Live grounding (source of truth):** always query the connected rulebase via MCP first
   — case/data classes, field types, relationships, views, and the theme rule.
2. **Curated knowledge modules:** bundled references that teach the agent how to interpret
   that live data and make good design decisions.

New scenarios are added as **new modules under `skills/launchpad-ux-custom-builder/references/knowledge/`**,
indexed in `SKILL.md`. The package is intentionally self-contained (webembed is **not** included).

## Requirements

- An MCP-capable coding assistant with Agent Plugins or Agent Skills support.
- Access to a Pega Launchpad environment and permission to publish Custom UX components.
- Node.js, npm, and network access for DXCB dependencies and publishing.

## Validation

Validate `plugin.json` against the declared Agent Plugins v1 schema and run
`skills-ref validate skills/launchpad-ux-custom-builder` before publishing a release.

## License

Apache-2.0; see the repository-level `LICENSE` file.
