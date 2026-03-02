# Pega Launchpad Agent Skills

A collection of skills for AI coding agents. These skills are designed to help providers using Pega Launchpad use existing AI agents and vibe coding tools to integrate with Launchpad.

Skills follow the [Agent Skills](https://agentskills.io/) format.

## Available Skills

### Calling Launchpad via DX API

Integrate with Pega Launchpad using the Developer Experience (DX) API. Call Launchpad services, start and manage cases, and exchange data from your applications or agent-built code.

**Use when:**
- Starting or advancing a case from code
- Fetching case data or case list from Launchpad
- Integrating a custom app or script with Launchpad backend
- Building automations or workflows that trigger Launchpad

**Topics covered:**
- DX API authentication and base URLs
- Case creation and advancement
- Reading and updating case data
- Working with Launchpad API responses and errors

---

### Embedding Launchpad with Web Embed

Embed Pega Launchpad flows and case UI into your existing web applications using the Launchpad Web Embed approach.

**Use when:**
- "Embed Launchpad in my site"
- Adding a Launchpad flow to a customer portal or internal app
- Showing a specific case or journey inside an iframe or embed
- Keeping users in your domain while running Launchpad UX

**Topics covered:**
- Web Embed setup and configuration
- Passing context (e.g., user, case) into the embed
- Styling and responsive behavior
- Security and cross-origin considerations

---

### Creating Custom UX Components

Build custom UI components that plug into Pega Launchpad and comply with Launchpad’s design system and integration patterns.

**Use when:**
- Designing a custom control or widget for a Launchpad screen
- Extending Launchpad UI with company-specific components
- Implementing custom inputs, cards, or visualizations
- Ensuring components work with Launchpad theming and accessibility

**Topics covered:**
- Launchpad component APIs and extension points
- Styling and theming alignment
- Accessibility and responsive design
- Registering and using custom components in flows

---

### Creating Custom Functions

Define and use custom functions that Launchpad can call for calculations, validations, integrations, or business logic.

**Use when:**
- Adding reusable logic used by multiple flows or screens
- Calling external services or APIs from Launchpad
- Implementing complex calculations or validation rules
- Sharing logic between Launchpad and other systems

**Topics covered:**
- Defining custom functions (signatures, parameters, return values)
- Registering functions with Launchpad
- Using functions in expressions and actions
- Testing and debugging custom functions

---

### Creating Consumer Front Ends

Build consumer-facing front ends (web or mobile) that use Launchpad for case handling, journeys, and data while keeping full control over layout, branding, and navigation.

**Use when:**
- "Build a consumer app that uses Launchpad"
- Creating a branded customer portal powered by Launchpad
- Designing a mobile-friendly or headless front end over Launchpad
- Combining Launchpad capabilities with your own UX and routing

**Topics covered:**
- Architecture options (embed, DX API, or hybrid)
- Authentication and user context
- Routing, deep linking, and state
- Performance and deployment considerations

## Installation

```bash
npx skills add <your-org>/pega-launchpad-agent-skill
```

*(Replace `<your-org>` with your GitHub org or username when published.)*

## Usage

After installation, the agent will use these skills when it detects tasks related to Launchpad integration, embedding, custom components, custom functions, or consumer front ends.

**Examples:**
```
Embed Launchpad in my React app
```
```
Start a case via the DX API from this script
```
```
Create a custom function for Launchpad that validates an ID
```
```
Help me build a consumer portal that uses Launchpad for the case flow
```

## Skill Structure

Each skill contains:
- `SKILL.md` – Instructions for the agent
- `references/` – Supporting documentation (optional)


