# PCore and PConnect APIs for Launchpad Custom UX

This reference consolidates the most relevant **PConnect** and **PCore** usage patterns for building custom DXCB components in Launchpad.

It is intended as **implementation reference material** for the public skill `launchpad-ux-custom-components`.

> Source documentation: This reference is based on the "Accessing APIs from the PConnect object" and "Accessing APIs from the PCore object" sections of the public Constellation / PCore documentation, curated and adapted for Launchpad custom UX.

---

## Using PConnect in DXCB components

Use this section when you are implementing **custom DXCB components** (Templates, Widgets, Fields) and need to understand how to interact with the **PConnect object** from within your React code.

- **PConnect** is a **context-aware object** associated with a specific instance of a Constellation component.
- Each rendered component instance has its **own** PConnect object; no two components share the same object.
- When a component is removed from the UI, its PConnect object is also destroyed.
- PConnect gives you access to:
	- Case/data context (case key, current view, related assignment).
	- Actions (update field values, refresh views, open or create work).
	- Metadata (inherited props, raw metadata/config).
	- Localization services.

In DXCB components, `getPConnect` is typically passed in via props:

```ts
interface Props {
	getPConnect: () => any;
	// ...other props...
}

const MyComponent: React.FC<Props> = ({ getPConnect, ...rest }) => {
	const pConn = getPConnect();
	// use pConn APIs here
};
```

### Core PConnect responsibilities

When you build a DXCB component, use PConnect to:

1. **Read component context and configuration**
	 - Get inherited props (label, visibility, helper text, etc.).
	 - Read `config.json`-driven metadata (for example, which properties your Template binds to).

2. **Work with case/data context**
	 - Get the current case key.
	 - Get the current assignment/view name.
	 - Understand where the component is rendered (case view vs landing page).

3. **Perform actions**
	 - Update case properties (fields).
	 - Refresh the case view (when changes should re-evaluate UI).
	 - Open or create work items.
	 - Show case previews.

4. **Localize text**
	 - Use Constellation's localization layer for labels, tooltips, ARIA text.

### Commonly used PConnect APIs

From the PConnect docs and existing component examples, these are the key ones to remember.

#### `getInheritedProps()`

**Purpose:** pull in standard Constellation props into your component.

```ts
const pConn = getPConnect();
const inherited = pConn.getInheritedProps();

const propsToUse = {
	label,
	showLabel,
	...inherited,
};
```

Use this when you want:

- Labels, helper text, required/disabled flags, visibility rules to behave like any other Constellation component.
- A Template/Field/Widget that "feels" native to the UI.

#### `getRawMetadata()`

**Purpose:** read the component's raw metadata, including `config` from `config.json`.

```ts
const pConn = getPConnect();
const config = pConn.getRawMetadata().config || {};

const maxValuePropName = config.maxValueProperty?.replace('@P ', '') || '';
const minValuePropName = config.minValueProperty?.replace('@P ', '') || '';
```

Use this pattern when:

- Your component needs to know **which properties** it should read/write (for example, min/max fields for a range).
- You've defined those properties as configuration values in `config.json`.

#### `getCaseInfo()` and case info

**Purpose:** access information about the current case (or data object) context.

```ts
const pConn = getPConnect();
const caseInfo = pConn.getCaseInfo();

const caseKey = caseInfo.getKey();
const viewName = caseInfo.getCurrentAssignmentViewName();
```

Use these values when you:

- Need to **refresh a specific case view** after updates.
- Want to log or debug which case your component is bound to.

#### `getActionsApi()`

**Purpose:** perform actions that change case state or navigate within Constellation.

Update a field value:

```ts
const pConn = getPConnect();
const actionsApi = pConn.getActionsApi();

actionsApi.updateFieldValue(propertyName, newValue);
```

Refresh the case view:

```ts
const pConn = getPConnect();
const caseInfo = pConn.getCaseInfo();
const actionsApi = pConn.getActionsApi();

const caseKey = caseInfo.getKey();
const viewName = caseInfo.getCurrentAssignmentViewName();

actionsApi.refreshCaseView(caseKey, viewName, '', refreshOptions);
```

Open or preview work:

```ts
actionsApi.openWorkByHandle(pzInsKey, pxObjClass);
actionsApi.showCasePreview(handle, previewOptions);
actionsApi.createWork(className, initialPayload);
```

#### `getLocalizedValue()`

**Purpose:** use Constellation's localization layer for strings.

```ts
const pConn = getPConnect();
const label = pConn.getLocalizedValue('Minimum value');
```

Example in a range slider template for ARIA labels:

```tsx
aria-label={getPConnect().getLocalizedValue('Minimum value')}
```

Use this for labels, tooltips, ARIA attributes that should be translatable.

---

## Using PCore in DXCB components

Use this section when you are implementing **custom DXCB components** and need to understand how to interact with the **global `PCore` object** from within your React code.

From the PCore public APIs documentation:

- `PCore` is the **global Constellation runtime object** exposed on the browser window (for example, `window.PCore`).
- It provides **application- and shell-level services** that are **not scoped** to a specific component instance, such as:
	- Data access helpers (data pages and data sources).
	- Pub/sub and event utilities.
	- Navigation and semantic URLs.
	- User/session and environment information.

In DXCB components, you typically access `PCore` like this:

```ts
const PCore = (window as any).PCore;
if (!PCore) {
	// Handle missing PCore (for example, during testing or static rendering)
}
```

### When to use PConnect vs PCore

- Use **PConnect** when:
	- You are working **inside a specific component instance**.
	- You need case context, field updates, view refresh, localized labels, etc.

- Use **global `PCore`** when:
	- You need **cross-component** or **application-wide** capabilities:
		- Fetching data from data pages.
		- Publishing / subscribing to events.
		- Building semantic URLs and navigating.
		- Getting user/session info.

A typical Launchpad widget or template might:

- Use PConnect for:
	- Updating case fields.
	- Refreshing case views.
	- Case-scoped localization.

- Use PCore for:
	- Loading supporting data.
	- Listening to global events.
	- Navigating via semantic URLs.

### Key PCore utility APIs

The PCore object gives you access to several utility APIs. The ones most useful in DXCB components are:

- **Data API utilities** – `PCore.getDataApiUtils()`
- **Pub/Sub utilities** – `PCore.getPubSubUtils()`
- **Events API** – `PCore.getEvents()`
- **Semantic URL utilities** – `PCore.getSemanticUrlUtils()`
- **Environment / user info** – various getters (for example, locale, operator info), depending on the PCore version.

Access pattern:

```ts
const PCore = (window as any).PCore;

const dataApiUtils = PCore.getDataApiUtils?.();
const pubSubUtils = PCore.getPubSubUtils?.();
const eventsApi = PCore.getEvents?.();
const semanticUrlUtils = PCore.getSemanticUrlUtils?.();
```

Use optional chaining (`?.`) to avoid errors when APIs are not available (for example, when running unit tests outside a full Constellation shell).

#### Data API utilities – `PCore.getDataApiUtils()`

**Purpose:** work with **data pages** and data sources from your component.

Use this in Launchpad when:

- A widget (for example, calendar, dashboard card, summary panel) needs to load:
	- Upcoming tasks or events.
	- External system data exposed via data pages.
- A template needs supporting reference data that is not directly on the case.

Example pattern (pseudo-code, adapt to actual signatures in your version):

```ts
async function loadCalendarEvents(dataPageName: string, params: any) {
	if (!dataApiUtils) {
		return [];
	}

	const response = await dataApiUtils.getDataPage(dataPageName, params);
	return response?.data || [];
}
```

#### Pub/Sub utilities – `PCore.getPubSubUtils()`

**Purpose:** publish and subscribe to **events** across components without tight coupling.

```ts
const topic = 'launchpad.calendar.dateChanged';

const unsubscribe = pubSubUtils?.subscribe(topic, (payload: any) => {
	// React to an event from elsewhere in the app
});

// Later, to publish an event
pubSubUtils?.publish(topic, { selectedDate: newDate });

// On unmount
unsubscribe?.();
```

Use this when widgets need to coordinate behavior or react to global events (for example, refresh when a case is submitted).

#### Events API – `PCore.getEvents()`

**Purpose:** listen to and trigger **well-known Constellation events** provided by PCore.

```ts
function registerListeners() {
	eventsApi?.subscribe('assignmentSubmitted', (eventData: any) => {
		// React to assignment submission
	});
}

function unregisterListeners() {
	eventsApi?.unsubscribe('assignmentSubmitted');
}
```

Use this when you want to tie into core Constellation lifecycle events such as assignment start/end, case open/close, or navigation events.

#### Semantic URL utilities – `PCore.getSemanticUrlUtils()`

**Purpose:** build and interpret **semantic URLs** for navigation and linking.

```ts
const caseUrl = semanticUrlUtils?.getFullUrlForCase('T-123', {
	// options depending on version (open in new tab, preview, etc.)
});
```

Use this when widgets display lists of items or cases and you want each row to link to a case or view using Constellation’s semantic URL conventions.

#### Environment and session information

Depending on your PCore version, the docs describe APIs to get environment/session info, for example:

- Current operator (user) details.
- Locale and formatting info.
- Application and portal names.

```ts
const localeInfo = PCore.getLocaleInfo?.();
const operatorInfo = PCore.getEnvironmentInfo?.().getOperatorInfo?.();
```

Use this when you need to adjust behavior based on user locale or role, or when you want to add context-aware UX (for example, showing a friendly name or localized summary).

---

## Design patterns summary

When designing or generating a new DXCB component, apply these combined patterns:

1. **Field components**
	 - Mostly PConnect-driven (`getInheritedProps`, `getActionsApi().updateFieldValue`, `getLocalizedValue`).
	 - Use PCore only if the field dynamically loads reference data or reacts to rare global events.

2. **Templates (DETAILS / FORM / PAGE)**
	 - Use PConnect to read configuration (`getRawMetadata().config`), update fields, and refresh views.
	 - Use PCore to coordinate multiple related data sets via data pages and to respond to global events.

3. **Widgets (PAGE / CASE / PAGE & CASE)**
	 - Use PConnect’s `getActionsApi()` for opening, previewing, and creating work.
	 - Use PCore’s data APIs, pub/sub, events, and semantic URLs for loading data and navigation.

By consistently distinguishing when to use **PConnect** vs **PCore**, your custom Launchpad components will integrate cleanly with Constellation, behave predictably, and remain easy to evolve as PCore grows.
