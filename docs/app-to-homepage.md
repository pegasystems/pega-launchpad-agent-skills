# Launchpad app to home page: quick overview

The `launchpad-app-to-homepage` skill turns a Pega Launchpad application into a custom, modern, AI-first marketing home page: a static HTML, CSS and JavaScript site with no framework and no build step. Your coding assistant learns the app through the Launchpad MCP, asks you a few questions, proposes three page concepts, then builds, checks and previews the page.

The result sells your app to its buyer, in the buyer's words. It leads with the app's real AI step, shown as input, result and human review, uses real screens from the app, and explains why the app is a safe choice for an enterprise. Every claim on the page traces back to the app's rules or to something you told the assistant.

For the full instructions the assistant follows, see [SKILL.md](../skills/launchpad-app-to-homepage/SKILL.md).

## What you need

- An AI coding assistant that supports skills and MCP, for example Claude Code, GitHub Copilot, Cursor, Codex, Kiro, or OpenCode.
- A Launchpad application you can access, and its Launchpad environment URL.
- A browser tool your assistant can drive (for example a built-in browser pane, Claude in Chrome, or Playwright) to preview the page and take screenshots.
- Optionally, full-size screenshots or short screen recordings of the screens you want featured.

Everything else (the Launchpad MCP connection, Node.js 20 or newer, and the optional Lighthouse check) is checked by the assistant on the first run. It asks before installing anything, and for the few steps it cannot do itself, such as signing in or a command in your assistant's own settings, it gives you the exact command to copy and paste.

## Setup: install the skill

The easiest route is to ask your assistant to do it:

```text
Install the launchpad-app-to-homepage skill in this workspace from https://github.com/pegasystems/pega-launchpad-agent-skills
```

Or use the skills CLI (requires Node.js):

```bash
npx skills add https://github.com/pegasystems/pega-launchpad-agent-skills --skill launchpad-app-to-homepage
```

Or copy the whole `skills/launchpad-app-to-homepage/` folder into your assistant's skills location (for example `.claude/skills/`, `.github/skills/`, or `.cursor/skills/`). Keep the folder together so the skill can find its `references/` and `scripts/`. See [INSTALL.md](../INSTALL.md#install-manually) for every assistant's location.

Restart or reload your assistant if it does not pick up the new skill. That is all the setup you do up front.

## Usage

### Start a run

Name your app in a short prompt:

```text
Make a home page for my Launchpad app "Claims Intake".
```

Or invoke the skill directly (Claude Code):

```text
/launchpad-app-to-homepage
```

Other prompts that work well:

```text
Build a landing page for my Launchpad expense approvals app, aimed at finance leaders.
```

```text
Create an AI-first product site for the Audit Manager app. I'll upload screenshots.
```

### What happens next

The assistant drives the run and stops only at these points:

1. **Setup check.** On the first run it checks its tools in one pass and gives you a short "Do this once" list for anything that needs you, such as signing in to Launchpad. Reply `done` when finished, or `skip` for optional items. Later runs skip what already passed.
2. **App discovery.** It reads your app through the Launchpad MCP and writes `projects/<app>/app-brief.md`: facts only, each tied to the rule it came from, including an inventory of the app's AI features and what a human reviews after each one.
3. **One question round (up to about five questions).** Be ready to answer:
   - Who visits the page (role, industry, company size), and what do they use today?
   - Which hero headline to use (it drafts two or three for you to pick or edit), and what proof you can stand behind, such as a customer quote or a pilot result.
   - What sets the app apart, and the one thing a visitor should remember.
   - The call to action and where it goes (a demo booking page, a sales email).
   - Which screens to feature and where they come from: a preview build it opens for you to sign in to, screenshots or recordings you upload, or (with your approval) clearly labelled illustrative frames. Also the tone and the look (Bold by default, Calm on request).
4. **Preview build OK.** If it needs a preview URL, it asks before running the Launchpad build.
5. **Pick a concept.** It writes three page concepts to `CONCEPTS.md` and recommends one. You can pick one or mix them.
6. **Approve the preview.** It builds the site in `projects/<app>/site/`, runs `scripts/check_site.mjs`, reviews screenshots at desktop, tablet and phone widths, and shows you the preview with a list of any placeholders still on the page.

It publishes or deploys only if you ask, only to the host you name, and only after you approve the preview. To share the page as one file, it can bundle the site into a single self-contained HTML file.

## Tips for a better page

- **Supply full-size captures early.** Screenshots about 1400 px wide or larger (2400 px for the hero), and a short screen recording of the AI step (5-15 seconds), make the page feel real.
- **Use safe example data.** Navigate to a demo case before capture; personal names are cropped out.
- **Give real proof or none.** The skill never puts a customer, logo, quote, rating or number on the page that you did not supply.
- **Ask for changes in plain words.** For example: "make the hero a question", "calmer look", or "lead with the workflow instead of the agent".

## What the skill will not do

- Invent metrics, customers, testimonials, features, screens or AI results the app does not have.
- Use platform terms (case types, stages, personas) or the platform's name on the page unless you ask for a credit.
- Add tracking, analytics, external scripts, live model calls or API keys to the page.
- Handle your passwords, tokens, or client secrets.
- Provision subscribers, publish, or change rules to get screenshots.
- Use fonts or media without a licence. Sources and licences are recorded in `site/CREDITS.md`.
