// Controlled publish-through-proxy preload for DX Component Builder (DXCB).
//
// WHY THIS EXISTS
// ---------------
// DXCB's publish task uploads the component with `node-fetch` and an EXPLICIT
// `agent: getHttpsAgent(...)`, where `getHttpsAgent` returns a plain
// `new https.Agent(...)` (node_modules/@pega/custom-dx-components/src/util.js).
// An explicit agent OVERRIDES any global/env proxy, so on corporate/proxied
// networks (e.g. Zscaler PAC on 127.0.0.1:9000) the publish upload connects
// directly, bypasses the proxy, and fails with a connect timeout / FetchError.
//
// POLICY: never edit files under node_modules (DXCB code). Instead this
// project-owned preload swaps `https.Agent` for an https-proxy-agent WHEN a
// proxy env var is set. Node core's `https` module object is shared and mutable,
// and DXCB reads `https.Agent` at call time, so replacing it here (before DXCB
// loads) makes every `new https.Agent(...)` DXCB creates tunnel through the
// proxy — without touching node_modules.
//
// USAGE
// -----
// 1. Copy this file into the DXCB project (e.g. ./scripts/lp-proxy-preload.mjs).
// 2. Preload it for the publish command via NODE_OPTIONS (no node_modules edits):
//
//    macOS / Linux (bash/zsh):
//      NODE_OPTIONS="--import ./scripts/lp-proxy-preload.mjs" \
//      HTTPS_PROXY=http://127.0.0.1:9000 HTTP_PROXY=http://127.0.0.1:9000 \
//      NO_PROXY=localhost,127.0.0.1 NODE_TLS_REJECT_UNAUTHORIZED=0 \
//      npm run publish
//
//    Windows (PowerShell):
//      $env:NODE_OPTIONS = "--import ./scripts/lp-proxy-preload.mjs"
//      $env:HTTPS_PROXY  = "http://127.0.0.1:9000"
//      $env:HTTP_PROXY   = "http://127.0.0.1:9000"
//      $env:NO_PROXY     = "localhost,127.0.0.1"
//      $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
//      npm run publish
//
//    Tip: wire this into a project package.json script so users don't retype it:
//      "lp-publish": "node scripts/lp-proxy-preload.mjs || true"   // NOT this
//    Prefer a cross-platform runner (see references/knowledge doc) or just set
//    NODE_OPTIONS in the shell as shown above.
//
// REQUIREMENTS
// ------------
// - https-proxy-agent must be resolvable from the project. It is usually already
//   present as a transitive dependency of DXCB. If `require('https-proxy-agent')`
//   fails, install it as a dev dependency: `npm i -D https-proxy-agent`.
// - On a direct (non-proxied) network this preload is a no-op, so it is always
//   safe to leave enabled.

import https from 'node:https';
import { createRequire } from 'node:module';

const proxy =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy;

if (proxy) {
  const require = createRequire(import.meta.url);
  let createProxyAgent;
  try {
    // https-proxy-agent v5 exports a callable factory as its default export.
    // v7 exports a named `HttpsProxyAgent` class. Handle both.
    const mod = require('https-proxy-agent');
    if (typeof mod === 'function') {
      createProxyAgent = url => mod(url);
    } else if (mod.HttpsProxyAgent) {
      createProxyAgent = url => new mod.HttpsProxyAgent(url);
    } else if (mod.default) {
      const def = mod.default;
      createProxyAgent = typeof def === 'function' && !def.prototype?.callback
        ? url => def(url)
        : url => new def(url);
    }
  } catch (e) {
    console.error(
      '[lp-proxy-preload] https-proxy-agent not found. Install it with: npm i -D https-proxy-agent'
    );
    throw e;
  }

  const RealAgent = https.Agent;
  // Constructor that returns an https-proxy-agent instead of a plain agent.
  // When a constructor returns an object, `new PatchedAgent()` yields that object.
  function PatchedAgent() {
    return createProxyAgent(proxy);
  }
  PatchedAgent.prototype = RealAgent.prototype;
  https.Agent = PatchedAgent;

  console.log(`[lp-proxy-preload] Routing DXCB HTTPS requests through proxy: ${proxy}`);
}
