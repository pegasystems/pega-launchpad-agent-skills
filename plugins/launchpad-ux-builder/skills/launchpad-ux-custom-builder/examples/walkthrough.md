# Example walkthrough - Star rating field on the Claim case

A concrete run of the five-task flow.

1. **Connect** - The agent checks for existing Launchpad MCP tools. If none are available,
   the user supplies the Studio app URL and, only when no matching server exists, a public
   OAuth Client ID. The active assistant completes PKCE authentication and stores its token.

2. **Discover (MCP)** — `getAppInfo` → Platform '25. Agent lists case types, finds
   `Claim`, reads its data model (finds a numeric `satisfactionScore` field), lists views
   (Details region available), and resolves the theme (brand `#0b6cff`, Inter font).

3. **Recommend** — Request: "add a star rating for satisfaction on the claim." No OOTB
   control fits a star rating. Agent proposes a **Field** component, subtype `Integer`,
   bound to `satisfactionScore`, placed in the case Form/Details. User confirms.

4. **Scaffold** - The agent asks whether a DXCB project already exists. If not, the user
   selects a target path and supplies organization/library names. The agent creates the
   non-interactive project files, installs the matching DXCB version, and verifies TypeScript.

5. **Develop** — Agent generates `Pega_Extensions_StarRatingInput/` with `config.json`
   (Field/Integer, bound to `satisfactionScore`) and `index.tsx` using Cosmos + PConnect.

6. **Theme mock** - Agent makes mock data (score = 4), maps the brand theme tokens, writes
   an ephemeral theme-accurate SVG, and opens it in the user's default browser. The user
   approves the rendered design; the agent then deletes the temporary SVG.

7. **Build and publish** - The agent calls `bundleComponent()` programmatically, summarizes
   the target, and asks for explicit publish approval. After approval it uses the cached OAuth
   token and `assetsUpdate`; it never invokes the interactive DXCB commands. The agent reports
   that the field now appears under the field's **Display as** options in Studio.
