---
name: launchpad-ux-custom-frontend
description: "Guide for building a fully custom front-end application on top of Pega Launchpad's DX (Digital Experience) REST APIs — no Pega React SDK, no Constellation rendering, no pega-embed web component. Use this skill whenever a user wants a bespoke UI (their own framework, components, and design) driven by raw DX API calls, especially when they can supply screenshots, wireframes, or mockups the UI should match. Do not use this skill for the Pega React SDK/Constellation approach, and do not use it for the pega-embed web component — use the dedicated skills for those."
tags: [dx-api, frontend, custom-ui, react, screenshots, wireframes, oauth, pkce, rest]
---

# Building a Custom Front-End on Pega Launchpad DX APIs

A practical guide for building a **fully custom** UI — your own components, your own styling, your own framework — that talks directly to Launchpad's DX REST APIs. There is no Constellation engine, no `PCore`, and no Pega-rendered views here: every screen, form, and interaction is code you write, calling the DX endpoints described in the [launchpad-dx-apis](../launchpad-dx-apis/SKILL.md) skill.

Use this approach when the business needs a UI that looks and behaves exactly like a provided design (screenshots, wireframes, Figma exports, a competitor app, brand guidelines) and Constellation's theming isn't enough to achieve that fidelity.

> **Not the right skill?** If the goal is to keep Pega's own rendering (Constellation views, OOTB components, out-of-the-box landing pages) and only customize branding/theming, prefer Launchpad's built-in theming — a fully custom front-end is more effort to build and maintain. If the goal is to embed a single Pega view/flow into an existing page via the `<pega-embed>` web component, use the [launchpad-webembed](../launchpad-webembed/SKILL.md) skill instead. This skill is for teams that want **zero Pega-rendered UI** — every pixel is custom, sourced only from DX API data.

---

## 0. Workflow (follow in order)

1. **Gather requirements** — tech stack/styling preferences, case types/data objects, which data views back which pages (§1).
2. **Request and analyze screenshots or wireframes** of the desired UI before writing any code (§2). This is what drives the component/page plan.
3. **Gather Launchpad connection details** and set up authentication (§3).
4. **Confirm the design → DX API mapping** with the user (§2.3) before scaffolding.
5. **Scaffold the app**: API client/service layer, then pages/components styled to match the provided designs (§4–§6).
6. **Wire up actions** (create case, submit assignment/case actions, attachments, followers, pulse) using `If-Match`/ETag correctly (§7).

Do not skip step 2. Building a "custom" front-end without first seeing what it should look like leads to generic UI that has to be redone.

---

## 1. Requirements to Gather from the Developer

Ask directly — do not assume:

1. **Tech stack and styling** — framework (React/Next.js, plain Node + HTML, Vue, etc.), language (TypeScript vs JavaScript), and styling approach (Tailwind CSS by default if unspecified, a component library, or plain CSS).
2. **Case type(s) / data object(s)** the UI needs to create or work with (`caseTypeID` / `objectTypeID`).
3. **Which data views power which landing/list pages**, and which fields each should display.
4. **What folder** to generate the application into — ask, never assume.

---

## 2. Request and Analyze Screenshots / Wireframes

Before scaffolding any code, **ask the user for sample screenshots, wireframes, or mockups** of the front-end they want. Phrase it directly, e.g.: *"Do you have any screenshots, wireframes, or design mockups of how you'd like this to look? Please drop the image file(s) into the workspace and point me to them."*

If the user has no visuals, proceed without them but say so explicitly, and default to a clean, minimal layout (Tailwind by default) rather than guessing at a specific brand look.

### 2.1 Analyzing provided images

Once the user supplies image file(s) in the workspace, view them directly (the image-viewing tool) and extract:

- **Screens/pages present** — e.g., a landing/dashboard list, a case detail view, a create-case form, an assignment/approval form, an attachments or comments panel.
- **Layout structure** — header/nav placement, sidebar vs top nav, grid vs list, card-based vs table-based, number of columns.
- **Components** — tables, cards, tabs, stepper/progress indicators, modals, buttons (primary/secondary), form field types (text, select, date, textarea, checkbox), badges/status chips.
- **Visual design system** — brand colors (primary, accent, background, text), typography (font family/weights if legible), spacing density, border radius, shadows.
- **Data implied by the mockup** — labels and columns shown (these usually map to case/data-object fields and hint at what the Allowed Fields and data view `select` list should contain).

### 2.2 Handling multiple images

If the user provides several screenshots (e.g., list page, detail page, form), analyze each individually and note which screen it represents. Ask for clarification if it's unclear which flow/state an image shows.

### 2.3 Producing and confirming the design → DX API mapping

Before generating any code, summarize your analysis back to the user as a short plan, mapping each screen to the DX APIs from [launchpad-dx-apis](../launchpad-dx-apis/SKILL.md) that will drive it, for example:

| Screen (from screenshot) | Data source | DX API |
| ------------------------- | ----------- | ------ |
| Dashboard / case list | List/report data view | `POST /dx/api/application/v2/data_views/<DataPageName>` |
| Case detail (read-only) | Full case | `GET /dx/api/application/v2/cases/{ID}?viewType=page` |
| "New Request" form | Create case | `POST /dx/api/application/v2/cases` |
| Approval / step form | Assignment | `GET/PATCH /dx/api/application/v2/assignments/{assignmentID}` |
| Attachments panel | Attachments | see `examples/attachments/` |
| Comments panel | Pulse | see `examples/pulse/` |
| Followers/watchers control | Followers | see `examples/followers/` |

Get explicit confirmation ("does this match what you had in mind?") before moving to scaffolding. This avoids building the wrong pages or wiring the wrong fields.

---

## 3. Authentication and Environment Setup

Authentication, grant types, Client Registration/Persona setup, and the `.env.example` pattern are identical to the [launchpad-dx-apis](../launchpad-dx-apis/SKILL.md) skill — **do not duplicate that guidance here, follow it directly**:

- Default to **PKCE** (Authorization Code with PKCE) for an interactive user; use **Client Credentials** only for true server-to-server calls with no interactive user.
- Ask the hosting team for the **Application URL**, **Access Token URL**, **Client ID**, and (for Client Credentials) **Client Secret**.
- Generate the application's own `.env.example` from [../launchpad-dx-apis/examples/.env.example](../launchpad-dx-apis/examples/.env.example) (or the local copy in [examples/.env.example](examples/.env.example)) — never commit a populated `.env`.
- **Never ship a confidential client secret to the browser.** For a browser SPA, prefer a Public PKCE client with no secret. If a Confidential client is unavoidable, do the token exchange on a small backend/BFF and have the browser talk to that BFF instead of holding the secret.

### CORS during local development

Launchpad's DX endpoints typically do not send CORS headers for `localhost` origins. During development, proxy all `/dx/` calls through your dev server (e.g., a webpack-dev-server / Vite / Next.js API route proxy) to the Launchpad base URL. In production, request a CORS policy update from the Launchpad team that allows your app's origin (same process as any other externally-hosted app calling DX APIs).

---

## 4. Architecture

```
Browser (your custom UI) → your API client/service layer → fetch() → Launchpad DX APIs (/dx/api/application/v2/...)
```

There is no Constellation/`PCore` layer. Your code is responsible for: obtaining/refreshing tokens, calling DX endpoints, tracking the case/assignment `ID` and `eTag`, and rendering every field and action yourself.

### Service layer

Build one module that wraps every DX call needed by the app, e.g.:

```ts
// src/api/launchpad.ts
export async function getDataView(dataView: string, params: Record<string, unknown>, select: string[]) { /* POST /data_views/<dataView> */ }
export async function createCase(caseTypeID: string, content: Record<string, unknown>) { /* POST /cases */ }
export async function getCase(caseID: string) { /* GET /cases/{id}?viewType=page — returns data + eTag header */ }
export async function getAssignment(assignmentID: string) { /* GET /assignments/{id}?viewType=form */ }
export async function submitAssignment(assignmentID: string, actionID: string, outcome: string, content: Record<string, unknown>, eTag: string) { /* PATCH .../actions/<ActionID>?outcome=<Outcome>, If-Match: eTag */ }
export async function submitCaseAction(caseID: string, actionID: string, content: Record<string, unknown>, eTag: string) { /* PATCH /cases/{id}/actions/<ActionID> */ }
export async function getAttachments(caseID: string) { /* see examples/attachments */ }
export async function getFollowers(caseID: string) { /* see examples/followers */ }
export async function getPulse(caseID: string) { /* see examples/pulse */ }
```

Every function should attach the bearer token, throw on non-2xx with the parsed error body, and — for case/assignment reads — return the `eTag` response header alongside the data so callers can use it on the next `PATCH`.

### Pages/components

Build one component per screen identified in §2.3, styled to match the analyzed screenshot (Tailwind utility classes by default, or the chosen library):

- **List/landing page** — table or card grid rendered from a data view response (`data[]`). Support the filters/paging shown in the mockup by passing `dataViewParameters` / `query.select` / `paging`.
- **Case detail (read-only)** — rendered from `GET /cases/{id}?viewType=page`, showing `content` fields, stage/status, and `availableActions` as buttons.
- **Create-case form** — fields matching the case type's Allowed Fields; on submit, `POST /cases`, then render the next assignment from the response if present.
- **Assignment/action form** — fields come from `uiResources.resources.fields` in the assignment response, but you render them with **your own** form components (not Pega's), mapping Pega field `type` → your input component (text → text input, date → date picker, etc.), matched to the screenshot's field styling.
- **Attachments / Pulse / Followers panels** — thin components wrapping the corresponding service-layer calls; style as shown in the mockup (list, upload control, comment thread, avatar list).

---

## 5. Rendering Dynamic Fields Without Constellation

Because there's no rendering engine, you must map Pega field metadata to your own components yourself:

1. Read `uiResources.resources.fields` (from the assignment/case-action response) for each field's `label`, `type` (Text, Integer, Decimal, Date, DateTime, Dropdown/select with `options`, TextArea, Checkbox, etc.), and `required`.
2. Bind fields to `content` keyed by field name — build the submit payload as `{ content: { ...values }, pageInstructions: [] }`.
3. Only render/submit fields that are part of the current view — don't invent fields not present in the response.
4. Validate `required` fields client-side before submit, but always handle server-side `400` validation errors too (see §7) since Launchpad may enforce case/stage validations you don't know about client-side.
5. Style every field per the design pulled from the screenshots (§2.1) — labels, spacing, input styling, button placement — since none of this comes from Pega.

---

## 6. Project Structure

```
my-custom-frontend/
├── src/
│   ├── api/
│   │   └── launchpad.ts           # Service layer wrapping all DX calls (§4)
│   ├── auth/
│   │   └── pkce.ts                # Token acquisition/refresh (PKCE or client credentials)
│   ├── components/
│   │   ├── CaseList/               # Landing/list page, styled per screenshots
│   │   ├── CaseDetail/             # Read-only case detail view
│   │   ├── AssignmentForm/         # Dynamic form driven by uiResources fields
│   │   ├── AttachmentsPanel/
│   │   ├── PulsePanel/
│   │   └── FollowersPanel/
│   ├── styles/                     # Tailwind config / brand tokens extracted from screenshots
│   └── index.tsx
├── .env.example                    # Copied/generated from launchpad-dx-apis examples/.env.example
├── .gitignore                      # Must ignore .env, dist/build output, node_modules/
└── package.json
```

---

## 7. Error Handling & ETag Discipline

Follow the same error semantics as [launchpad-dx-apis](../launchpad-dx-apis/SKILL.md):

- `403` on create/action — the Persona on the Client Registration lacks access.
- `404` on get/action — no access to that case/assignment, or it doesn't exist.
- `400` on update — case/stage/step validation failed; surface the returned validation details to the user.
- Always read the `eTag` from a `GET` (case or assignment) and send it back as `If-Match` on the following `PATCH`. Re-fetch and retry once if a `PATCH` fails due to a stale ETag (concurrent update).
- Treat response shapes for Create Case and Submit Assignment as **representative, not fixed** — parse defensively by key path and drive follow-up calls from `links.*.href` rather than hardcoded URLs.

---

## 8. Examples

See [examples/](examples/) for captured request/response pairs (`case/`, `data-views/`, `attachments/`, `followers/`, `pulse/`, `agents/`) — the same shapes documented in [launchpad-dx-apis](../launchpad-dx-apis/SKILL.md). Use these as the source of truth for payload shapes when writing the service layer.

---

## 9. Quick Start Checklist

- [ ] Confirmed tech stack, styling approach, case type(s)/data object(s), and target folder (§1)
- [ ] **Asked for and analyzed screenshots/wireframes** — extracted screens, layout, components, and brand/design tokens (§2.1)
- [ ] Produced and got user confirmation on the design → DX API mapping table (§2.3)
- [ ] Gathered Application URL, Access Token URL, Client ID (and secret if Client Credentials) from the Launchpad team
- [ ] Generated `.env.example` from [examples/.env.example](examples/.env.example); `.env` gitignored, never committed
- [ ] Confirmed Allowed Fields for each case type used in create/action payloads
- [ ] Confirmed which data views back each landing/list page and which fields to `select`
- [ ] Set up local dev proxy for `/dx/` calls to avoid CORS issues
- [ ] Built the service layer (§4) wrapping every DX call the app needs, returning `eTag` alongside data
- [ ] Built each page/component styled to match the provided screenshots, with dynamic forms driven by `uiResources.resources.fields` (§5)
- [ ] Verified `If-Match`/ETag handling and defensive parsing of Create Case / Submit Assignment responses (§7)
- [ ] For production: requested a CORS policy update from the Launchpad team for your app's origin, and confirmed no client secret ships to the browser
