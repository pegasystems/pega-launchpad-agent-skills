# Page blueprint

The default section order for a Launchpad app home page. Keep the order unless the chosen concept needs another; drop any section whose evidence is "none found". Every section names its content source in `SPEC.md`.

| # | Section | Job | Content source |
| --- | --- | --- | --- |
| 1 | Nav | Orient, one CTA always in reach | Theme logo; 3-5 anchors to sections below; primary CTA |
| 2 | Hero | Outcome + the AI working in the real product | User's hero line; AI inventory; hero screen |
| 3 | Proof strip | Why trust it, right under the CTA | User-supplied proof, else verified product and platform facts |
| 4 | The old way | Name the pain and today's alternative | User's words (step 2, question 1) |
| 5 | How it works | The workflow in plain steps, AI step and human checkpoint marked | CaseType stages and processes, renamed in the buyer's words |
| 6 | AI at work | The lead AI feature as input → result → review, plus the interactive AI moment | AI inventory; real screens |
| 7 | Features | 3-5 verbs in the real UI | Actions and screens, in the buyer's words |
| 8 | For each team | What each role gets | Personas and their assignments, named as real job roles |
| 9 | Enterprise-ready | Cost, control, scale, platform | Enterprise value section of the brief |
| 10 | Connects to | Real integrations only | DataConnections / REST connectors / Event triggers |
| 11 | FAQ | Answer the buyer's doubts, especially about the AI | Brief facts |
| 12 | Closing CTA | Answer the hero, repeat the action | Hero line, CTA |
| 13 | Footer | Mark, contact, legal line (no platform name unless the user asks) | Theme logo; user |

## 1. Nav
- Logo from the Theme rule (left), 3-5 anchors named with page vocabulary ("How it works", "AI at work", "For teams", "Security", "FAQ"), primary CTA button (right). Sticky with a solid background and a 1 px bottom border once scrolled; no glass blur.
- Phone: logo + CTA + a menu button that opens a full-width sheet; the menu is a real `<button aria-expanded>`.

## 2. Hero
- **Headline** (`<h1>`): the outcome, at most about 10 words, in the visitor's words. Patterns:
  - Question: "Want faster and more accurate audits?"
  - Two goals that usually trade off: "Close audits faster WITHOUT losing control." Set the joining word (WHILE, AND, WITHOUT) in the accent colour or another weight.
  - What if: "What if every claim was triaged before you opened it?"
  - Pain flip: "Still chasing approvals by email?"
  - Outcome statement: "Every control, checked before your reviewer opens it."
  Never the app name, a feature name or "AI-powered X" as the headline; no number unless the user supplied it.
- **Subhead** (at most about 25 words): who it is for + what the app does + the AI's job in one clause. E.g. "For compliance teams running SOC 2 and ISO 27001 audits. AI checks each evidence file against its control; your reviewers make the call."
- **CTAs:** one primary (the user's action) and one secondary (default "See how it works" → `#how-it-works`). Nothing else competes with them in the hero.
- **Hero visual:** the real screen (or recording) where the AI result sits, large: at least 55% of the content width on desktop, allowed to bleed off the right or bottom edge. The AI moment on it (the agent answer, the AI score field) is highlighted with the accent: an outline, a lifted crop at 1.1-1.25x, or a short caption pinned to it ("AI score and reason, filled from the evidence file"). A minimal browser frame is fine; no tilted 3D, no floating phone mock-ups of a desktop app.
- **Prompt chips (AI-first concepts):** directly under the subhead or on the hero visual, 2-4 chips with the Agent's real quick questions. Each plays the replay (see `ai-first.md`).
- Above the fold at 1440x900 and 375x812: headline, subhead, primary CTA and the AI moment. On phone the visual sits under the CTAs, re-cropped to the AI panel.

## 3. Proof strip
- In order of strength, only what the user supplied or the brief verifies: a named customer quote with role and outcome; customer logos the user may use; a pilot number with its source; then product facts the buyer cares about, in their words ("6 kinds of claim, from motor to travel", "5 steps from first notice to payout", "0 claims decided by AI"), and compliance badges only as confirmed by the user. Never counts of rules or platform objects (case types, personas, notifications, insights), and no platform line here.
- Never a logo wall of companies that are not customers, star ratings, review badges or "trusted by thousands".

## 4. The old way
- Label it as the problem ("Today:" or "Without <product>:") so it is never read as a feature.
- 2-3 short pains in the user's words, naming the current alternative (spreadsheets, email threads, a legacy tool, a generic chatbot with no process behind it). Type-led; no fake screenshots of the old tool. A muted ground or a strike-through motif sets it apart.

## 5. How it works
- The real stages, in order, as a horizontal rail (vertical on phone), each renamed to a short plain step ("Claim in", "First look", "Assessor checks", "Decision", "Outcome sent") with one line from the stage's purpose. Call them steps, never stages. Mark the AI step(s) with the accent and a small "AI" label, and the human checkpoint(s) with a person/check mark and the role.
- Optional interaction: a stepper (buttons or scroll) that advances one step at a time and swaps the real screen for that step. Works without JS as a plain ordered list.
- Alternate paths (Withdrawn, Rejected) can appear as a footnote, not the main line.

## 6. AI at work
- Lead AI feature as three steps side by side (stacked on phone): **Reads** (the inputs) → **Returns** (the typed outputs, shown as the real fields from the screen) → **Your team decides** (the human step, with the persona). Use the third step only if the rules show the review; otherwise describe what happens next truthfully.
- The interactive AI moment (replay, before/after slider or stepper) lives here or in the hero; see `ai-first.md`.
- Other AI features: one row each with the same in → out → review grammar, shorter.
- A "Guardrails" line set: tools the agent is limited to, the data it can see, where results are recorded. Only lines the AI inventory supports.

## 7. Features
- 3-5 features, each a verb headline from the page vocabulary ("Fan out every control", "Attach evidence once", "See who owes what"; never a platform noun such as "Six case types, one portal"), one or two sentences, and a real screen crop. Alternate 60/40 splits (screen left, then right) with crops that bleed to the section edge; or one large real crop with 2-3 callouts pinned to real elements.
- Not three identical icon cards in a row; not an empty bento grid. A bento layout is acceptable only when every tile holds a real crop or a real fact.

## 8. For each team
- One tab or column per role from the app (e.g. "Compliance officer", "Control owner", "Auditor"), each with 2-3 things that person does (from their assignments) and the screen they see. Use the job titles the buyer uses; never "persona", "work queue" or "access group".

## 9. Enterprise-ready
- Up to four short blocks, written as what the buyer gets: **Less work** (work removed: "told at each step, without anyone sending an email"), **Control** ("everyone sees only what their role allows", named decisions, history), **On file / scale** (records kept together, room to grow), **Run for you** (hosted and maintained, no servers to look after; compliance posture as confirmed). The platform facts back these lines; the platform name is not their subject. Each line traces to the Enterprise value section; a pillar with "none found" stays out.

## 10. Connects to
- Only real external integrations from the rules (REST connectors, event triggers, boosters that are installed), named by system. Internal lookups are not integrations. If there are none, omit the section; never show logos of systems the app does not connect to.

## 11. FAQ
- 4-6 questions in the buyer's voice, answered from the brief. Always include one AI question when the app has AI ("Does the AI make the decision?", "What data does the AI see?") and answer it with the wiring. Use `<details>`/`<summary>` so it works without JS; mirror it in JSON-LD `FAQPage` only if the answers are visible on the page.

## 12. Closing CTA
- A full-width band in the brand colour that answers the hero ("Audits, done right the first time.") and repeats the primary CTA. If the user gave a contact route, show it here too.

## 13. Footer
- App mark, short line on what it is, the user's contact or legal lines, copyright as the user words it. No platform name by default; a "Built on Pega Launchpad" credit goes here only if the user asks for one. No social icons or legal links the user did not give; leave a visible note if a privacy or terms link is needed before publishing.

## Copy rules
- Headlines at most about 8 words except the hero; body sentences under about 20 words; plain verbs.
- **Translate, don't transcribe.** The rules tell you what is true; the buyer's words tell you how to say it. Use the Page vocabulary's plain column: lower-case nouns ("a claim", not "a Claim Request case"), short step names, real job titles. Keep field option values and domain terms the buyer already uses ("Pay with excess", "Policy number"). Never: case type, data type, stage, persona, portal, work queue, access group, data model, record type, automation, rule, insight, "scoped to", or a rule name in Title Case. Test: would someone on the buyer's team say this sentence out loud?
- Banned words (the checker flags them): unlock, seamless(ly), supercharge, game-changer/game-changing, revolutionize, effortless(ly), cutting-edge, next-gen(eration), harness the power, magic(al), autonomous, "in seconds" (unless measured), leverage (as a verb), empower, synergy, world-class, best-in-class.
- Numbers only from the user or the rules, and only ones the buyer cares about (steps from first notice to payout, kinds of claim handled, a field scale such as "0-100 match score"). Never a count of platform objects (notifications, insights, personas, data types).
