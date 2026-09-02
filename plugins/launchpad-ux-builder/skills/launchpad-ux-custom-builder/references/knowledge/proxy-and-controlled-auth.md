# Controlled authenticate & the no-`node_modules`-edits policy

## Policy: never modify DXCB code

DX Component Builder (`@pega/custom-dx-components`) is third-party code installed under
`node_modules/`. **Do not edit files inside `node_modules/`.** Any such change is lost on
`npm install`, is invisible in source control, and is not reproducible for other users.

When DXCB's built-in behavior needs to change, the agent must instead create a
**project-owned** file (a script the user controls) and wire it in via the project's own
`package.json` scripts.

## The `useNodeFetch` problem (why a controlled auth script is needed)

DXCB's built-in `authenticate` task builds its OAuth config with `useNodeFetch: true`. That
path uses `node-fetch`, which **does not honor an HTTP(S) proxy**. On corporate/proxied
networks (e.g. a Zscaler PAC proxy on `127.0.0.1:9000`):

- the **browser** reaches the authorize endpoint and returns a code (works), but
- the **Node token exchange** connects directly, bypassing the proxy, and **times out** →
  authentication fails.

The fix is `useNodeFetch: false`, which uses undici's native `fetch`. Native fetch honors the
proxy via undici's `EnvHttpProxyAgent` when `NODE_USE_ENV_PROXY=1` and `HTTPS_PROXY` are set.

Because we must not edit DXCB's `authenticate/index.js` to flip that flag, the agent
generates a **controlled authenticate script** that reproduces the same auth-code flow using
`@pega/auth` directly, with `useNodeFetch: false`.

## What the agent does

1. Copy the template `assets/dxcb-scaffold/lp-authenticate.mjs` into the DXCB project as
   `scripts/lp-authenticate.mjs`.
2. Add a script to the **project's** `package.json` (not `node_modules`):
   ```json
   "scripts": { "lp-auth": "node scripts/lp-authenticate.mjs" }
   ```
3. Run it in place of `npm run authenticate`:
   - Direct network: `npm run lp-auth`
   - Proxied network:
     ```
     NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9000 \
     HTTP_PROXY=http://127.0.0.1:9000 NO_PROXY=localhost,127.0.0.1 npm run lp-auth
     ```

The script writes the token to the exact path DXCB reads at publish time
(`node_modules/@pega/custom-dx-components/.access_token`), so `npm run publish` works
unchanged. The token is short-lived — re-run `lp-auth` immediately before publishing.

## How to detect a proxied network

- macOS: check for a system PAC/proxy (System Settings → Network → Proxies) or a running
  local proxy such as Zscaler on `127.0.0.1:9000`.
- Symptom: the browser authorize step succeeds but the CLI token exchange hangs/times out
  with a connect timeout (`UND_ERR_CONNECT_TIMEOUT`) or an empty-reason `FetchError`.

If there is no proxy, the controlled script still works (it only enables proxy routing when
`HTTPS_PROXY`/`HTTP_PROXY` are present).

## Publish upload through a proxy (the `getHttpsAgent` problem)

`npm run publish` uploads the built component with `node-fetch` and an **explicit**
`agent: getHttpsAgent(...)`. In DXCB, `getHttpsAgent`
(`node_modules/@pega/custom-dx-components/src/util.js`) returns a plain
`new https.Agent(...)`. An explicit agent **overrides** any global/env proxy, so unlike the
auth step there is no `useNodeFetch` flag to flip — the upload always connects directly and,
on a proxied network, fails with a connect timeout / `FetchError`.

Because we must not edit `util.js`, the fix is a **project-owned preload** that swaps
`https.Agent` for an https-proxy-agent when a proxy env var is present. Node core's `https`
module object is shared and mutable, and DXCB reads `https.Agent` at call time, so replacing
it before DXCB loads makes every `new https.Agent(...)` DXCB creates tunnel through the proxy.

### What the agent does

1. Copy the template `assets/dxcb-scaffold/lp-proxy-preload.mjs` into the DXCB project as
   `scripts/lp-proxy-preload.mjs`.
2. Run publish with the preload wired in via `NODE_OPTIONS` (no `node_modules` edits):
   - macOS / Linux (bash/zsh):
     ```
     NODE_OPTIONS="--import ./scripts/lp-proxy-preload.mjs" \
     HTTPS_PROXY=http://127.0.0.1:9000 HTTP_PROXY=http://127.0.0.1:9000 \
     NO_PROXY=localhost,127.0.0.1 NODE_TLS_REJECT_UNAUTHORIZED=0 npm run publish
     ```
   - Windows (PowerShell):
     ```powershell
     $env:NODE_OPTIONS = "--import ./scripts/lp-proxy-preload.mjs"
     $env:HTTPS_PROXY  = "http://127.0.0.1:9000"
     $env:HTTP_PROXY   = "http://127.0.0.1:9000"
     $env:NO_PROXY     = "localhost,127.0.0.1"
     $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
     npm run publish
     ```

The preload is a **no-op when no proxy env var is set**, so it is safe to leave enabled on
direct networks. It needs `https-proxy-agent` to be resolvable — it is normally a transitive
dependency of DXCB; if not, install it with `npm i -D https-proxy-agent`.

### End-to-end on a proxied network

Run the two controlled steps back-to-back (the token is short-lived):

```
# 1) authenticate (controlled script, useNodeFetch:false honors the proxy)
NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9000 \
HTTP_PROXY=http://127.0.0.1:9000 NO_PROXY=localhost,127.0.0.1 npm run lp-auth

# 2) publish (controlled preload routes the node-fetch upload through the proxy)
NODE_OPTIONS="--import ./scripts/lp-proxy-preload.mjs" \
HTTPS_PROXY=http://127.0.0.1:9000 HTTP_PROXY=http://127.0.0.1:9000 \
NO_PROXY=localhost,127.0.0.1 NODE_TLS_REJECT_UNAUTHORIZED=0 npm run publish
```

## Note on client credentials & secret rotation

The DXCB OAuth client id/secret live in the project's `tasks.config.json` (`server-config`).
Because DXCB runs **locally** on the developer's machine, entering the client credentials there
is acceptable. **Secret rotation is not applicable** — Launchpad apps do not expose a rotate
action for these OAuth clients, so no post-publish rotation step is required. Still, keep
`tasks.config.json` out of shared commits if the repository is public, and never paste the
client secret into chat.
