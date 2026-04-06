# Pega Launchpad Agent Skills

A collection of skills for AI coding agents to assist with development of specific Launchpad capabilities.

These skills are designed to help providers using Pega Launchpad use existing AI agents and vibe coding tools to integrate with Launchpad.

Skills follow the [Agent Skills](https://agentskills.io/) specification.

**Skills in this collection:**
1. [Calling Launchpad via DX API](#calling-launchpad-via-dx-api)
2. [Embedding Launchpad with Web Embed](#embedding-launchpad-with-web-embed)
3. [Creating Custom UX Components](#creating-custom-ux-components)
4. [Creating Custom Functions](#creating-custom-functions)
5. [Creating custom Front Ends](#creating-custom-front-ends)

## Available Skills

### Calling Launchpad via DX API

Use Launchpad DX APIs when an external system needs to work with Launchpad cases or data objects over REST rather than through embedded UI or the React SDK. This skill explains the main DX API patterns, the required authentication setup, and the Launchpad-specific constraints that shape request payloads.

It covers:
- OAuth 2.0 authentication using a Launchpad client registration, including how the selected persona controls API access
- creating cases and data objects with the `POST /dx/api/application/v2/cases` and `POST /dx/api/application/v2/objects` endpoints
- retrieving existing cases or data objects and interpreting returned assignment actions and case `availableActions`
- updating work by invoking assignment actions or case-level actions with `PATCH` requests
- querying lists of records with data view DX APIs such as `POST /dx/api/application/v2/data_views/...`
- Launchpad configuration requirements such as Allowed Fields, action definitions, data views, and access permissions

Use this skill when you need to:
- create Launchpad cases from an external system
- fetch case details and discover what actions are currently available
- complete assignments or invoke optional case actions programmatically
- expose filtered Launchpad data to other systems
- generate request/response examples or YAML-style API documentation for a Launchpad application

### Embedding Launchpad with Web Embed

Embed Launchpad application experiences (case creation, assignments, full case pages) into external websites, portals, or custom front-end apps using the `<pega-embed>` web component. The skill covers CORS setup, OAuth (Client Credentials and PKCE), embed attributes, theming, events, and code examples for React/Next.js.

### Creating Custom UX Components

Introduces Custom UX for Pega Launchpad on the Constellation design system: when to build custom components, what design and data inputs are needed, and how they fit into Launchpad and DX. Describes the DXCB framework for building Constellation-compatible custom components (e.g. React-based extensions).

### Creating Custom Functions

Extend Launchpad with logic implemented in high-level languages (Java, Python, Node.js) by uploading JAR or Python artifacts and referencing the method to invoke. The Custom Function signature must match the HLL method; use when functionality cannot be implemented in other rule types such as Automation.

### Creating custom Front Ends

Build custom React front ends on top of Pega Launchpad using the Pega React SDK (`@pega/react-sdk-components`) and Constellation runtime, rather than calling DX APIs directly. This skill covers when a custom front end is justified, required Launchpad configuration (OAuth client, app alias, case type, and server URLs), SDK architecture, authentication with `@pega/auth`, `PCore` readiness patterns, webpack setup, theming, local component overrides, and common Launchpad-specific troubleshooting.

It also includes:
- a complete reference implementation in [skills/launchpad-ux-custom-frontend/examples/workmanagement](skills/launchpad-ux-custom-frontend/examples/workmanagement)
- supporting documentation for [authentication flow](skills/launchpad-ux-custom-frontend/references/authentication-flow.md), [architectural patterns](skills/launchpad-ux-custom-frontend/references/key-architectural-patterns.md), and [webpack configuration](skills/launchpad-ux-custom-frontend/references/webpack-configuration.md)

Use this skill when you want a fully custom React shell around Launchpad case workflows while still letting the SDK handle Constellation rendering, data binding, assignments, and case creation.

## Installing Skills

These skills use the [Agent Skills](https://agentskills.io/) open standard (`SKILL.md` + optional `references/`).

For a single skill, install it directly from GitHub:

```bash
npx skills add https://github.com/pegasystems/pega-launchpad-agent-skills --skill <skill name>
```

To install the full collection:

```bash
npx skills add https://github.com/pegasystems/pega-launchpad-agent-skills
```

Available skill names in this repo include:
- `launchpad-custom-function`
- `launchpad-dx-apis`
- `launchpad-ux-custom-components`
- `launchpad-ux-custom-frontend`
- `launchpad-webembed`

For platform-specific and manual installation details, see [INSTALL.md](INSTALL.md).

## Skill Structure

Each skill contains:
- `SKILL.md` – Instructions for the agent
- `references/` – Supporting documentation (optional)

## Contact
For any questions about these skills feel free to reach us via the [Support Portal](https://launchpad.io/LaunchpadSupport)


