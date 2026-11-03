# Install Launchpad Agent Helpers

This guide covers installing the two independent offerings in this repository. For a product overview and the skills catalog, see [README.md](README.md).

## Choose what to install

| If you want to... | Install |
| --- | --- |
| Get task-specific help with Launchpad development in your coding assistant | One or more **Launchpad agent skills** |
| Have an assistant guide a Custom UX component from app discovery through publishing | The **Launchpad UX Builder plugin** |
| Get both general Launchpad guidance and the guided Custom UX workflow | Both |

## Install Launchpad agent skills

Each skill is a folder under [`skills/`](skills/) containing a `SKILL.md` and, in some cases, supporting references or assets. Install a skill folder in the discovery location used by your coding assistant. Keep the whole folder together so the skill can access its supporting files.

### Install with the help of your agent harness

Prompt your harness to do the installation itself with a simple prompt like:

```Setup launchpad skills in this workspace using the guidance in this git repo: https://github.com/pegasystems/pega-launchpad-agent-skills```

### Install using the skills CLI

With Node.js available, install one skill from this repository:

```bash
npx skills add https://github.com/pegasystems/pega-launchpad-agent-skills --skill launchpad-webembed
```

Replace `launchpad-webembed` with another skill name from the list below. To install the full collection, omit `--skill <name>`:

```bash
npx skills add https://github.com/pegasystems/pega-launchpad-agent-skills
```

Available skills:

- `launchpad-byoa-mcp`
- `launchpad-custom-function`
- `launchpad-dx-apis`
- `launchpad-ux-custom-components`
- `launchpad-ux-custom-frontend`
- `launchpad-webembed`

### Install manually

Copy the skill folder into a location discovered by your coding assistant. Common locations are listed below. Follow your assistant's documentation if its supported paths or setup steps differ.

| Assistant | Project-level location | User-level location |
| --- | --- | --- |
| **Cursor** | `.cursor/skills/` or `.agents/skills/` | `~/.cursor/skills/` |
| **GitHub Copilot** | `.github/skills/` | `~/.copilot/skills/` |
| **Claude Code** | `.claude/skills/` | `~/.claude/skills/` |
| **AWS Kiro (IDE and CLI)** | `.kiro/skills/` | `~/.kiro/skills/` |
| **OpenCode** | `.opencode/skills/` or `.agents/skills/` | `~/.config/opencode/skills/` or `~/.agents/skills/` |
| **Codex** | `.agents/skills/` | `~/.agents/skills/` or `~/.codex/skills/` |

For example, to add `launchpad-webembed` to a project for GitHub Copilot, copy the complete folder to:

```text
.github/skills/launchpad-webembed/
```

Restart or reload the assistant if it does not discover a newly installed or updated skill. Once installed, ask a task that matches the skill, or invoke it by name if your assistant supports that.

## Install the Launchpad UX Builder plugin

The plugin bundles the `launchpad-ux-custom-builder` skill, templates, and its guided build-and-publish workflow. It requires:

- An assistant that supports Agent Plugins and can connect to Launchpad through MCP.
- Access to a Launchpad environment and permission to publish Custom UX components.
- Node.js, npm, and network access for the DXCB dependencies and publishing workflow.

Install the directory containing `plugin.json` using your assistant's Agent Plugin mechanism. For a local checkout in VS Code, add the plugin root to `chat.pluginLocations` in your settings:

```json
{
  "chat.pluginLocations": {
    "/absolute/path/to/pega-launchpad-agent-skills/plugins/launchpad-ux-builder": true
  }
}
```

Reload the assistant if needed, then make a matching request, for example:

```text
Build a custom UX component for my Launchpad app.
```

The plugin uses the host assistant's MCP connection; it does not bundle a separate MCP server. See the [UX Builder plugin guide](plugins/launchpad-ux-builder/README.md) for host-specific behavior, MCP configuration, and workflow details.

## Configure Launchpad MCP

Prompt your harness to do the installation itself with a simple prompt like:

```Setup launchpad authoring in this workspace using the guidance in this git repo: https://github.com/pegasystems/pega-launchpad-agent-skills```

Follow the [Launchpad MCP skill guide](skills/launchpad-byoa-mcp/SKILL.md) and the documentation specific to your agent harness to configure Launchpad and connect to its MCP server.

Note: after the mcp authentication step, you may need to reload or restart your harness. If authentication is successful, ask your harness resume the MCP configuration.

