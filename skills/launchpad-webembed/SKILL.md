---
name: launchpad-webembed
description: Explains how to embed Launchpad applications into external websites and custom front-end apps using the pega-embed web component. Covers CORS policy setup, OAuth authentication (Client Credentials and PKCE), embed attributes, theming, events, and complete code examples for React/Next.js integration.
tags: [launchpad, webembed, embed, pega-embed, cors, oauth, integration, react, nextjs]
---

# Launchpad WebEmbed

WebEmbed enables embedding Launchpad application experiences (case creation, assignments, full case pages) directly into external websites, portals, or custom front-end applications using the `<pega-embed>` web component. This allows end users to interact with Launchpad without leaving the host application.

For reference details on attributes, events, and CORS setup, see the [WebEmbed reference](../launchpad-general/resources/launchpad-webembed.md).

## When to Use WebEmbed

### Data Capture from Multiple Sources
A Subscriber needs to capture data (e.g., Leads, service requests, claims) from multiple external sources. The Launchpad application is embedded in each respective portal or website to capture data directly, without requiring users to log into Launchpad.

**Example:** A sales organization embeds a Lead capture form into partner portals, social media landing pages, and their corporate website — all feeding into the same Launchpad case type.

### Embedding Existing Launchpad Logic
An organization already has an external application, and a particular piece of business logic is built in Pega Launchpad. The Launchpad application is embedded in the other application — either for **data capture** (e.g., intake forms) or **data display** (e.g., dashboards, case status views).

**Example:** An HR system embeds a Launchpad onboarding workflow so new hires complete their paperwork without leaving the HR portal.

### Summary
- An external website needs to provide a Launchpad case creation form (e.g., supplier onboarding, service requests)
- A custom portal needs to surface Launchpad assignments or case views
- A third-party application needs to integrate Launchpad workflows without redirecting users
- An existing application needs to leverage business logic already built in Launchpad

## Pre-requisites

Before WebEmbed can work in a Subscriber environment, the following must be configured. These steps are performed by the **developer** building the embed integration.

### 1. Configure a CORS Policy

CORS (Cross-Origin Resource Sharing) controls which external domains can make requests to your Launchpad application. Without a properly configured CORS policy, the browser blocks the embed immediately with cross-origin errors.

Create and configure a CORS Policy rule. This can be done in two places:
- **App Settings → Default Settings → Cross Origin Resource Sharing Policy**
- **Rules Library → Security → CORS Policies**

You specify the **Allowed Origin** — the exact domain of the website hosting the embed. For example, if your embed lives at `https://partnerportal.com`, set the allowed origin to exactly `https://partnerportal.com`.

> **⚠️ Critical:** Use `*` (wildcard) only during development. In production, always restrict to exact domains to prevent unauthorized sites from embedding your application.

See [cors-policy.json](../launchpad-general/assets/cors-policy.json) for the JSON schema.

### 2. Add CORS to a Configuration Set

Add the CORS configuration to a **Configuration Set** so it deploys correctly to each Subscriber environment. This is important because different Subscribers may host the embed on different domains — each Subscriber's CORS policy must allow the specific domain(s) where their embed will be hosted.

### 3. Subscriber CORS Update (MANDATORY)

The Subscriber **must always** update the CORS policy to allow the parent domain URL where the embed will be hosted. Without this, the embed will fail with cross-origin errors. For example, if embedding in `https://partnerportal.com`, set `AllowedOrigin` to `https://partnerportal.com`.

### 4. OAuth Credentials

Generate OAuth credentials (Client Credentials or PKCE) for the Subscriber user/operator.

## Embed Actions

### createCase
Creates a new case of the specified type. Use when the embedding site provides an intake form or self-service portal.

### openAssignment
Opens an existing assignment for the user to work on. Use when the embedding site shows a task list and the user clicks to work an item.

### openPage
Opens a Launchpad landing page (portal page) inside the embed. Use when you want to embed an entire list view, dashboard, or landing page rather than a single case form. Requires `pageID` and `pageClass` attributes.

## OAuth Grant Types

### Client Credentials (`grantType="clientCreds"`)
Suitable for trusted environments where the client secret can be securely stored (e.g., server-rendered pages, internal portals). The embed component exchanges `clientId` + `clientSecret` for an access token automatically.

**Required attributes:** `clientId`, `clientSecret`, `authorizeUri`

### PKCE / Authorization Code (`grantType="authCode"`)
Suitable for public-facing browser apps where exposing a client secret is not acceptable. Uses the Authorization Code flow with Proof Key for Code Exchange (PKCE).

**Required attributes:** `clientId`, `authorizeUri`
**Note:** PKCE does **not** require `clientSecret`. Only the `clientId` is needed — the browser handles the PKCE challenge/verifier exchange automatically.

## Complete Example — Client Credentials (React / Next.js)

Below is a full working example of embedding a Launchpad case creation form in a Next.js application using Client Credentials:

```tsx
'use client';

import React, { useEffect } from 'react';

export default function OnboardSupplier() {

  useEffect(() => {
    const navigateToParent = () => {
      const loadedEmbed = document.getElementById('loadedEmbed');

      if (loadedEmbed) {
        loadedEmbed.innerHTML = `
          <div style="padding-top: 30px;">
            <p style="font-size: 20px; font-weight: bold;">Your request has been submitted.</p>
          </div>
        `;
      }
    };

    const embedParams = {
      pegaServerUrl: process.env.NEXT_PUBLIC_PEGA_SERVER_URL,
      clientId: process.env.NEXT_PUBLIC_PEGA_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_PEGA_CLIENT_SECRET,
      authorizeUri: process.env.NEXT_PUBLIC_PEGA_AUTHORIZE_URI,
      theme:
        '{"base":{"palette":{"brand-primary":"#001f5f","brand-foreground":"#001f5f","border-line":"#001f5f","app-background":"#001f5f"}},"components":{"button":{"color":"#001f5f", "foreground-color":"#FFF"}, "label":{"color":"#001f5f"}}}',
      startingFields: '{"CustomerID":"CUST-10234","Channel":"Web"}',
    };

    const loadPegaEmbed = () => {
      type CustomElement = HTMLElement & { load: () => void };
      const elDiv = document.getElementById('pegaEmbedContainer') as CustomElement;

      if (elDiv) {
        let pegaEmbedHTML = `
          <pega-embed
            id="theEmbed"
            action="createCase"
            assignmentHeader=false
            caseTypeID="MaintenanceManagement"
            autoReauth="true"
            pegaServerType="launchpad"
            pegaServerUrl="${embedParams.pegaServerUrl}"
            grantType="clientCreds"
            casePage="assignment"
            deferLoad="true"
            theme='${embedParams.theme}'
            startingFields='${embedParams.startingFields}'
            authorizeUri="${embedParams.authorizeUri}"
            clientId="${embedParams.clientId}"
            clientSecret="${embedParams.clientSecret}"
            style="width: 100%; height: 100%"
          ></pega-embed>`;

        elDiv.innerHTML = pegaEmbedHTML;
        const elEmbed = document.getElementById('theEmbed') as CustomElement;

        if (elEmbed) {
          elEmbed.addEventListener('embedcaseclosed', navigateToParent);
          elEmbed.addEventListener('embedprocessingend', navigateToParent);
          elEmbed.addEventListener('embedeventcancel', navigateToParent);

          if (typeof elEmbed.load === 'function') {
            elEmbed.load();
          }
        }
      }
    };

    const loadScript = () => {
      if (
        !document.querySelector(
          "script[src='https://lp.constellation.pega.com/integrated/react/prod/pega-embed.js']"
        )
      ) {
        const script = document.createElement('script');
        script.src = 'https://lp.constellation.pega.com/integrated/react/prod/pega-embed.js';
        script.async = true;
        script.onload = () => {
          loadPegaEmbed();
        };
        document.head.appendChild(script);
      } else {
        loadPegaEmbed();
      }
    };

    loadScript();
  }, []);

  return (
    <div id="loadedEmbed">
      <div
        id="pegaEmbedContainer"
        style={{
          minWidth: '100%',
          minHeight: '600px',
          paddingTop: '20px',
        }}
      ></div>
    </div>
  );
}
```

### Key Configuration Points in the Example

- **`caseTypeID="MaintenanceManagement"`** — Replace with the target case type name from your application.
- **`action="createCase"`** — This embed creates a new case. Change to `"openAssignment"` to open an existing assignment.
- **`assignmentHeader=false`** — Hides the assignment header bar. Set to `true` to show it.
- **`casePage="assignment"`** — Shows only the current step form. Use `"fullpage"` to show the entire case view with utilities, summary panel, and additional details.
- **`grantType="clientCreds"`** — Uses Client Credentials OAuth. Switch to `"authCode"` for PKCE-based authentication.
- **`deferLoad="true"`** — Prevents automatic rendering; the code calls `.load()` programmatically after setup.
- **`theme`** — JSON string controlling the visual appearance (palette colors, button styling, label colors).
- **`startingFields`** — JSON string of field name/value pairs to pre-populate on the case. Pass `'{}'` for no pre-population (see Starting Fields section below).

### Environment Variables

Store sensitive and environment-specific values in `.env.local`:

```
NEXT_PUBLIC_PEGA_SERVER_URL=https://myapp.pegalaunchpad.com
NEXT_PUBLIC_PEGA_CLIENT_ID=your-client-id
NEXT_PUBLIC_PEGA_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_PEGA_AUTHORIZE_URI=https://myapp.pegalaunchpad.com/PRRestService/oauth2/v1/authorize
```

## Complete Example — PKCE (React / Next.js)

Below is a full working example using PKCE authentication. Note that `clientSecret` is **not** included — PKCE only requires `clientId`:

```tsx
'use client';

import React, { useEffect } from 'react';

export default function SubmitClaim() {

  useEffect(() => {
    const navigateToParent = () => {
      const loadedEmbed = document.getElementById('loadedEmbed');

      if (loadedEmbed) {
        loadedEmbed.innerHTML = `
          <div style="padding-top: 30px;">
            <p style="font-size: 20px; font-weight: bold;">Your request has been submitted.</p>
          </div>
        `;
      }
    };

    const embedParams = {
      pegaServerUrl: process.env.NEXT_PUBLIC_PEGA_SERVER_URL,
      clientId: process.env.NEXT_PUBLIC_PEGA_CLIENT_ID,
      authorizeUri: process.env.NEXT_PUBLIC_PEGA_AUTHORIZE_URI,
      theme:
        '{"base":{"palette":{"brand-primary":"#ff6600","brand-foreground":"#ff6600","border-line":"#f96302","app-background":"#f96302"}},"components":{"button":{"color":"#f96302", "foreground-color":"#FFF"}, "label":{"color":"#F96302"}}}',
      startingFields: '{}',
    };

    const loadPegaEmbed = () => {
      type CustomElement = HTMLElement & { load: () => void };
      const elDiv = document.getElementById('pegaEmbedContainer') as CustomElement;

      if (elDiv) {
        const pegaEmbedHTML = `
          <pega-embed
            id="theEmbed"
            action="createCase"
            assignmentHeader=false
            caseTypeID="Claim"
            autoReauth="true"
            pegaServerType="launchpad"
            pegaServerUrl="${embedParams.pegaServerUrl}"
            grantType="authCode"
            casePage="assignment"
            deferLoad="true"
            theme='${embedParams.theme}'
            startingFields='${embedParams.startingFields}'
            authorizeUri="${embedParams.authorizeUri}"
            clientId="${embedParams.clientId}"
            style="width: 100%; height: 100%"
          ></pega-embed>`;

        elDiv.innerHTML = pegaEmbedHTML;
        const elEmbed = document.getElementById('theEmbed') as CustomElement;

        if (elEmbed) {
          elEmbed.addEventListener('embedcaseclosed', navigateToParent);
          elEmbed.addEventListener('embedprocessingend', navigateToParent);
          elEmbed.addEventListener('embedeventcancel', navigateToParent);

          if (typeof elEmbed.load === 'function') {
            elEmbed.load();
          }
        }
      }
    };

    const loadScript = () => {
      if (
        !document.querySelector(
          "script[src='https://lp.constellation.pega.com/integrated/react/prod/pega-embed.js']"
        )
      ) {
        const script = document.createElement('script');
        script.src = 'https://lp.constellation.pega.com/integrated/react/prod/pega-embed.js';
        script.async = true;
        script.onload = () => {
          loadPegaEmbed();
        };
        document.head.appendChild(script);
      } else {
        loadPegaEmbed();
      }
    };

    loadScript();
  }, []);

  return (
    <div id="loadedEmbed">
      <div
        id="pegaEmbedContainer"
        style={{
          minWidth: '500px',
          maxWidth: '650px',
          minHeight: '500px',
          paddingTop: '20px',
        }}
      ></div>
    </div>
  );
}
```

### Key Differences from Client Credentials

- **`grantType="authCode"`** — Uses PKCE flow instead of Client Credentials
- **No `clientSecret`** — The PKCE flow does not require or use a client secret
- **Browser handles PKCE** — The embed component automatically manages the code challenge/verifier exchange

### Environment Variables (PKCE)

```
NEXT_PUBLIC_PEGA_SERVER_URL=https://myapp.pegalaunchpad.com
NEXT_PUBLIC_PEGA_CLIENT_ID=your-client-id
NEXT_PUBLIC_PEGA_AUTHORIZE_URI=https://your-cluster-frontend-url/uas/oauth/authorize
```

Note: No `NEXT_PUBLIC_PEGA_CLIENT_SECRET` is needed for PKCE.

## Theming

Theming is essential for WebEmbed — it ensures the embedded Launchpad UI **matches the look and feel of the parent window**. Without theming, the embed appears with default Launchpad branding, which can look out of place in the host site.

The `theme` attribute accepts a JSON string to customize the visual appearance of the embedded UI. The structure maps to the Constellation design token system. For the full design token schema, see [theme-design-tokens.json](../launchpad-general/assets/theme-design-tokens.json).

```json
{
  "base": {
    "palette": {
      "brand-primary": "#001f5f",
      "brand-foreground": "#001f5f",
      "border-line": "#001f5f",
      "app-background": "#001f5f"
    }
  },
  "components": {
    "button": {
      "color": "#001f5f",
      "foreground-color": "#FFF"
    },
    "label": {
      "color": "#001f5f"
    }
  }
}
```

## Starting Fields

The `startingFields` attribute allows you to pre-populate case fields when creating a case via the embed. This is useful when the host page already has context (e.g., a customer ID, campaign ID, or product selection) that should carry into the new case.

Pass `startingFields` as a JSON string in `embedParams`:

```javascript
const embedParams = {
  pegaServerUrl: process.env.NEXT_PUBLIC_PEGA_SERVER_URL,
  clientId: process.env.NEXT_PUBLIC_PEGA_CLIENT_ID,
  authorizeUri: process.env.NEXT_PUBLIC_PEGA_AUTHORIZE_URI,
  theme: '{}',
  startingFields: '{"CustomerID":"CUST-10234","Channel":"Web","CampaignID":"CAMP-5678"}',
};
```

Then reference it in the embed tag:
```html
startingFields='${embedParams.startingFields}'
```

- Field names must match the case type's **Allowed Fields** in Launchpad.
- Pass `'{}'` (empty JSON object) when no pre-population is needed.
- Only top-level scalar fields are supported in `startingFields`.

## Handling Embed Events

Listen for embed lifecycle events to control the host page experience:

```javascript
const elEmbed = document.getElementById('theEmbed');

// Case was closed by the user
elEmbed.addEventListener('embedcaseclosed', () => {
  // Navigate back, show confirmation, etc.
});

// Case processing completed successfully
elEmbed.addEventListener('embedprocessingend', () => {
  // Show success message
});

// User cancelled the action
elEmbed.addEventListener('embedeventcancel', () => {
  // Handle cancellation
});
```

## Reading and Writing Embed Data

The host page can read data from and write data to the embedded Launchpad case at runtime using methods on the `<pega-embed>` element.

### getEmbedData — Read field values from the embed

Use `getEmbedData` to read the current value of any field in the embedded case. Pass a dot-notation field path:

```javascript
const elEmbed = document.getElementById('theEmbed');

// Read a top-level field
const zipCode = elEmbed.getEmbedData('.ZipCode');

// Read a nested/reference field
const contactEmail = elEmbed.getEmbedData('.PrimaryContact.Email');
```

This is useful for:
- Syncing case data back to the host page UI
- Validating or displaying case values outside the embed
- Building cross-component data flows between the host app and the embedded case

### setEmbedData — Write field values to the embed

Use `setEmbedData` to programmatically set field values in the embedded case from the host page:

```javascript
const elEmbed = document.getElementById('theEmbed');

// Set a field value
elEmbed.setEmbedData('.ZipCode', '10001');

// Set a nested field
elEmbed.setEmbedData('.PrimaryContact.Email', 'user@example.com');
```

This is useful for:
- Passing context from the host page into the case dynamically (e.g., after a user selection)
- Keeping the embed in sync with host page state changes
- Programmatically filling fields that the host application already knows

## Best Practices

- **⚠️ Always update Subscriber CORS Policy** — The Subscriber must update the CORS policy to allow the parent domain URL. This is mandatory for WebEmbed to function. Without it, the browser blocks cross-origin requests from the embed.
- **Restrict CORS origins in production** — Never use `AllowedOrigin: "*"` in production. Specify the exact domain(s) hosting the embed.
- **Use PKCE for public-facing sites** — Client Credentials exposes the secret in browser code. Use PKCE (`grantType="authCode"`) for external user-facing applications.
- **Use `deferLoad="true"`** — This gives you control over when the embed renders, avoiding race conditions with script loading.
- **Handle all three events** — Always listen for `embedcaseclosed`, `embedprocessingend`, and `embedeventcancel` to provide a consistent user experience.
- **Match theming to host site** — Use the `theme` attribute to ensure the embedded UI matches the look and feel of the parent window, so it appears native to the host application.

## Complete Example — Landing Page Embed (openPage)

Use `action="openPage"` to embed an entire Launchpad landing page (e.g., a list of leads, a dashboard) rather than a single case creation form:

```tsx
'use client';

import React, { useEffect } from 'react';

const Leads = () => {

  useEffect(() => {
    const embedParams = {
      pegaServerUrl: process.env.NEXT_PUBLIC_PEGA_SERVER_URL,
      clientId: process.env.NEXT_PUBLIC_PEGA_CLIENT_ID,
      authorizeUri: process.env.NEXT_PUBLIC_PEGA_AUTHORIZE_URI,
      theme:
        '{"base":{"palette":{"brand-primary":"#010101","foreground-color":"#000000","border-line":"#000000","app-background":"#000000"}}}',
    };

    const loadPegaEmbed = () => {
      const elDiv = document.getElementById('leadsList');

      if (elDiv) {
        let pegaEmbedHTML = `
          <pega-embed
            id="leads"
            action="openPage"
            pageID="MyApplication__MyLandingPage"
            pageClass="PegaPlatform__Data-Portal"
            assignmentHeader=false
            caseTypeID="Lead"
            autoReauth="true"
            pegaServerType="launchpad"
            pegaServerUrl="${embedParams.pegaServerUrl}"
            grantType="authCode"
            casePage="full"
            authorizeUri="${embedParams.authorizeUri}"
            clientId="${embedParams.clientId}"
            style="width: 100%; height: 100%"
        `;

        if (embedParams.theme) {
          pegaEmbedHTML += ` theme='${embedParams.theme}'`;
        }

        pegaEmbedHTML += `></pega-embed>`;
        elDiv.innerHTML = pegaEmbedHTML;
      }
    };

    const loadScript = () => {
      if (
        !document.querySelector(
          "script[src='https://lp.constellation.pega.com/integrated/react/prod/pega-embed.js']"
        )
      ) {
        const script = document.createElement('script');
        script.src = 'https://lp.constellation.pega.com/integrated/react/prod/pega-embed.js';
        script.async = true;
        script.onload = () => {
          loadPegaEmbed();
        };
        document.head.appendChild(script);
      } else {
        loadPegaEmbed();
      }
    };

    loadScript();
  }, []);

  return (
    <section>
      <div
        id="leadsList"
        style={{ margin: '10px 0px 10px 10px' }}
      ></div>
    </section>
  );
};

export default Leads;
```

### Key Configuration Points for openPage

- **`action="openPage"`** — Opens a landing page instead of creating a case or opening an assignment.
- **`pageID="MyApplication__MyLandingPage"`** — The fully qualified ID of the portal page to open. Format: `<Namespace>__<PageName>`.
- **`pageClass="PegaPlatform__Data-Portal"`** — The class of the page being opened.
- **`casePage="full"`** — Use `"full"` to render the complete page layout.
- **No `deferLoad` or `.load()` needed** — The landing page embed renders on insertion without requiring a deferred load call.
- **No `startingFields`** — Landing pages don't accept starting fields (those apply to case creation only).
