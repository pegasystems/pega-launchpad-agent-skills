---
name: launchpad-learning-course
description: Generates a personalized, interactive Launchpad learning course as a local web app (no server, no dependencies), grounded in the user's own Launchpad application. It reads the app's real rules through the Launchpad authoring MCP and teaches 8 modules (mental model, case lifecycle, data model, business logic, personas/access/routing, UX, rule resolution/overrides, team workflow and first change). Each module has analogies tailored to the learner's background, real rule JSON, Studio hands-on steps, self-grading quizzes, and "Found in your app" observations. Use when someone says they are new to Launchpad and asks for a tutorial, course, onboarding, learning path, training, or "teach me Launchpad using our app", or asks to generate or regenerate such a course for a specific application. Read-only on the Launchpad app.
---

# Launchpad Learning Course Generator

Builds a self-contained course in `<workspace>/launchpad-learn-<app-slug>/`: `index.html` (the shell, copied from `template/`) plus `course.js` (content you write). The learner opens `index.html` in a browser.

**Worked example:** `example-loan-ranger/course.js`, an 8-module course built for Loan Ranger for a Python/web developer. Read it before writing. Match its depth, tone and section mix, but **never copy its app-specific facts** into another app's course.
**Schema:** `course-schema.md`. **Validator:** `scripts/check-course.js`.

## Hard rules
0. **Ask the learner's background first (Step 0), every time, before any research.** Never infer it from memory or from earlier courses.
1. **Read-only.** Use only `find_application`, `list_branches`, `list_rules`, `search_rules`, `get_rule`, `fetch_data`, `get_workspace_changes` and `get_changes`. Never create, edit, delete, override or build rules while generating a course.
2. **Every app fact comes from a tool result in this session.** That covers names, counts, JSON, routing and gaps. If you didn't read it, don't claim it. Use `callout kind:"found"` only for these verified observations. General Launchpad concepts come from the `launchpad-general` skill and the topic skills listed below, not from memory.
3. **Frame gaps as questions for the team** ("ask the team before you fix it"), never as verdicts. Apps generated from a blueprint often contain intentional scaffolding.
4. **No personal data in the course.** Strip emails, `updatedBy`, `UpdatedBy`, `TenantID`, `isolationID` and rule UUIDs from JSON excerpts. The validator fails on email addresses.
5. **Trim JSON to what teaches.** Keep `Type`, `RuleResolutionID`, `AppliesTo` and the fields under discussion. Drop repeated `Namespace` keys when they equal the app namespace. Write `"…"` for elided list items.
6. **Ask before overwriting** an existing course folder.
7. **Tool-neutral course content.** Never name a specific AI assistant or product (no "ask Claude", "Copy for Claude", "Claude Code"). Hands-on work happens in **Launchpad Studio** (the default), or in **"your Launchpad-connected agent"**, meaning whatever agent harness the learner already has configured with the Launchpad authoring MCP. Agent prompts are optional extras next to a Studio path, never the only way to do a step. When the course explains MCP behaviour, describe it generically ("the agent must ask you before it runs a build").

## Step 0: Always ask for the learner's background first
**Before any research call (including `find_application`) and before writing anything, ask the learner about their background, using your assistant's question tool if it has one (otherwise ask in chat).** Do this every time, even when:
- the request already hints at a background,
- memory or an earlier course records one (the machine or account may be shared, and the learner may be generating the course for someone else), or
- you are regenerating a course.

If the request states the background explicitly (e.g. "I'm a Java developer"), still ask, and offer the stated background as the first option so the learner can confirm it quickly.

Ask a single question, header `Background`: *"What's your (or the learner's) programming background? I'll tailor the analogies, code translations and depth to it."* Offer these options:
1. **Web developer** (Python / JavaScript / TypeScript): analogies to ORMs, state machines, REST, React; Python or JS translations in `<pre class='py'>` blocks.
2. **Java / .NET developer**: analogies to classes, interfaces, Spring/ASP.NET, enterprise patterns; Java or C# translations.
3. **Pega Infinity developer**: map each Launchpad concept to its nearest Infinity equivalent (case types, flows, data pages, rulesets, access groups), and call out where Launchpad **differs**: no circumstancing, directed-only inheritance, namespaces instead of rulesets, overrides that survive upgrades. Teach Launchpad on its own terms and use Infinity only as the analogy.
4. **Non-technical** (business analyst, product owner, tester, process owner): plain-English analogies (org charts, checklists, forms, approval chains), no code translations, lighter JSON with every field explained, and more emphasis on designers than on rule JSON.

The learner can choose "Other" to describe a different or mixed background (e.g. "low-code from another platform", "data engineer"). Adapt to that answer.

The answer drives the analogy column, the code translations, how much JSON each module shows, and the course `title` and `audience`. Don't start Step 1 until you have it.

## Step 1: App and branch (ask only for what's missing)
- **App**: if the MCP is connected to one app or memory names one, use it. Otherwise `find_application` and confirm.
- **Branch**: `list_branches`. Run `list_rules ruleType:"CaseType"` on `main` **and** on active branches. Teach from the branch that has the app's content (rules in the app's namespace). If `main` only has `PegaPlatform` rules, record that as the `app.note` observation.

## Step 2: Research (≈25–40 reads; run independent calls in parallel)
Pick one **anchor case type**: the core Case-category workflow, usually the one with the most stages and processes. Use it as the running example in every module.

| Module | Reads | What to look for |
|---|---|---|
| 1 Mental model | `list_rules CaseType`. `get_rule` the anchor case type. `get_rule` other CaseTypes if Category (Case/Data/Persona) is unclear from the name. | Case, Data and Persona lists. Primary and alternate stages with `Transition`. `IDPrefixExpression`. `PrimaryFields`. Platform rules it references (e.g. `IsCaseOpen`). Surprises such as an alternate "Denied" stage that is `Manual` rather than `Resolution`. |
| 2 Lifecycle | `get_rule` 1–2 Stage rules (`search_rules types:"Stage"`). `search_rules types:"Process" path_query:["AppliesTo/ReferenceID"] value_regex:"^<AnchorClass>$"`. `get_rule` a process containing a `Process-Decision`, and one containing an `Assignment` (`path_query:["Nodes/[]/Type"] value_regex:"^Assignment$"`). | Node types, outcome connectors, Change Stage targets, Assignment `Action` and `Routing`. Outcome paths that end without human work or go to unexpected stages. |
| 3 Data model | `search_rules types:"Field"` on the anchor class. `get_rule` one plain field and one calculated field (`path_query:["IsCalculated"] value_regex:"true"`). `search_rules types:"DataPage" query:"<AnchorClass>"`, then `get_rule` one. | Field count, calculated fields and the Decision behind them, likely duplicates (same Name, or an ID with a `2` suffix), list vs lookup data pages, the DataConnection chain. |
| 4 Logic | `list_rules Decision` and `list_rules Automation` (use `total` for counts). `get_rule` 1 Decision (prefer Table or Expression logic) and 1–2 Automations wired into the anchor process. | Translate a Decision to the learner's language. Look for stub automations (no steps, empty `Inputs`) and same-named rules in different `AppliesTo` classes (a scoping lesson). |
| 5 Access | `list_rules AccessGroup`, then `get_rule` one business persona's group. Reuse the Assignment `Routing` from M2. | Roles, available and default portals, work queues. Odd defaults (e.g. a back-office persona landing in the Occasional user portal). `EnableGetNextWork`. |
| 6 UX | `list_rules Portal`, then `get_rule` the main work portal. The anchor's `Display` and `PrimaryFields`. | Nav pages (platform pages mixed with app pages), `AvailableCaseToCreate`, UX rules in workspace changes. |
| 7 Resolution | `get_workspace_changes` and `get_changes` on the branch. | Rules whose `Namespace` is `PegaPlatform` but which live in the app's changes: real overrides (e.g. `pyReview` on the anchor class, portal home views). |
| 8 Workflow | Reuse the workspace and branch changes. Check the available skills for any app-specific playbooks. | Draft count and types, AI-assisted flags, 3–4 concrete **first contributions** built from findings in M2–M4 (stub automation, missing human review, duplicates, an existing playbook skill). |

Skill references for concept accuracy (load as needed, don't dump them into the course): `launchpad-general` (rules, layers, Cases/Data/Personas, release is human-only), `launchpad-workflow-modeling`, `launchpad-datamodel-datapage`, `launchpad-decisions`, `launchpad-datamodel-user-personas`, `launchpad-security`, `launchpad-user-experience`.

Platform facts for Module 7:
- Launchpad has directed class inheritance only. Each Class rule names its parent.
- A case type class can have intermediate parent classes to any depth, until one extends `Case`.
- There is no circumstancing. Model situational variants with runtime Decisions.
- Subscriber Configuration Set changes are overrides that survive upgrades.
- An override keeps the source rule's namespace.

Teach Launchpad on its own terms. Use other platforms (Pega Infinity included) only as analogies for learners who know them.

## Step 3: Write `course.js`
Follow `course-schema.md`. Per module:
- 1 analogy table (Launchpad concept ↔ learner-world concept)
- 1–3 `code` sections of **real trimmed rule JSON** with notes
- 0–2 `found` callouts
- 1 `handson` section with Studio navigation (designers first: Cases, Data & Integrations, Personas, Insights, App Settings. Then the Rules Library by category). Optionally add a sample prompt the learner can try in their Launchpad-connected agent, e.g. *"Which rules reference HomeType2?"*
- 3–4 quiz questions

Quiz guidance:
- Questions should test **reading the learner's own app** ("which stage does a Denied case go to?") and **choosing the right concept** (`classify` into Case/Data/Persona, Decision/Automation/Validation, Portal/View/Theme, and so on).
- Make wrong options plausible, and give every option a `why`.
- Include 25–40 glossary terms.
- Module 8 always ends with a "Your first change" handson: plan → review → edit in branch (in Studio, or through their Launchpad-connected agent after reviewing its plan) → build/preview (an agent must ask before building) → test the preview → commit/merge per team process.

## Step 4: Assemble, verify, launch
1. `mkdir <workspace>/launchpad-learn-<app-slug>`. Copy `template/index.html` there unchanged. Write `course.js` there.
2. `node <skill>/scripts/check-course.js <dir>/course.js`. Fix all errors. Warnings are acceptable only with a reason (e.g. M8 has no rule JSON).
3. Render check (Windows): headless Edge `msedge --headless=new --window-size=1400,1800 --screenshot=<tmp>/home.png "file:///<dir>/index.html#home"`, and again for `#m2`. Read the PNGs to confirm the page renders. On macOS or Linux, use Chrome or Chromium with the same flags.
4. Open it for the user (`cmd //c start "" "<dir>\index.html"` on Windows, `open` on macOS, `xdg-open` on Linux).
5. Reply briefly with:
   - the path
   - what's inside (a module table with the real example each module uses)
   - the "Found in your app" items worth raising with the team
   - a note that each module's "Copy my notes" button bundles their quiz results and questions, to share with the team or paste back into this conversation for follow-ups. They can also start a first real change from here, which then follows `launchpad-plan-and-build`.
6. Optionally save a project memory noting the course location and the learner's background, so later sessions can continue the tutorial.

## Iterating
- The learner pastes "Copy my notes" output. Answer their questions and correct misconceptions. If a module was unclear, edit its sections in `course.js` and tell them to refresh. Progress is stored in localStorage per app name and survives content edits, but changing question IDs resets those questions.
- If they want a deeper dive, append a module (`num` 9+) with the same structure.
