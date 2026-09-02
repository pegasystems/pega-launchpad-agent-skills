# assets/dxcb-scaffold (controlled helper templates)

This directory contains scripts that may be copied into a user-selected DXCB project when
controlled authentication or proxy support is needed. It is not a runtime cache, and the
plugin never writes generated files or dependencies into its own package directory.

## Runtime install (what the agent does)

See `references/flow/04-scaffold-dxcb.md` for the authoritative steps. Summary:

1. Detect the provider platform version via MCP (`getAppInfo`) and pick the matching DXCB
   line (Platform '25 → `@pega/custom-dx-components@~25.1`).
2. Ensure the required Node version on the local machine (install/switch via `nvm`;
   release notes for 25.1.10 test with Node 22.15.0 / npm 10.9.2).
3. Ask for a target directory, then create `package.json`, `tasks.config.json`,
   `tsconfig.json`, and `src/components/` directly. Never invoke the interactive DXCB init.
4. Write provider details into `tasks.config.json` (`serverType=launchpad`,
   `libraryModeCL=false`, `server`, `library`, and `version`). `isolationID` is not required.
5. Run `npm install` in the user-selected project and verify it with `npx tsc --noEmit`.

## Notes

- Re-check the provider platform/DXCB version when updating an existing project.
- Never commit credentials, OAuth tokens, or `node_modules/` to source control.

## Controlled helper scripts (no `node_modules` edits)

DXCB's built-in auth/publish do not honor an HTTP(S) proxy, and we must **never** edit DXCB
code under `node_modules/`. These project-owned templates fix that on corporate/proxied
networks. Copy them into the DXCB project's `scripts/` folder and wire them into the
project's `package.json`. See `references/knowledge/proxy-and-controlled-auth.md`.

- **`lp-authenticate.mjs`** — controlled Launchpad authenticate. Reproduces DXCB's auth-code
  flow via `@pega/auth` with `useNodeFetch: false` so the token exchange honors the proxy.
  Writes the token to the exact file DXCB reads at publish time.
  Wire up: `"lp-auth": "node scripts/lp-authenticate.mjs"`.
- **`lp-proxy-preload.mjs`** — controlled publish-through-proxy shim. Preloaded via
  `NODE_OPTIONS="--import ./scripts/lp-proxy-preload.mjs"`, it swaps `https.Agent` for an
  https-proxy-agent when a proxy env var is set, so DXCB's `node-fetch` upload tunnels through
  the proxy. No-op on direct networks.
