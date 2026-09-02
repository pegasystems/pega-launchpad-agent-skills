# Flow 03 — Recommend the best UX

Goal: turn the request + context snapshot into a concrete, confirmed component design.

## Steps

1. **Validate the request against real data.**
   - Confirm the fields/relationships the request needs exist in the snapshot.
   - If something is missing, propose the closest existing field or a small model change.

2. **HARD GATE — check OOTB Constellation templates/widgets & Boosters BEFORE proposing
   custom.** Constellation/Launchpad ships many out-of-the-box templates and widgets an author
   configures in Studio with **no custom code** (see the OOTB catalog in
   `launchpad-views-ui-rules.md`). Match the request against that catalog first:
   - If an OOTB template/widget covers it (e.g. a **"card gallery" → the OOTB Card Gallery
     template**; "table/list" → Table; "tabs" → Tabs; "timeline" → Timeline; etc.), **or** a
     UX Booster (https://launchpad.io/ux-boosters) satisfies the need, **recommend that and do
     NOT build a custom component.** Tell the user plainly that the capability already exists
     OOTB and offer to guide them through configuring it.
   - Only proceed to a custom DXCB component when the user **confirms** no OOTB template/widget
     or Booster meets the need (or names a specific gap OOTB can't cover). Never silently build
     custom for something that has an OOTB equivalent (Card Gallery is the canonical example —
     never hand-build a "card gallery" Widget).

3. **Choose type & subtype** using the data + placement:
   - Field (with subtype), Widget (`PAGE` / `CASE` / both), or Template (`DETAILS` / `FORM` / `PAGE`).
   - See `launchpad-data-model.md` and `launchpad-views-ui-rules.md`.
   - **Never ask the user to pick the type with an open, unopinionated question.** Always
     decide the best-fit type/subtype yourself first, then present it as a **recommendation
     with reasoning** (see step 6). Base the reasoning on: what the component must do
     (display vs. edit vs. single-field), **where it must render** (in-form vs. utilities
     pane vs. dashboard/landing), whether it must reflect **live in-progress edits** (favors
     Template/Field in form context) vs. **saved/committed data** (favors Widget, often via a
     data page), and how the author will place/discover it (widget picker vs. view layout
     picker vs. field Display-as).

4. **Map fields to Cosmos controls** (Cosmos-first; see `launchpad-data-model.md` table and
   `references/knowledge/frontend-packages.md` for the package priority order).

5. **Identify the closest gallery example** for the chosen type/subtype at
   `https://github.com/pegasystems/constellation-ui-gallery/tree/master/src/components`
   (`master` branch) — this becomes the base that flow 05 adapts. Prefer components marked
   supported in the Build Guide's **Launchpad Support** column. See
   `references/knowledge/constellation-gallery.md`.

6. **Present a recommendation with reasoning, then the configuration snapshot**, and get
   explicit confirmation. The message MUST include:
   - **Recommended type & subtype** (e.g. "Template / `DETAILS`") stated up front.
   - **Why** — 2–4 concise reasons tied to the request: behavior, render location, live-vs-
     saved data, and where the author will find/place it in Studio.
   - **Trade-off / alternative** — name the next-best type and what you'd gain/lose by it
     (e.g. "A Widget would be easier to drop in via *Add widget*, but it sits outside the
     form context so it reflects saved values, not keystroke-by-keystroke edits.").
   - **Configuration snapshot** — target case/class, bound fields, placement, key props.
   - Then ask the user to confirm or override the recommendation.

## Output

A confirmed design spec that flow 05 will implement and flow 04 will scaffold for.

## Guardrails

- **When the component type is in question, always lead with a recommendation and its
  reasoning** — never ask an open "Field, Widget, or Template?" without stating what you
  recommend and why, plus the trade-off of the alternative.
- Recommend the **simplest** option that meets the need.
- Do not proceed to scaffold/generate until the user confirms the design.
