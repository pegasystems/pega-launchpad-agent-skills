# Installing Skills

These skills use the [Agent Skills](https://agentskills.io/) open standard (`SKILL.md` + optional `references/`). Install them in the way that matches your AI coding tool; the same skill files work across supported platforms.

## By platform

| Platform | Easiest install | Where skills are loaded from |
|----------|-----------------|------------------------------|
| **Cursor** | CLI or Add Skill URL | `.cursor/skills/`, `.agents/skills/`, or `~/.cursor/skills/` |
| **GitHub Copilot** | Copy into repo or home dir | `.github/skills/` or `~/.copilot/skills/` (also `.claude/skills/`) |
| **Claude Code** | Copy or clone into skills dir | `.claude/skills/` (project) or `~/.claude/skills/` (personal) |
| **OpenCode** | Copy into a discovery path | `~/.config/opencode/skills/`, `~/.agents/skills/`, `.opencode/skills/`, or `.agents/skills/` |
| **Codex** | Copy or `$skill-installer`, then restart | `~/.agents/skills/`, `~/.codex/skills/`, or repo `.agents/skills/` |

---

#### Cursor

- **CLI (recommended):** From your project or anywhere with Node.js 18+:
  ```bash
  npx agent-skills install pegasystems/pega-launchpad-agent-skills/skills/<skill-folder>
  ```
  Example for one skill from this repo:
  ```bash
  npx agent-skills install pegasystems/pega-launchpad-agent-skills/skills/launchpad-webembed
  ```
- **Manual:** Cursor Settings → **Features** → **Agent** → **Add Skill** → paste the raw `SKILL.md` URL, for example:
  `https://raw.githubusercontent.com/pegasystems/pega-launchpad-agent-skills/main/skills/launchpad-webembed/SKILL.md`
- Restart Cursor if the skill doesn’t appear. Requires Cursor **0.35+**.

---

#### GitHub Copilot

- **Project (team):** Copy a skill folder (including `SKILL.md` and any `references/`) into the repo:
  ```text
  .github/skills/<skill-name>/
  ```
  Example: `.github/skills/launchpad-webembed/SKILL.md`
- **Personal:** Copy into:
  ```text
  ~/.copilot/skills/<skill-name>/
  ```
  Copilot also looks in `.claude/skills/` and `~/.claude/skills/`.
- Agent skills work with the **Copilot coding agent**, **GitHub Copilot CLI**, and **VS Code Insiders** (stable VS Code support coming).

---

#### Claude Code

- **Personal (all projects):**
  ```bash
  mkdir -p ~/.claude/skills
  cp -r path/to/pega-launchpad-agent-skill/skills/launchpad-webembed ~/.claude/skills/
  ```
- **Project-only:** Copy the same folder into your repo:
  ```text
  .claude/skills/launchpad-webembed/
  ```
- Invoke in chat with `/launchpad-webembed` or let Claude use the skill when the task matches its description.

---

#### OpenCode

- OpenCode discovers skills from several paths. **Simplest:** copy the skill folder into one of:
  - **User:** `~/.config/opencode/skills/<skill-name>/` or `~/.agents/skills/<skill-name>/`
  - **Project:** `.opencode/skills/<skill-name>/` or `.agents/skills/<skill-name>/`
  Example:
  ```bash
  mkdir -p ~/.config/opencode/skills
  cp -r path/to/pega-launchpad-agent-skill/skills/launchpad-webembed ~/.config/opencode/skills/
  ```
- Optional: use the **opencode-agent-skills** plugin for install-from-registry workflows; skills still need to live in one of the above directories.

---

#### Codex (OpenAI)

- **User skills:** Ensure the directory exists and copy the skill folder:
  ```bash
  mkdir -p ~/.codex/skills   # or ~/.agents/skills
  cp -r path/to/pega-launchpad-agent-skill/skills/launchpad-webembed ~/.codex/skills/
  ```
- **Repo skills:** For team use, put skills under the repo root or current working directory:
  ```text
  .agents/skills/<skill-name>/
  ```
- Restart Codex so it picks up new or updated skills. You can also use the built-in **$skill-installer** to install from a curated list or from GitHub.