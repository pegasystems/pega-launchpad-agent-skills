# Pega Launchpad Agent Skills and UX Builder

Tools for AI coding agents that help teams build with Pega Launchpad. This repository provides two complementary installation options:

| Install | Best for | Includes |
| --- | --- | --- |
| **Launchpad agent skills** | Getting guided help with a specific Launchpad integration or extension task | Five standalone [Agent Skills](https://agentskills.io/) |
| **Launchpad UX Builder plugin** | Building, previewing, and publishing a Custom UX component from a natural-language request | The end-to-end UX Builder skill, component templates, and publishing workflow |

You can install either option independently, or install both. The UX Builder plugin's bundled skill is separate from the five standalone skills below.

## Choose What to Install

- Install **agent skills** when you want help calling DX APIs, embedding Launchpad, creating custom functions, creating Custom UX components, or building a custom React front end.
- Install the **UX Builder plugin** when you want an agent to take a request such as "Build a custom UX component for my Launchpad app" through discovery, design preview, generation, and publishing.
- Install **both** when you want the UX Builder workflow as well as the standalone skills for broader Launchpad work.

For agent-assisted installation requests such as "install Launchpad skills" or "install the UX Builder plugin," use the decision guide in [INSTALL.md](INSTALL.md).

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

[Blog Post on Custom UX Components](https://launchpad.io/blog/custom-ux-components-teaching-your-ai-agent-build-launchpad-ux-extensions)

### Creating Custom Functions

Extend Launchpad with logic implemented in high-level languages (Java, Python, Node.js) by uploading JAR or Python artifacts and referencing the method to invoke. The Custom Function signature must match the HLL method; use when functionality cannot be implemented in other rule types such as Automation.

### Creating custom Front Ends

Build custom React front ends on top of Pega Launchpad using the Pega React SDK (`@pega/react-sdk-components`) and Constellation runtime, rather than calling DX APIs directly. This skill covers when a custom front end is justified, required Launchpad configuration (OAuth client, app alias, case type, and server URLs), SDK architecture, authentication with `@pega/auth`, `PCore` readiness patterns, webpack setup, theming, local component overrides, and common Launchpad-specific troubleshooting.

It also includes:
- a complete reference implementation in [skills/launchpad-ux-custom-frontend/examples/workmanagement](skills/launchpad-ux-custom-frontend/examples/workmanagement)
- supporting documentation for [authentication flow](skills/launchpad-ux-custom-frontend/references/authentication-flow.md), [architectural patterns](skills/launchpad-ux-custom-frontend/references/key-architectural-patterns.md), and [webpack configuration](skills/launchpad-ux-custom-frontend/references/webpack-configuration.md)

Use this skill when you want a fully custom React shell around Launchpad case workflows while still letting the SDK handle Constellation rendering, data binding, assignments, and case creation.

## Launchpad UX Builder Plugin

[Launchpad UX Builder](plugins/launchpad-ux-builder/README.md) is a self-contained Agent Plugin for Pega Launchpad Custom UX (Constellation DX / DXCB). It guides an MCP-capable assistant through app discovery, component selection, a theme-accurate preview, component generation, and publishing.

Install the plugin directory with your assistant's Agent Plugin mechanism. In VS Code, add the local plugin root to `chat.pluginLocations`:

```json
{
	"chat.pluginLocations": {
		"/absolute/path/to/pega-launchpad-agent-skills/plugins/launchpad-ux-builder": true
	}
}
```

Then start a matching request in your assistant, for example: `Build a custom UX component for my Launchpad app.` The plugin details, requirements, and MCP setup behavior are documented in the [plugin README](plugins/launchpad-ux-builder/README.md).

## Launchpad Agent Skills

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


