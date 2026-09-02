#!/usr/bin/env node
// Controlled Launchpad authenticate for DX Component Builder (DXCB).
//
// WHY THIS EXISTS
// ---------------
// DXCB's built-in `authenticate` task (node_modules/@pega/custom-dx-components/
// src/tasks/authenticate/index.js) builds its OAuth config with
// `useNodeFetch: true`. That code path uses node-fetch, which does NOT honor an
// HTTP(S) proxy. On corporate/proxied networks (e.g. Zscaler PAC on
// 127.0.0.1:9000) the browser can reach the authorize endpoint but the Node
// token exchange connects directly and times out — auth fails.
//
// POLICY: never edit files under node_modules (DXCB code). This project-owned
// script reproduces DXCB's auth-code flow using @pega/auth directly with
// `useNodeFetch: false` (undici native fetch, which honors HTTPS_PROXY via
// undici's EnvHttpProxyAgent when NODE_USE_ENV_PROXY=1). It writes the token to
// the SAME file DXCB reads at publish time, so `npm run publish` just works.
//
// USAGE
// -----
// 1. Copy this file into the DXCB project (e.g. ./scripts/lp-authenticate.mjs).
// 2. Add a script to the PROJECT's package.json (this is your file, not DXCB's):
//      "lp-auth": "node scripts/lp-authenticate.mjs"
// 3. Run it. On a proxied network also pass the proxy env vars:
//      NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9000 \
//      HTTP_PROXY=http://127.0.0.1:9000 NO_PROXY=localhost,127.0.0.1 \
//      npm run lp-auth
//    On a direct (non-proxied) network, just: npm run lp-auth

import fs from 'node:fs';
import { PegaAuth } from '@pega/auth';

const TASKS_CONFIG = 'tasks.config.json';
// DXCB reads/writes the token here (see @pega/custom-dx-components constants TOKEN_PATH).
const TOKEN_PATH = 'node_modules/@pega/custom-dx-components/.access_token';

const LP_TOKEN_URL = 'uas/oauth/token';
const LP_AUTHORIZE_URL = 'uas/oauth/authorize';

const cfg = JSON.parse(fs.readFileSync(TASKS_CONFIG, 'utf8'))['server-config'];
const server = cfg.server.endsWith('/') ? cfg.server : `${cfg.server}/`;

// If a proxy is configured, make undici's native fetch route through it.
if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
  process.env.NODE_USE_ENV_PROXY = process.env.NODE_USE_ENV_PROXY || '1';
}

const authConfig = {
  serverType: 'launchpad',
  authService: cfg.authService || '',
  grantType: 'authCode',
  tokenUri: `${server}${LP_TOKEN_URL}`,
  authorizeUri: `${server}${LP_AUTHORIZE_URL}`,
  clientId: cfg.clientId,
  clientSecret: cfg.clientSecret,
  redirectUri: cfg.redirectUri.endsWith('/') ? cfg.redirectUri : `${cfg.redirectUri}/`,
  cert: cfg.cert,
  key: cfg.key,
  ignoreInvalidCerts: true,
  useNodeFetch: false, // <-- the controlled setting: native fetch honors the proxy
  noPKCE: true, // Launchpad DXCB client is confidential; PKCE disabled
  ...(cfg.isolationId ? { isolationId: cfg.isolationId } : {}),
  winTitle: 'DX Component Dev'
};

console.log(`Authenticating to ${cfg.server} ...`);
console.log('Awaiting authorization to complete — you may need to log in via your browser.');

try {
  const auth = new PegaAuth(authConfig);
  const token = await auth.login();
  if (token?.token_type) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Authenticated successfully — token written for DXCB publish.');
  } else {
    console.error('Authentication failed:', JSON.stringify(token?.errors ?? token));
    process.exit(1);
  }
} catch (e) {
  console.error('Authentication failed:', e?.message || e);
  process.exit(1);
}
