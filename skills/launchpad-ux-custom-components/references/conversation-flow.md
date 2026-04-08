# Mandatory Conversation Flow for Custom Component Requests

This reference defines the **step-by-step conversation flow** that the agent MUST follow when a user requests a custom component. **Do NOT generate any code until all steps are completed and the user confirms.**

---

## Step 1: Check out-of-the-box availability

**Ask the user:**

> "Before we build a custom component, let me check: Have you verified that this requirement cannot be achieved using the out-of-the-box Constellation components available in Launchpad?
>
> Constellation provides many standard components including: Input fields, Buttons, Cards, Tables, Forms, Date pickers, Dropdowns, Modals, Tabs, and more.
>
> **Can this be achieved with existing Constellation components? (Yes/No)**"

**Actions:**
- If user answers **Yes**: Guide them to use the OOTB component. Do NOT proceed with custom component creation.
- If user answers **No**: Proceed to Step 2.

---

## Step 2: Check UX Boosters catalog

**Ask the user:**

> "Let's check the UX Boosters catalog next. UX Boosters are pre-built custom components that can be installed with a single click.
>
> Please visit: **https://launchpad.io/ux-boosters**
>
> **Did you find a component in UX Boosters that meets your requirement? (Yes/No)**"

**Actions:**
- If user answers **Yes**: Guide them to install the UX Booster. Do NOT proceed with custom component creation.
- If user answers **No**: Proceed to Step 3.

---

## Step 3: Gather component requirements

**Ask the user:**

> "Since no existing component meets your need, let's define the custom component. Please describe:
>
> 1. **What should the component do?** (Main functionality and behavior)
> 2. **Where will it be used?** (Case form, Portal landing page, Utilities pane, etc.)
> 3. **What data does it need?** (Case properties, data pages, etc.)
> 4. **What user interactions are required?** (View-only, input, selection, etc.)"

**Actions:**
- Wait for the user to provide these details before proceeding.
- If details are incomplete, ask clarifying questions.

---

## Step 4: Determine component type and confirm

Based on the user's description, determine the component type using this mapping:

| Use Case | Component Type | Subtype Examples |
|----------|---------------|------------------|
| Single input control (rating, slider, custom input) | **Field** | Integer, Text, Decimal |
| Dashboard tile, landing page panel | **Widget** | PAGE |
| Utilities pane panel, case context helper | **Widget** | CASE |
| Reusable widget for both portal and case | **Widget** | PAGE, CASE |
| Custom layout for case details | **Template** | DETAILS |
| Custom form layout | **Template** | FORM |
| Custom page layout | **Template** | PAGE |

**Present to the user:**

> "Based on your requirements, here is my recommendation:
>
> **Component Type:** [Field / Widget / Template]  
> **Subtype:** [e.g., Integer, Text, PAGE, CASE, DETAILS, FORM]  
> **Component Name:** Pega_Extensions_[SuggestedName]  
> **Summary:** [Brief description of what will be built]
>
> **Do you confirm this component type and want me to proceed with the implementation? (Yes/No)**"

**Actions:**
- If user answers **No**: Ask what needs to be changed and revise the recommendation.
- If user answers **Yes**: Proceed to Step 5.

---

## Step 5: Generate the code

Only after user confirmation in Step 4, generate the complete component code including:

1. **`config.json`** - Component metadata with proper type, subtype, and properties
2. **`index.tsx`** - React implementation using:
   - `@pega/cosmos-react-core` components (check NPM package first)
   - `withConfiguration` HOC wrapper
   - `getPConnect()` for data binding
3. **Additional files as needed:**
   - `styles.ts` (if custom styling required)
   - `Docs.mdx` (documentation)
   - `demo.stories.tsx` (Storybook stories)

---

## Flow Summary Diagram

```
User Request
     │
     ▼
┌─────────────────────────────────┐
│ Step 1: OOTB Components?        │
│ "Can this be done with OOTB?"   │
└─────────────────────────────────┘
     │ No
     ▼
┌─────────────────────────────────┐
│ Step 2: UX Boosters?            │
│ "Check launchpad.io/ux-boosters"│
└─────────────────────────────────┘
     │ No
     ▼
┌─────────────────────────────────┐
│ Step 3: Gather Requirements     │
│ What? Where? Data? Interactions?│
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│ Step 4: Confirm Component Type  │
│ Field / Widget / Template?      │
│ "Do you confirm?"               │
└─────────────────────────────────┘
     │ Yes
     ▼
┌─────────────────────────────────┐
│ Step 5: Generate Code           │
│ config.json, index.tsx, etc.    │
└─────────────────────────────────┘
```

---

## Example Conversation

**User:** "I need a star rating component for user feedback"

**Agent (Step 1):** "Before we build a custom component, have you verified that this cannot be achieved using out-of-the-box Constellation components? (Yes/No)"

**User:** "No, there's no OOTB rating component"

**Agent (Step 2):** "Let's check UX Boosters at https://launchpad.io/ux-boosters. Did you find a star rating component there? (Yes/No)"

**User:** "No, I didn't find one"

**Agent (Step 3):** "Please describe: What should it do? Where will it be used? What data does it need? What interactions are required?"

**User:** "It should allow users to click 1-5 stars. Used in a case form. Needs to save to a case field. Click to select rating."

**Agent (Step 4):** "Based on your requirements:
- **Component Type:** Field
- **Subtype:** Integer
- **Component Name:** Pega_Extensions_StarRating
- **Summary:** A 5-star rating input that saves an integer value to a case field.

Do you confirm? (Yes/No)"

**User:** "Yes"

**Agent (Step 5):** *Generates config.json, index.tsx with full implementation*
