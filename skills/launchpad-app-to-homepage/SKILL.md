---
name: launchpad-app-to-homepage
description: Turn a Pega Launchpad application into a custom, modern, AI-first SaaS home page (static HTML/CSS/JS, no build step). Use when the user asks for a home page, landing page, marketing page, product site or web page for a Launchpad app, or just runs /launchpad-app-to-homepage. Guides first-time setup itself (Launchpad MCP, a browser, Node), learns the app via the Launchpad MCP, asks a few gap-filling questions, proposes three page concepts, then builds, checks and previews the page.
tags: [launchpad, homepage, landing-page, marketing, website]
---

# launchpad-app-to-homepage

Builds one marketing home page per Launchpad app. The page is specific to that app: its outcome, its workflow, its users, its real screens, its brand, and above all its real AI steps. It should feel like a 2026 AI-first SaaS home page, and every claim on it traces to a rule in the app or to the user's words.

**Sell the app, not the platform.** The visitor is a buyer in the app's own world (a sports league, an audit team, a claims desk), not a Launchpad builder. Rules are the evidence; the page speaks the buyer's language. No Launchpad terms in the copy (case type, data type, stage, persona, portal, work queue, access group, data model, automation, rule, insight), no rule names in Title Case ("Notify Claims Panel", "Awaiting Decision"), no counts of rules ("33 notifications", "43 insights", "6 personas") and no platform pitch. By default the page does not name the platform at all (no "Pega", no "Launchpad", not even in the footer, JSON-LD or llms.txt); add a single "Built on Pega Launchpad" credit only if the user asks for one. Platform facts still back the security lines, phrased as what the buyer gets ("hosted and maintained for you"). See `references/page-blueprint.md`, "Translate, don't transcribe".

References (read when you reach the step that needs them):
- `references/page-blueprint.md`: the sections, their order, what each must contain and where its content comes from.
- `references/ai-first.md`: what "AI-first" means on this page and how to show AI as a predictable, reviewed step.
- `references/look-and-motion.md`: design tokens from the Theme rule, layout, type, motion, banned looks, accessibility and performance budgets.
- `scripts/check_site.mjs`: the static checker run before every preview (Node 20+, no dependencies).
- `scripts/bundle_single.mjs`: bundles the finished site into one self-contained HTML file for sharing (step 5; Node 20+, no dependencies).

## Third-party tools
None are bundled. The user installs what they use, and is responsible for the licence of any font, image or other media they add.
- **Node.js 20+**: runs `scripts/check_site.mjs` and, optionally, `npx serve`. Required for the check.
- **A browser tool** the assistant can drive (built-in browser pane, Claude in Chrome, Playwright, an editor's integrated browser): preview, screenshots at several widths, and capture of app screens. Required for review.
- **Lighthouse** (Apache-2.0, optional): `npx --yes lighthouse`, needs Chrome.

## How a run goes (the user types as little as possible)
The user may only say "/launchpad-app-to-homepage" or "make a home page for <app>". Do not ask them to run separate setup prompts. You drive the whole run and stop only at these gates: (a) setup items that need their own terminal or sign-in, (b) the one question round, (c) a preview build OK (step 2, only if a screen needs one), (d) picking a concept, (e) preview approval, (f) publishing, only if they ask for it. Between gates, keep going without asking "shall I continue?". If the app name was not given, ask for it inside the step 2 question round if step 0 passes without it; otherwise ask it alone as the first message. When the user returns after a setup action ("done", "signed in"), re-run the failed checks yourself and carry straight on.

## 0. Prerequisites (check these first, before any other step)
Run all the checks yourself, in one pass, without asking first. Reply with ONE checklist (a line per item: OK / missing). Fix what you can. For everything that needs the user, give a single numbered "Do this once" list in the order to do it, each step with its exact copy-paste command in its own code block and where to run it (the assistant's own settings or command line for MCP steps, e.g. an interactive `claude` terminal for `/mcp` in Claude Code; a normal terminal for `npx`, `nvm` and package managers), then tell them to reply "done". Skip everything already OK, and if all required items pass say "Setup OK" in one line and go straight to step 1. Ask before installing anything on their machine. Do not continue to step 1 until the required items pass. Items 3 and 4 are optional: list them once as "optional, say 'skip' to go without" and never block on them.

**Required**
1. **Launchpad MCP.** The Launchpad authoring MCP server, under whatever name the user configured (`launchpad` by default; a project may define its own in a config file such as `.mcp.json`). Check: its tools (`find_application`, `list_rules`, `get_rule`, `search_rules`) are available (load them first if your assistant defers tools), then call `find_application` with the app name. Fix:
   - Server configured but tools missing, or "needs you to sign in again": the user approves the server and signs in through the assistant's MCP settings (Claude Code: `/mcp` in an interactive `claude` terminal; the desktop Code tab cannot open that dialog), then restarts or retries. Never ask for codes, tokens or callback URLs.
   - No Launchpad server configured, or another Launchpad environment: follow the `launchpad-byoa-mcp-initial-setup` skill (older installs: `launchpad-byoa-mcp`), or point the user to it: https://github.com/pegasystems/pega-launchpad-agent-skills/blob/master/skills/launchpad-byoa-mcp-initial-setup/SKILL.md. It needs the Launchpad application URL and an OAuth Client ID the user creates in that environment (Administrator Setup > OAuth 2.0 client registrations > Add: Public client, MCP Client, Authorization Code, PKCE). Never request a client secret.
   - Connected but the app is not found: ask for the exact app name; the MCP user may lack access.
2. **Node 20+ and a browser tool.** `node -v` must be 20 or newer (with nvm, use any installed 20+ by prefixing `PATH="$HOME/.nvm/versions/node/<v20+>/bin:$PATH"`). A browser tool must be available to the assistant (see Third-party tools) to preview the page and take screenshots at desktop and phone widths.

**Needed later (check now, ask in the question round)**
3. **A way to see the app (strongly recommended).** The page leads with real screens. Either a browser tool plus the user's willingness to sign in to the Launchpad preview manually, or user-supplied screenshots/recordings (see step 2). Claude in Chrome needs its extension installed and signed in: https://chromewebstore.google.com/detail/fcoeoabgfenejglbffodgkkbkcdhcgfn
4. **Lighthouse (optional).** `npx --yes lighthouse --version`. Without it, review relies on the checker script and the browser screenshots.

Record the result in `projects/<app>/app-brief.md` under "Environment" (versions, what was missing, what the user fixed) so the next run can skip what already passed.

## 1. Discover the app
- Connect via the Launchpad MCP. `find_application`, then `list_rules` / `get_rule` for: CaseTypes (stages, processes, steps), Personas/AccessGroups/AccessRoles, Portals and their pages, DataTypes, Agents (quick questions, data sources, tools), GenAIConnect rules and the Automations that call them, Integrations (DataConnections, REST connectors, Event triggers), Insights, Theme (colours, fonts, logo, favicon).
- Write `projects/<app>/app-brief.md`: facts only, each with the rule name/ID it came from. Include real UI labels (stage names, field labels, button labels, agent quick questions): they are the evidence for the page's vocabulary, not the vocabulary itself.
- **Verify every claim against rule bodies, not the app description.** An automation can be an empty stub; an "integration" can be an internal lookup; a feature named in the description can have no rule. Write the unsupported ones under "Do not claim".
- Add an **AI inventory** section (the core of an AI-first page). For each Agent, GenAIConnect and AI-calling automation: what goes in (case fields, attachments, data sources), what comes out (typed fields filled, structured response, chat answer), the tools it is limited to, where it runs in the lifecycle (stage/step), and the human step after it (assignment, approval, review checkbox). Search for automations that set the decision field themselves (e.g. an "Auto Approve" that sets `EvidenceSufficient = true`) and check where they are called: if they can skip the human step, "AI suggests, human decides" is false until shown otherwise. If an AI input is hard-coded demo wiring, any captured AI result is demo data: label it so. If the app has no AI at all, say so now (see `references/ai-first.md`, "No AI in the app").
- Add an **Enterprise value** section. Launchpad apps are sold to enterprises, so list the evidence for each pillar, with its source. Write "none found" where there is none, and never fill a gap with a guess:
  - **Cost:** manual work the app removes: automations, decisions and straight-through steps that replace hand-offs, SLAs, work queues and routing, prefilled or extracted fields, fewer systems to touch (integrations).
  - **Security / control:** personas and access roles, access policies (record-level), approval steps, audit trail or history views, authentication profiles, data that stays in the case.
  - **Scale:** the provider/subscriber model and Configuration Sets (one app serving many customers), work queues, bulk actions, integrations, data pages.
  - **Platform facts** (true of every Launchpad app, from the `launchpad-overview` skill, which the Launchpad MCP server provides; if it is not installed, ask the user for these facts or leave the platform line out): multi-tenant SaaS, managed scaling, role- and attribute-based access, and the platform's compliance posture (SOC 2, ISO 27001, GDPR, HIPAA). Mark them "platform" in the brief, word them on the page as buyer benefits without the platform name (see "Sell the app, not the platform"), and confirm with the user before any compliance line goes on the page. Word it precisely: SOC 2 and ISO 27001 are audited certifications; GDPR and HIPAA are laws with no official certification, so say "supports GDPR and HIPAA compliance", never "GDPR certified" or "HIPAA certified". Use the user's current wording from Pega's trust documentation when they have it.
- Add a **Page vocabulary** section as a two-column table: the rule term (case type, stage, persona, field) and the plain word the buyer uses for it ("Claim Request" case type → "claim"; stage "Assessor Review and Advice" → "Assessor checks"; persona "Claims Administrator" → "claims handler"; "Work Portal" → "in one place"). Keep the buyer's own domain terms (policy number, Pay with excess, loss adjuster, ombudsman); drop the platform's. Section headings, step names and feature names on the page come from the right-hand column.

## 2. Ask the user (one round, max ~5)
Only what the app cannot answer. Combine these into five questions or fewer, and state the default for each:
1. **Buyer and the old way.** Who is the visitor (role, industry, company size), and what do they use today (spreadsheets, email, a legacy tool, a competitor, a generic AI chatbot)? Default: from the case types and personas.
2. **The hero line.** Draft 2-3 hero headlines from the brief (see `references/page-blueprint.md`, Hero) and ask the user to pick one or edit it. Ask what proof they can stand behind: customer names or logos they may use, a quote with name and role, a pilot number. Nothing of this kind goes on the page without it; without it, the proof strip uses verified product and platform facts only.
3. **The differentiator and the one idea.** What this product does that the alternatives do not, and the one thing a visitor should remember. Default: the strongest AI-plus-human step in the AI inventory.
4. **CTA and destination.** The primary action ("Book a demo", "Talk to sales", "Start a trial", "Join the pilot") and its URL or email; a secondary action (default: "See how it works", an anchor to the lifecycle section). Never invent a URL: use `#contact` with a visible note until they give one.
5. **Screens, tone and look.** Name the key screens (the hero screen with the AI result on it, plus 3-5 feature screens) and ask which source to use (below). Tone (default: confident, plain, specific), the look level (default **Bold**: dark brand hero, oversized type, one signature device on every frame; **Calm** on request; see `references/look-and-motion.md`, "Bold by default"), and any brand rules beyond the Theme rule.

Append answers to `app-brief.md` under "Creative inputs".

For screenshots, offer these sources in preference order:
1. **App preview or subscriber link:** when a preview is needed, request one by calling the Launchpad MCP build tool (the tool that builds the app/branch and returns a Preview URL; find it in the MCP tool list) for the app and branch found in step 1, with the user's explicit OK per build. Building can take a while; wait for it to finish and use the URL it returns. If the build fails or returns no URL, report the reason and ask the user for an existing preview or subscriber link. Never construct a URL from an app ID, namespace, or guessed domain. Open it in the browser, let the user sign in manually, confirm the target screen, then capture it. Never ask for or handle credentials.
2. **User-supplied screenshots or recordings:** ask them to upload the screens they want featured, at full size (about 1400 px wide or more; 2400 px for the hero if they can). A short screen recording (5-15 s, one action, e.g. the AI result filling in, the stage advancing) makes the best hero or AI section: it becomes a muted, looping, captioned `<video>`.
3. **Adapted generic Launchpad screenshots:** only with the user's approval, adapt existing generic Launchpad captures to illustrate the app's use case. Label these as Illustrative on the page; do not invent metrics, records, or capabilities.
4. **Illustrative frames built from the rules** (when the user has no screens and asks for "rough visuals"): HTML/CSS frames, not images, that use the app's real field names and option values (in the buyer's words where a label is platform jargon; step names from the Page vocabulary) in the Theme look, with fictional example data ("Example Ltd", roles instead of names). Each carries a visible **Illustrative** tag; an agent conversation written from the Agent rule is labelled **Example answer**. Keep UI text at 13 px or more. List every one as an open item to replace with a real capture.
The user may choose a different source for different screens. If the preferred source is unavailable, ask before falling back. Do not capture or retain sensitive data; have the user navigate to a safe example before capture.

A build only compiles the current branch for Preview; it does not change rules. Subscriber URLs are different: they come from manual subscription provisioning by a Provider Administrator (see Subscriber Onboarding and Go-Live in the `launchpad-general` skill, provided by the Launchpad MCP server). Do not provision a Subscriber, create a subscription, publish, or change DNS to obtain screenshots.

## 3. Concepts
Write three different page concepts in words to `projects/<app>/CONCEPTS.md`, recommend one, and let the user pick (they may mix). Concepts differ in their **hero device** and story, not just colours. Each concept lists: hero headline and subhead (written out), the hero visual (which real screen or recording, and the AI moment on it), the interactive AI moment (see `references/ai-first.md`), the section order, the one idea, and the look direction (palette and type from the Theme rule, one sentence of mood).

Hero devices that suit Launchpad apps (pick three that fit this app's evidence):
- **Answer first:** the Agent answering one of its real quick questions on a real case, as the hero visual; the prompt chips below the headline are the agent's real quick questions.
- **Watch the work move:** the real lifecycle stage bar is the hero; the AI step and the human checkpoint are marked on it; scrolling advances the stages.
- **Before / after:** the old way in plain words (the visitor's current alternative, from step 2) beside the real screen where the AI result already sits.
- **One record, start to finish:** follow one real case from intake to resolution down the page, each section one stage, each with its real screen.
- **The decision, shown:** the AI's typed output (score, reason, extracted fields) blown up large from the real screen, with the reviewer's approve step next to it.

## 4. Spec and build
Write `projects/<app>/SPEC.md` with numbers, not adjectives: design tokens (hex values from the Theme rule or the screens shown, font stacks, type scale in px/clamp, spacing scale, radius, max widths, breakpoints), and per section: purpose, headline and body copy (final words), the real screen or crop used (file, crop box, display size at 1440 and 375 px), the source of every claim (rule name or "user, <date>"), layout, and motion (trigger, property, duration, easing, reduced-motion fallback).

Build the page in `projects/<app>/site/`:
```
site/
  index.html          semantic HTML, one <h1>, all copy final
  styles.css          tokens on :root, light (and dark if chosen) themes, mobile first
  main.js             small vanilla JS: AI replay, stage stepper, reveals; the page works without it
  llms.txt            plain-markdown summary of the product for AI assistants (see ai-first.md)
  assets/screens/     real screen crops (WebP or AVIF, plus a PNG fallback only if needed)
  assets/brand/       logo and favicon exported from the app
  assets/art/         2-4 original SVG drawings from the buyer's world (see look-and-motion.md, "Subject imagery")
  assets/og.png       1200x630 social card, a screenshot of the hero
  CREDITS.md          licence and source of every font, image and recording
```
Defaults: static files only, no framework, no build step, no external scripts, no analytics or tracking, no cookies, no live model calls and no API keys in the page. Fonts are self-hosted WOFF2 with an open licence (ask before downloading one) or a system stack. A framework port (Next.js, Astro, a CMS) or a live agent embed is a separate request after the static page is approved.

## 5. Check, review, preview
1. Run the checker after the last edit and fix every error:
   ```sh
   node <skill-dir>/scripts/check_site.mjs projects/<app>/site --json
   ```
   It checks structure and metadata, one `<h1>`, alt text and image sizes, local links and assets, external requests, banned words, platform jargon (Launchpad terms in the copy, JSON-LD, main.js strings and llms.txt; any "Launchpad" or "Pega"), leftover PLACEHOLDER and Illustrative labels, JSON-LD and `llms.txt`.
2. Serve the folder (`python3 -m http.server 4321 -d projects/<app>/site` or `npx --yes serve projects/<app>/site -l 4321`) and open it in the browser tool. Take full-page screenshots at 1440, 1024, 768 and 375 px wide (headless Chrome will not open a window narrower than about 500 px: for 375 and 768, load the page in a fixed-width `<iframe>` on a wrapper page and screenshot that), in light and dark if both exist, and with reduced motion on. Click through every interactive element (nav anchors, CTA, prompt chips, stage stepper) with the keyboard as well as the mouse.
3. Optional: `npx --yes lighthouse http://localhost:4321 --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=projects/<app>/lighthouse.json --chrome-flags="--headless"`. Target 90+ in each.
4. Write `projects/<app>/REVIEW.md` with P0/P1/P2 notes against the checklist below, fix P0 and P1, re-run the checker, then show the user the preview (desktop and phone screenshots plus the local URL) and list every placeholder and illustrative frame still on the page.
5. Publish or deploy only after the user approves the preview, only to the host they name, and say exactly what was published where.
6. To share the page as **one file** (email, chat, a drive), bundle it: `node <skill-dir>/scripts/bundle_single.mjs projects/<app>/site projects/<app>/<app>-homepage.html` inlines the CSS, JS, fonts and favicon as data URIs and drops the og:image and preload tags (they need a host). Open the result from `file://` and check that the fonts load and no request leaves the file. For a **claude.ai artifact**, publish a copy of `index.html` without the doctype/`<html>`/`<head>`/`<body>` wrapper and charset/viewport metas (the host adds them), with a 2-4 word `<title>`, the sticky nav at `top: env(safe-area-inset-top, 0px)`, and the other files passed alongside.

**Review checklist**
- Hero: an outcome headline (no app name, no "AI-powered" as the headline) that a visitor in the named role understands in 5 s; one primary CTA; a real screen with the AI moment visible without scrolling at 1440x900 and 375x812.
- AI: every AI line maps to an entry in the AI inventory; input → output → human step is shown for the lead AI feature; no banned AI words; the replay uses real captured content or is labelled Example.
- Proof: every logo, quote, number and certification has a source in the brief; no invented customers, ratings or metrics.
- Specific to this app: section headings use the page vocabulary; steps and labels trace to the rules; a page for another app could not reuse this copy unchanged.
- Buyer's language: search the copy (index.html, main.js, llms.txt, JSON-LD) for case type, data type, stage, persona, portal, work queue, access group, data model, automation, insight, Launchpad, Pega; each hit is P1 unless the user asked for a platform credit. No rule counts as proof.
- Real UI: every product visual is a real crop (or a labelled PLACEHOLDER / Illustrative frame) and is shown large: the hero screen spans at least 55% of the content width on desktop; feature crops at least 45%; nothing smaller than legible (UI text at least 12 CSS px after scaling).
- Look: tokens from the Theme rule or the screens shown; the Bold level unless the user chose Calm; 2-4 subject images from the buyer's world that never cross text; none of the banned looks; one accent colour used for the AI moment and the primary CTA.
- Accessibility: WCAG 2.2 AA contrast, visible focus, skip link, landmarks, keyboard-operable interactive parts, reduced-motion respected.
- Performance: budgets in `references/look-and-motion.md` met; hero image has width/height and `fetchpriority="high"`; other images lazy.
- Phone: no horizontal scroll at 375 px; screens re-cropped for phone rather than shrunk.

## Gotchas (learned)
- Verify every claim against rule bodies, not the app description (an automation can be an empty stub; "integrated systems" can be internal lookups; a feature can have no rule). Check demo wiring (hard-coded URLs, constant values) before presenting a feature as real.
- Runtime UI is behind sign-in: name each needed screen and ask which screenshot source to use. Mark placeholders as PLACEHOLDER and any adapted/mock screen or invented example data as Illustrative, on the page itself.
- Preview URL: the Launchpad MCP `build` tool (needs the user's explicit OK per build) returns `previewURL` and `newPreviewGatewayUrl`. Open the `newPreviewGatewayUrl` (`.../preview-jobs/<id>`) in the browser; the bare `previewURL` returns a 400. It redirects to the Pega sign-in: the user signs in manually. The app runs in an iframe inside a preview shell, so page-reading tools (accessibility tree, page text) cannot see inside it; drive it with coordinate clicks (screenshots can lag one call, so wait ~2 s before looking).
- Capture size: the built-in browser pane returns screenshots at about 800 px wide even with a 1920x1080 emulated viewport, too soft for a hero. Widen the pane first or find a full-resolution capture route. In practice the user's own full-size screenshots (about 1400-1500 px wide) were the working route: ask for them early, one per named screen. A 1400 px capture is sharp at up to about 700 CSS px on retina screens; for a wider hero, crop tighter rather than upscale.
- Using supplied screenshots: crop to one card/panel/table per section (PIL `Image.crop`; run plain `python3`, not `-I`, to get PIL). Paint over tooltips and cursors with sampled neighbouring pixels. Show no personal names (use tables without owner columns, or crop them out). Never edit the numbers or text in a screenshot. Export WebP (quality ~82) at 1x and 2x and serve with `srcset`.
- Screens must agree: do not put two screens on one page if their data contradicts (an Agent answer about a different case than the one shown) or if they come from different environments/themes. Drop the odd one out.
- Theme: screenshots from the user's environment may use a different theme than the Theme rule on `main` (one app had teal in the rule and gold in the user's screens). Take the page palette from the screens that will be shown, and say so in the reply.
- Headline words are claims. Pick words the real screens support (a stage bar shows progress; do not fake completed stages, scores or green chips). An empty AI panel ("No" / "--") shows the feature exists, not a result: say so in REVIEW.md and ask for a populated capture.
- Theme rule gives palette, font, logo name. The brand font may not be freely licensed and a download needs the user's OK; the logo and favicon must be exported from the app.

- The built-in browser pane can stall animation frames and its screenshots can fail; its JS tool stays reliable for checks (`document.documentElement.scrollWidth` at 375, element positions, `aria-*` state after clicks). Use it for overflow and interaction checks, and headless Chrome for the review screenshots.
- Restyles break things the first build had right: after any look change re-check the phone width, the hero at 1440x900, the AI replay end state, and contrast on every new ground.

## Rules
- Specific, not generic: the page is built from this app's rules, labels, screens and the user's words. Never ship template copy.
- Real UI, never a mockup. Missing screens are labelled placeholders at their final size and reported to the user. Adapted generic Launchpad screens only when the user chooses that source, visibly labelled Illustrative. Never a made-up dashboard.
- No invented metrics, customers, logos, testimonials, ratings or capabilities; every fact on the page traces to the app or the user.
- AI-first and honest: the AI is the lead of the story, shown as a defined step (input → typed result → human review) wherever the rules show that wiring; never "autonomous", "magic", or "replaces your team"; never claim AI the app does not have.
- Sell to the enterprise buyer: outcome first, then why it is safe to buy (cost, control, scale), each line sourced.
- No credentials, keys, tracking or live model calls in the page. Licensed fonts and media only, recorded in `site/CREDITS.md`.
- Do not publish or deploy without the user's approval of the preview.
