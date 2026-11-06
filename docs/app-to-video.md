# Launchpad app to video: quick overview

The `launchpad-app-to-video` skill turns a Pega Launchpad application into a 30-60 second motion-graphics teaser video (1920x1080, 30 fps). Your coding assistant learns the app through the Launchpad MCP, asks you a few questions, proposes storylines, and builds and renders the film with [HyperFrames](https://github.com/heygen-com/hyperframes).

The result is a marketing film for an enterprise buyer: it opens on an outcome, shows the product working in real UI, and closes on why the app is a safe choice. Every on-screen claim traces back to the app's rules or to something you told the assistant.

For the full instructions the assistant follows, see [SKILL.md](../skills/launchpad-app-to-video/SKILL.md).

## What you need

- An AI coding assistant that supports skills and MCP, for example Claude Code, GitHub Copilot, Cursor, Codex, Kiro, or OpenCode.
- A Launchpad application you can access, and its Launchpad environment URL.
- Optionally, full-size screenshots or short screen recordings of the screens you want featured.

Everything else (the Launchpad MCP connection, the HyperFrames video tools, Node.js, FFmpeg, and the optional music and voiceover tools) is checked and set up by the assistant on the first run. It asks before installing anything, and for the few steps it cannot do itself, such as signing in or a command in your assistant's own settings, it gives you the exact command to copy and paste.

## Setup: install the skill

The easiest route is to ask your assistant to do it:

```text
Install the launchpad-app-to-video skill in this workspace from https://github.com/pegasystems/pega-launchpad-agent-skills
```

Or use the skills CLI (requires Node.js):

```bash
npx skills add https://github.com/pegasystems/pega-launchpad-agent-skills --skill launchpad-app-to-video
```

Or copy the whole `skills/launchpad-app-to-video/` folder into your assistant's skills location (for example `.claude/skills/`, `.github/skills/`, or `.cursor/skills/`). Keep the folder together so the skill can find `references/voiceover.md`. See [INSTALL.md](../INSTALL.md#install-manually) for every assistant's location.

Restart or reload your assistant if it does not pick up the new skill. That is all the setup you do up front.

## Usage

### Start a run

Name your app in a short prompt:

```text
Make a 45-second teaser video for my Launchpad app "Claims Intake".
```

Or invoke the skill directly (Claude Code):

```text
/launchpad-app-to-video
```

Other prompts that work well:

```text
Create a promo video of my Launchpad expense approvals app for finance leaders.
```

```text
Make a launch teaser for the Audit Manager app with background music and a female US English voiceover.
```

```text
Turn my Launchpad onboarding app into a 30-second video. I'll upload screenshots.
```

### What happens next

The assistant drives the run and stops only at these points:

1. **Setup check.** On the first run it checks its tools in one pass, installs what it can (with your OK), and gives you a short "Do this once" list for anything that needs you, such as signing in to Launchpad. Reply `done` when finished, or `skip` for optional items like music and voiceover. Later runs skip what already passed.
2. **App discovery.** It reads your app through the Launchpad MCP and writes `projects/<app>/app-brief.md`: facts only, each tied to the rule it came from.
3. **One question round (up to about five questions).** Be ready to answer:
   - Who watches the video (role, industry), and what is the pain or old way today?
   - Which opening line to use (it drafts two or three for you to pick or edit), and what proof you can stand behind, such as a customer number or pilot result.
   - Which matters most to this buyer: cost, security and control, scale, or predictable AI.
   - What sets the app apart from spreadsheets, email, a legacy tool, or a competitor, and the one thing viewers should remember.
   - The call to action, tone, music choice, and whether you want a voiceover.
   - Where screenshots come from: a preview build it opens for you to sign in to, screenshots or recordings you upload, or (with your approval) illustrative generic Launchpad screens.
4. **Preview build OK.** If it needs a preview URL, it asks before running the Launchpad build.
5. **Pick a storyline.** It writes three storylines to `STORYLINES.md` and recommends one.
6. **Approve the preview.** It opens HyperFrames Studio so you can watch the film before it renders.

After your approval it renders `projects/<app>/renders/<app>-teaser-vN.mp4` and verifies the file.

## Tips for a better video

- **Supply full-size captures early.** Screenshots about 1400 px wide or larger, and short screen recordings (10-30 seconds, one action per clip such as "open the case" or "approve"), make the demo feel alive.
- **Use safe example data.** Navigate to a demo case before capture; personal names are cropped out.
- **Give real numbers or none.** The skill never puts a metric on screen that you did not supply.
- **Ask for changes in plain words.** For example: "make the hook a question", "shorten the proof beat", or "swap the music for something calmer".

## What the skill will not do

- Invent metrics, features, UI states, or AI results the app does not show.
- Handle your passwords, tokens, or client secrets.
- Provision subscribers, publish, or change rules to get screenshots.
- Generate music with MusicGen or Lyria, or use media without a licence for commercial use. Licences are recorded in `assets/audio/CREDITS.md`.
