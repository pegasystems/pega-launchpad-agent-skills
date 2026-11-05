# Pega Launchpad Agent Skills and UX Builder

[Pega Launchpad](https://launchpad.io) helps teams build AI-powered workflow applications that automate work, connect people when needed, and run on an enterprise-ready platform. You can explore Launchpad and start building with a free trial.

## Get started with Launchpad

1. [Start for free on Launchpad](https://launchpad.io/sign-up) and follow the sign-up steps.
2. Use Launchpad to explore an idea and build an application.
3. Add an AI coding assistant helper from this repository when you want help with Launchpad development.

## Agent helpers in this repository

This repository offers two complementary helpers. They are separate and can be installed independently or together. See [INSTALL.md](INSTALL.md) for all installation options and setup steps.

| Helper | What it provides |
| --- | --- |
| **Launchpad agent skills** | A collection of task-specific instructions for AI coding assistants, covering Launchpad MCP, DX APIs, web embedding, custom functions, Custom UX components, and custom React front ends. Choose the skills relevant to your work. |
| **Launchpad UX Builder plugin** | A guided, end-to-end workflow for building Custom UX components: it discovers your app, recommends a component, generates a theme-aware preview, and helps build and publish it. It requires an MCP-capable assistant and Launchpad access with permission to publish Custom UX. |

### Launchpad agent skills

The standalone skills are reusable across supported AI coding tools. Browse the collection:

- [Initial setup for connecting Launchpad to MCP-capable tools](skills/launchpad-byoa-mcp-initial-setup/SKILL.md)
- [Calling Launchpad via DX APIs](skills/launchpad-dx-apis/SKILL.md)
- [Embedding Launchpad with Web Embed](skills/launchpad-webembed/SKILL.md)
- [Creating Custom UX components](skills/launchpad-ux-custom-components/SKILL.md)
- [Creating custom functions](skills/launchpad-custom-function/SKILL.md)
- [Building custom React front ends](skills/launchpad-ux-custom-frontend/SKILL.md)

### Launchpad UX Builder plugin

The plugin is for a more specific job: guiding an assistant through the full Custom UX component workflow, from app discovery to preview and publishing. See the [UX Builder plugin guide](plugins/launchpad-ux-builder/README.md) for its capabilities and requirements.

## More information

- [Installation and setup](INSTALL.md)
- [Launchpad Support Portal](https://launchpad.io/LaunchpadSupport)
