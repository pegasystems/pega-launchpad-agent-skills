# AI-first, honestly

"AI-first" on these pages does not mean an AI badge or a sparkle icon. It means four things, all built from the AI inventory in `app-brief.md`.

## 1. The AI leads the story
- The hero shows the app's real AI step in the real UI: the Agent answering a real quick question, or the typed AI result (score, reason, extracted fields, draft) on the case screen. The visitor sees what the AI does in the first screen.
- The headline is still the visitor's outcome; the AI is how they get it, said in the subhead in one clause ("AI checks each evidence file against its control").
- Pick the AI feature with the strongest wiring (structured output + human review + a populated capture) as the lead. One lead; others follow in "AI at work".

## 2. The AI is shown as a defined step
Enterprises buy AI they can control. For the lead feature, show:
- **Reads:** the inputs from the rule (case fields, attachments, the data source the agent is limited to).
- **Returns:** the typed outputs, shown as the real fields on the real screen (e.g. "AI Score 0-100", "Reason"), and the scale or schema if the prompt defines one.
- **Your team decides:** the human step after it (assignment, approval, review checkbox) with the role (the job title the buyer uses), only if a rule shows it after the AI step. If an automation can skip it (an auto-approve that does not depend on the AI output), do not claim it; describe what really happens.
- **On the record:** history or audit views, only if the brief shows them.

Good lines (use only with that wiring): "AI drafts. Your team approves." "Same inputs, same checks, every case." "Every AI step on the record." "The agent only sees this audit and its controls."
Never: "autonomous", "magic", "replaces your team", "thinks like an expert", accuracy or time-saved figures the user did not supply, the model name as a selling point (mention it only in an FAQ answer, and only if the user wants it).

## 3. One interactive AI moment
A static page cannot run the app's AI, and must not call a model or hold a key. Pick one of these, built with plain HTML first and enhanced with `main.js`:
- **Agent replay:** a prompt box with the agent's real quick questions as chips. If a quick question uses platform terms ("What are the case and data types available?"), reword it the way the buyer would ask ("What can I submit here?") and note the change in REVIEW.md; the answer lists things in the buyer's words too. Clicking a chip (or pressing Enter on it) shows the question, a short "thinking" state (at most 600 ms), then reveals the answer in chunks of a few words (total at most ~2.5 s). The answer text is a **real captured answer** from the app (copied from a screenshot or the user's session), with personal names replaced by role names. If no real answer is available, write one from the rule's described behaviour, label it "Example answer" visibly, and say so in REVIEW.md. Without JS, the questions and answers render as a plain list.
- **Before / after:** a slider or toggle between two real captures of the same record: the AI field empty, then filled. Keyboard-operable (`<input type="range">` or two buttons), with the "after" image as the default without JS.
- **Stage stepper:** the lifecycle rail where each step swaps in its real screen and the AI step plays its before/after. Works as an ordered list of figures without JS.
- **Muted recording:** a 5-15 s screen recording of the AI step as `<video muted playsinline loop preload="metadata">` with a poster, a visible pause button, and a caption; autoplay only when reduced motion is not requested.

Interaction rules: a live region (`aria-live="polite"`) announces the replayed answer once; nothing auto-plays in a loop that cannot be paused; reduced motion shows the final state immediately; no fake cursor and no typed value the captures do not show.

## 4. Readable by AI assistants
Visitors increasingly ask an assistant about a product before they visit. Give assistants an accurate, sourced summary:
- **`llms.txt`** at the site root, per the community proposal at https://llmstxt.org (a proposal, not a standard, with no proven effect on AI citations; it is cheap and harmless). Format: `# <Product name>`, a one-paragraph `>` summary, then `##` sections ("What it does", "How it works", "AI features and their limits", "Security and platform", "Contact") with short bullet facts from the brief and links to the page anchors. Same facts as the page, nothing extra.
- **JSON-LD** in `index.html`: `SoftwareApplication` (name, description, applicationCategory "BusinessApplication", operatingSystem "Web", url only if the user gave a domain, `offers` only if the user gave pricing) and `FAQPage` when the FAQ is on the page. Never `aggregateRating` or `review` without real, user-supplied data.
- **Semantic HTML:** one `<h1>`, ordered headings, `<section>` with `aria-labelledby`, descriptive alt text that says what the screen proves ("Control assessment with AI score 92 and reason 'Event logs satisfy this control'"), real text (not text baked into images).

## No AI in the app
If the AI inventory is empty, tell the user at the end of step 1, before the question round, and offer:
1. A page led by the workflow (concept "Watch the work move" or "One record, start to finish"), with the AI section and AI lines removed. Still modern; just not claiming AI.
2. Add an AI feature to the app first (an Agent or a GenAIConnect step; see the `launchpad-using-ai` and `launchpad-build-gen-ai-connect` skills), then build the page.
Never fill the gap with platform AI (Launchpad's own build-time AI is for builders, not the app's users) or with generic AI promises.
