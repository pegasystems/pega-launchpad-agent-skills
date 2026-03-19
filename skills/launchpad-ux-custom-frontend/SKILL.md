---
name: launchpad-ux-custom-frontend
description: Guide for building custom React front-ends on Pega Launchpad using the DX API v2. Use this skill whenever users ask about building a complete custom front-ends over the launchpad application. Do not use this skill for questions about DX API methods or authentication unless they specifically relate to building a custom front-end. Do not use this skill for questions about custom UX components.
tags: [react, custom-ux, frontend, dx-api, oauth, pega-launchpad]
---

# Getting Started: Building a React Front-End for Pega Launchpad

A practical guide for AI assistants and developers building custom React UIs on top of Pega Launchpad's DX API v2. This captures the lessons learned, gotchas, and patterns discovered while building this application.

Before proceeding, ensure that the developer has considered whether building a custom front-end is necessary for their use case, as Launchpad's out-of-the-box components and templates may meet their needs without the complexity of a custom implementation.
---

## 0. When to build a custom frontend for your Launchpad application

Prefer **out-of-the-box Constellation components and templates** whenever they meet the business and UX requirements. 

Consider Custom UX only when:

- The business needs many **visualizations or interaction patterns** that are not available out of the box
- You must use a very specific design system or have strict branding requirements that cannot be met with Constellation's theming capabilities

Before deciding on building a custom frontend, validate that:

- The required behavior cannot be modeled with standard Constellation views, region templates, and OOTB components.
- The custom experience can still respect Launchpad's **navigation, accessibility, and responsive** guidelines.
- The long-term **maintenance cost** (updates, security, library upgrades) is acceptable.

## 1. Architecture Overview

Pega Launchpad exposes a **DX API v2** for interacting with cases, assignments, and data views.

```
Browser  → Pega Launchpad DX API
```

### Key Components

| Component        | Purpose                                                         |
| ---------------- | --------------------------------------------------------------- |
| `pega-config.ts` | Central configuration (server URL, client ID, OAuth endpoints)  |
| `pega-auth.ts`   | OAuth 2.0 PKCE flow (login, token exchange, session management) |
| `pega-api.ts`    | API client that calls the DX API endpoints                      |

---

## 2. Information You'll Need from the Pega Launchpad Application

Before starting, gather these from the Pega Launchpad application owner:

| Item                    | Example                                                            | Where to find it                                                          |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| **Server URL**          | `https://myapp-xyz-prod.pegalaunchpad.com`                         | Launchpad environment settings                                            |
| **OAuth Client ID**     | `DUxcGyIt9QQjJBbk`                                                 | Launchpad OAuth client registration (public/PKCE client)                  |
| **OAuth Client Secret** | (stored as server secret)                                          | Same registration — keep this **server-side only**                        |
| **App Alias**           | `WorkManagement`                                                   | Application settings in Pega                                              |
| **Case Type**           | `WorkOrder`                                                        | Case type name (not the full class path for Launchpad)                    |
| **Authorize URL**       | `https://cluster-*.cluster.lp.pegaservice.net/uas/oauth/authorize` | Launchpad cluster — note this is **different** from the server URL domain |
| **Token URL**           | `{serverUrl}/dx/uas/oauth/token`                                   | Follows the server URL                                                    |

### Important: Launchpad vs Infinity Differences

- **Authorize URL**: On Launchpad, the OAuth authorize endpoint lives on a **different domain** (the cluster frontend URL), not the application server URL. The token URL _does_ use the application server URL.
- **Case Type ID**: Use the short case type name (e.g., `WorkOrder`), not the full Pega class path (e.g., `Work-Management-Work-WorkOrder`). Launchpad resolves it via the app alias.
- **API Base Path**: `/dx/api/application/v2` (not `/prweb/api/application/v2` as in Infinity).

---

## 3. Authentication: OAuth 2.0 with PKCE via `@pega/auth`

This project uses the **`@pega/auth`** npm package to handle the OAuth 2.0 Authorization Code flow with PKCE. The library manages the full lifecycle: login redirects, PKCE code challenge generation, token exchange, token refresh, and token revocation.

### How It Works

1. **`pega-config.ts`** defines the OAuth endpoints, client ID, client secret, and redirect URI.
2. **`pega-auth.ts`** wraps `@pega/auth`'s `PegaAuth` class:
   - `initiateLogin()` — clears any existing session and calls `auth.loginRedirect()` to redirect to the Pega authorize URL.
   - `handleCallback(code, state)` — validates the state parameter and exchanges the authorization code for tokens via `auth.getToken(code)`.
   - `getValidAccessToken()` — returns the current token, automatically refreshing it if it's within 60 seconds of expiry.
   - `logout()` — revokes tokens via `auth.revokeTokens()` and clears session storage.
3. Tokens are stored in **`sessionStorage`** (access token, refresh token, expiry timestamp).

### `@pega/auth` Configuration

The library reads its config from `sessionStorage` keys. Our wrapper sets these up automatically:

```ts
{
  serverType: "launchpad",
  clientId: "...",
  clientSecret: "...",
  grantType: "authCode",
  authorizeUri: "https://cluster-....cluster.lp.pegaservice.net/uas/oauth/authorize",
  tokenUri: "{serverUrl}/dx/uas/oauth/token",
  revokeUri: "{serverUrl}/dx/uas/oauth/revoke",
  redirectUri: window.location.origin + "/auth/callback",
  appAlias: "WorkManagement",
  transform: false,
}
```

> **Note:** The client secret is included in the config because `@pega/auth` handles confidential PKCE flows. In a production deployment, consider proxying the token exchange server-side.

---

## 4. Pega Launchpad Configuration Prerequisites

Before your web app can authenticate and call the DX API, you must configure two things in Pega Launchpad:

### CORS Policy

Your Launchpad application must have a **CORS policy** that includes your web app's base URL as an allowed origin. Without this, all browser requests to the DX API will be blocked by the browser's same-origin policy.

- Create a new CORS Policy rule in launchpad. Make sure the availability of the rule is set to public overridable
- Leave the origins list blank, save the rule.
- Update the app settings rule and add your CORS policy rule as the default CORS policy.
- Create a new configuration set rule and add your CORS policy rule to it.
- Commit and merge your changes to main, publish your application
- Update a subscriber with the latest version of your application
- Connect to the subscriber configuration portal and update the CORS policy rule by overridding it and add your app's origin (e.g., `https://your-app.lovable.app` or `http://localhost:5173` for local dev) to the CORS allowed origins list in Launchpad.


### OAuth Client Registration (Subscriber System)

In your Launchpad subscriber system, set up an OAuth 2.0 client with:

- **Client type:** Confidential
- **PKCE enabled:** Yes
- **Grant type:** Authorization Code
- **Redirect URI:** Your app's callback URL (e.g., `https://your-app.lovable.app/auth/callback`)

This gives you the **Client ID** and **Client Secret** needed for `pega-config.ts`.

---

## 4. DX API v2 — HTTP Methods & Patterns

Please reference:

- the launchpad-dx-APIs-Create skill for detailed patterns on using the Create Case API with scalar content payloads. The same principles apply to other DX API endpoints (e.g., assignments, data views) — focus on the required fields, HTTP methods, and response handling patterns.
- the launchpad-dx-APIs-DataPages skill for patterns on calling data pages via the DX API, including the required POST method and request body structure.
- the launchpad-dx-APIs-Get skill for patterns on retrieving cases and assignments, including handling pagination and filtering.
- the launchpad-dx-APIS-Update skill for patterns on performing actions on assignments, including the critical requirement of passing the ETag from the case creation response in the `If-Match` header.


### Cases example

| Operation     | Method | Endpoint               | Notes                                                         |
| ------------- | ------ | ---------------------- | ------------------------------------------------------------- |
| List cases    | `GET`  | `/cases`               | Returns `{ cases: [...] }`                                    |
| Get a case    | `GET`  | `/cases/{caseId}`      |                                                               |
| Create a case | `POST` | `/cases?viewType=page` | Body: `{ caseTypeID, content: {}, processID: "pyStartCase" }` |

#### Creating a Case — Response Structure

When you create a case, the response contains:

- `data.caseInfo` — the case details, content, status
- `data.caseInfo.assignments` — the assignments created as part of the case
- `data.caseInfo.actions` — available actions, potentially nested by action group name
- `nextAssignmentID` — the ID of the assignment to act on next

**Critical:** The response also includes an **ETag** in the HTTP headers. You **must** capture and store this ETag — it is required for subsequent PATCH requests on the assignment.

### Assignments

| Operation         | Method      | Endpoint                                                 | Notes                                    |
| ----------------- | ----------- | -------------------------------------------------------- | ---------------------------------------- |
| List assignments  | `GET`       | `/assignments`                                           | Returns `{ assignments: [...] }`         |
| Get assignment    | `GET`       | `/assignments/{id}`                                      |                                          |
| Perform an action | **`PATCH`** | `/assignments/{id}/actions/{actionId}?outcome={outcome}` | **Not POST!** Requires `If-Match` header |

#### Performing Assignment Actions — Key Details

Here's what you need to know:

1. **Method is PATCH, not POST.** The DX API requires `PATCH` for performing actions on assignments.

2. **`If-Match` header is required.** Pega returns a `428 Precondition Required` error if you omit it. The value comes from the **ETag** returned in the response headers of the previous API call (e.g., the `POST /cases` that created the case).

3. **The `outcome` goes in the query string**, not the body: `?outcome=Approve` or `?outcome=Reject`.

4. **The body can be empty (`{}`)** if you are not collecting user input. When you do collect input, the body contains the `content` object with field values.

5. **Action IDs** may be nested in the response under a group key (e.g., `actions.MyAppName__ReviewAndApproveDetails` rather than a flat array). You need to traverse the actions tree to find the correct action ID and its associated assignment ID.

### Data Views (Listing Objects)

Data views are the primary way to retrieve lists of objects (e.g., work orders, customers, lookup data) from Pega. Unlike `GET /cases`, which returns the authenticated user's case list, data views let you query **any savable data page** configured in your Pega application.

| Operation      | Method   | Endpoint                   | Notes                                       |
| -------------- | -------- | -------------------------- | ------------------------------------------- |
| Query data view | **`POST`** | `/data_views/{dataViewId}` | Body can contain filtering/paging parameters |

> **Important:** The method is `POST`, not `GET`. Even when you don't need to pass filters, send an empty body `{}`.

#### Example: Recent Work Orders Gadget

In this project, the Dashboard's "Recent Work Orders" gadget uses a data view called `WorkOrderList`:

```ts
// pega-api.ts
export async function getDataView(dataViewId: string, body: Record<string, unknown> = {}) {
  const result = await pegaFetch(`/data_views/${dataViewId}`, {
    method: "POST",
    body,
  });
  return result.data;
}

// Dashboard.tsx — calling it with React Query
const { data: workOrdersData } = useQuery({
  queryKey: ["pega-work-orders-list"],
  queryFn: () => getDataView("WorkOrderList"),
});

const workOrders = workOrdersData?.data || [];
```

#### Response Structure

The data view response typically contains:

```json
{
  "data": [
    { "WorkOrderID": "WO-123", "Status": "Open", "Description": "...", ... },
    { "WorkOrderID": "WO-124", "Status": "Pending", ... }
  ],
  "resultCount": 25
}
```

- `data` — an array of objects matching the data view's shape
- `resultCount` — total number of matching records

#### Finding the Data View ID

The `dataViewId` corresponds to the **data view name** configured in your Pega application (e.g., `WorkOrderList`). This is the name of the savable data page, not a class path. Ask your Pega application owner for the available data view names.

---

### Client-Side ETag Handling

The client API layer (`pega-api.ts`) unwraps this structure:

- If `_etag` is present in the response, parse `_data` as the actual data and return both `{ data, etag }`.
- Functions like `createCase()` attach the etag to the returned object (e.g., `_etag` property) so consuming components can pass it along to subsequent action calls.

---

## 6. Common Errors & Troubleshooting

| Error                                                       | Cause                                            | Fix                                                        |
| ----------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| `428 Precondition Required` / `"Request requires If-Match"` | Missing `If-Match` header on PATCH               | Pass the ETag from the previous response as `If-Match`     |
| CORS errors in browser                                      | Forgot to configure CORS in launchpad            | configure cors policy in launchpad                         |
| `401 Unauthorized`                                          | Expired or missing access token                  | Check `sessionStorage` for token; re-authenticate          |
| `"Invalid endpoint path"`                                   | Endpoint doesn't start with `/` or contains `..` | Ensure endpoint paths are properly formatted               |
| Actions not found in response                               | Actions nested under app-specific group keys     | Recursively traverse the actions object to find action IDs |
| Case type not found                                         | Using full Pega class path instead of short name | Use just the case type name (e.g., `WorkOrder`)            |

---

## 7. Examples

### WorkManagement Example

A complete working example of a custom React front-end is available in the `examples/workmanagement` folder. This example demonstrates:

- OAuth 2.0 PKCE authentication flow with `@pega/auth`
- Configuration setup in `pega-config.ts`
- Creating and retrieving cases via the DX API
- Working with assignments and performing actions
- Querying data views for work order lists
- Handling ETags and the `If-Match` header requirement
- Proper error handling and token refresh logic

You can use this as a starting point for your own custom front-end or reference it while implementing your application.

---

## 8. Quick Start Checklist

- [ ] Gather server URL, client ID, client secret, app alias, case type, and OAuth URLs from Pega Launchpad
- [ ] Store the client secret as a **server-side secret** (never in browser code)
- [ ] Use `POST` for creating cases, `GET` for reading, `PATCH` for assignment actions
- [ ] Always pass the ETag from the case creation response to subsequent assignment action calls
- [ ] Pass the `outcome` as a query parameter on assignment action PATCH requests
- [ ] Recursively search the actions tree in API responses — action IDs may be nested under app-specific group keys