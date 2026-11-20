// Launchpad Learn — course content.
// Each module is plain data; the app (index.html) renders it.
// New modules can be appended as the tutorial progresses.

window.COURSE = {
  title: "Launchpad for Python & Web Developers",
  audience: "for Python & web devs",
  app: {
    name: "Loan Ranger",
    namespace: "LoanRanger",
    branch: "BP-2316013",
    note: "All of the team's app rules currently live in branch BP-2316013. Main only contains PegaPlatform rules so far. Check with the team whether that is intentional before you start making changes."
  },

  glossary: [
    ["Rule", "The unit of everything in Launchpad: a versioned JSON document with a type, ID and namespace. Fields, views, stages, decisions, and case types are all rules."],
    ["RuleResolutionID", "The rule's identifier (its 'name' in code). Other rules reference it by this ID plus namespace."],
    ["Namespace", "Package-like prefix that owns a rule. Your team's rules: LoanRanger. Built-ins: PegaPlatform."],
    ["AppliesTo", "The class a rule belongs to, like the class a Python method is defined on. Referenced rules are usually found in the same class or a parent class."],
    ["CaseType (rule)", "One rule type that implements Cases, Data and Personas. The Category field decides which one it is."],
    ["Case", "Work that gets done. It has a lifecycle (stages), assignments, routing and a resolution."],
    ["Data (object type)", "Reference information with no workflow, only Active or Inactive. Looked up and linked to cases."],
    ["Persona", "A type of user: what they can access and which portal they see. Personas are also referenced on cases to define who does what."],
    ["Stage", "A major phase of a case lifecycle, e.g. Eligibility Review. Primary stages are the happy path. Alternate stages are exits and detours."],
    ["Transition", "How a stage hands off: Automatic (to the next primary stage), Manual (something must move it), or Resolution (closes the case)."],
    ["Primary fields", "The key fields of a case or data type. They auto-populate the Create, Edit and Summary views."],
    ["Optional action", "An action users can launch on a case at any time (Edit, Change stage, Reassign…), often gated by a visibility Decision."],
    ["Decision", "A rule that evaluates inputs and returns a typed result, like a pure function. IsCaseOpen is a platform Decision."],
    ["Designer", "A high-level Studio editor (Cases, Data & Integrations, Personas, Insights, App Settings). One edit can write many rules."],
    ["Rule form", "A Studio form for editing a single rule, found under the Rules Library and grouped by category."],
    ["Platform layer", "Built-in Launchpad rules (namespace PegaPlatform) that your app layer builds on and can override."],
    ["Branch", "An isolated workspace of rule changes off main, conceptually like a git branch."]
  ],

  modules: [
    {
      id: "m1",
      num: 1,
      title: "The mental model",
      subtitle: "Rules, and Cases / Data / Personas",
      analogy: "Your whole codebase, stored as JSON",
      ready: true,
      minutes: 15,
      sections: [
        {
          type: "text",
          title: "1.1 Everything is a rule",
          html: `<p>A Launchpad app has no Python files and no templates. <b>Everything is a <i>rule</i></b>: a versioned JSON document with a type, a name and a namespace. A field is a rule. A form is a rule. A workflow stage is a rule. So is an if/else check.</p>`
        },
        {
          type: "table",
          headers: ["Launchpad", "Think of it as…"],
          rows: [
            ["<b>Rule</b> (type + <code>RuleResolutionID</code>)", "A source file / class / function"],
            ["<b>AppliesTo</b> class", "The class a method is defined on"],
            ["<b>Rule reference</b> <code>{ReferenceID, Namespace}</code>", "An import"],
            ["<b>Namespace</b> (<code>LoanRanger</code>, <code>PegaPlatform</code>)", "A package name"],
            ["<b>Branch</b>", "A git branch of rule changes"]
          ]
        },
        {
          type: "callout",
          kind: "tip",
          html: `<b>Create dependencies first.</b> If rule A calls rule B, B has to exist before A, the same way you can't import a module that doesn't exist.`
        },
        {
          type: "text",
          title: "Three ways to edit rules",
          html: `<ol>
            <li><b>Designers</b>: high-level visual editors in Studio. One change in the Case Designer can write many rules.</li>
            <li><b>Rule forms</b>: a form for editing one rule at a time, under the <b>Rules Library</b>.</li>
            <li><b>APIs / MCP</b>: editing the JSON directly. This is what an AI coding agent does through the Launchpad authoring MCP.</li>
          </ol>
          <p>As a developer you'll be tempted to go straight to the JSON. <b>Learn in the designers first.</b> They show you how the rules fit together.</p>`
        },
        {
          type: "text",
          title: "1.2 The three core concepts",
          html: `<p>Almost every Launchpad conversation comes back to <b>Cases, Data and Personas</b>. Technically, all three are the same rule type, <code>CaseType</code>, with a different <code>Category</code> value.</p>`
        },
        {
          type: "table",
          headers: ["Concept", "What it is", "Web-dev analogy", "In your app"],
          rows: [
            ["<span class='pill case'>Case</span>", "Work that gets done: lifecycle, stages, assignments, resolution", "A model with a state machine and a human task queue", "Loan Application, <b>Preapproval</b>, Document Verification, Credit Decisioning, Funds Disbursement"],
            ["<span class='pill data'>Data</span>", "Information that exists, Active or Inactive, with no workflow", "A plain ORM model or reference table", "Platform ones: Country, Timezone"],
            ["<span class='pill persona'>Persona</span>", "A type of user: what they can access and which portal they see", "A role or group, plus its dashboard", "Loan Officer, Underwriter, Customer Service Agent, Retail Customer"]
          ]
        },
        {
          type: "lifecycle",
          title: "1.3 A real rule: the Preapproval case type",
          primary: [
            { name: "Application Intake", tag: "init" },
            { name: "Data Verification", tag: "Automatic" },
            { name: "Eligibility Review", tag: "Automatic" },
            { name: "Decision & Notify", tag: "Resolution" }
          ],
          alternate: [
            { name: "Withdrawn", tag: "Resolution" },
            { name: "Rework Request", tag: "Manual" },
            { name: "Pre-approval Denied", tag: "Manual" }
          ]
        },
        {
          type: "code",
          caption: "Trimmed from the actual rule in branch BP-2316013",
          code: `{
  "Type": "CaseType",
  "Category": "Case",
  "Name": "Preapproval",
  "RuleResolutionID": "PreapprovalWorkflow",
  "Namespace": "LoanRanger",
  "IDPrefixExpression": {"Type": "ConstantText", "Value": "Preapproval-"},
  "InitializationStage": {"Stage": {"ReferenceID": "ApplicationIntake"}},
  "PrimaryStages": [
    {"Stage": {"ReferenceID": "DataVerification"},  "Transition": "Automatic"},
    {"Stage": {"ReferenceID": "EligibilityReview"}, "Transition": "Automatic"},
    {"Stage": {"ReferenceID": "DecisionNotify"},    "Transition": "Resolution"}
  ],
  "AlternateStages": [
    {"Stage": {"ReferenceID": "Withdrawn"},          "Transition": "Resolution"},
    {"Stage": {"ReferenceID": "ReworkRequest"},      "Transition": "Manual"},
    {"Stage": {"ReferenceID": "Pre-approvalDenied"}, "Transition": "Manual"}
  ],
  "PrimaryFields": ["ApplicantName", "RequestedLoanAmount", "AnnualSalary", "LoanTerm", "HomeType"],
  "OptionalActions": [
    {"Action": {"ReferenceID": "Edit", "Namespace": "PegaPlatform"},
     "VisibilityCondition": {"Decision": {"CallReference":
        {"ReferenceID": "IsCaseOpen", "Namespace": "PegaPlatform"}}}}
  ]
}`,
          notes: [
            "<b>The case type is mostly references.</b> Stages, fields and actions are each separate rules. This JSON wires them together.",
            "<b>Two lanes of stages.</b> Primary stages are the happy path. Alternate stages are exits and detours.",
            "<b>App rules call platform rules.</b> <code>Edit</code> and <code>IsCaseOpen</code> come from <code>PegaPlatform</code>, so your team didn't write them. Layers are covered in Module 7."
          ]
        },
        {
          type: "handson",
          title: "Hands-on (5 min)",
          steps: [
            "Open Studio and switch to branch <code>BP-2316013</code>.",
            "Go to the <b>Cases</b> designer and open <b>Preapproval</b>.",
            "Find the four primary stages and three alternate stages from the diagram above.",
            "Compare what the designer shows with the JSON. What does the designer hide from you?"
          ]
        }
      ],
      quiz: [
        {
          id: "m1q1",
          type: "mcq",
          q: "Which stage resolves (closes) a Preapproval case on the happy path?",
          options: [
            { t: "Eligibility Review", why: "Its transition is Automatic, so it hands off to the next primary stage." },
            { t: "Decision & Notify", correct: true, why: "Its transition is Resolution, so the case closes with status Resolved-Completed2." },
            { t: "Pre-approval Denied", why: "That's an alternate stage, not the happy path, and its transition is Manual." },
            { t: "Application Intake", why: "That's the initialization stage, where the case starts." }
          ]
        },
        {
          id: "m1q2",
          type: "mcq",
          q: "Besides the happy path, which alternate stage also resolves the case on entry?",
          options: [
            { t: "Rework Request", why: "Manual transition. It's a detour, not an exit." },
            { t: "Pre-approval Denied", why: "Surprise: its transition is Manual, not Resolution. Something else has to close the case. That's worth asking the team about." },
            { t: "Withdrawn", correct: true, why: "Transition is Resolution, so it resolves with status Resolved-Withdrawn2." }
          ]
        },
        {
          id: "m1q3",
          type: "mcq",
          q: "A new Preapproval case is created. Roughly what will its ID look like?",
          options: [
            { t: "PreapprovalWorkflow-1", why: "PreapprovalWorkflow is the rule's RuleResolutionID, not the case ID prefix." },
            { t: "A random UUID", why: "Rule IDs are UUIDs, but case IDs use the configured prefix." },
            { t: "Preapproval-<number>", correct: true, why: "IDPrefixExpression is the constant text \"Preapproval-\", followed by a generated number." }
          ]
        },
        {
          id: "m1q4",
          type: "classify",
          q: "Classify each thing as a Case, Data or Persona.",
          choices: ["Case", "Data", "Persona"],
          items: [
            { label: "A <b>Property Appraisal</b> that an appraiser schedules, does and submits", answer: "Case", why: "It's work with a lifecycle, an owner and a finish line." },
            { label: "A list of <b>Lenders</b> with name, NMLS number and active flag", answer: "Data", why: "It's reference info with an active flag and no workflow." },
            { label: "A <b>Branch Manager</b> who approves exceptions", answer: "Persona", why: "It's a type of user. Approvals are routed to them and they get their own portal." }
          ]
        }
      ]
    },

  ]
};
// Launchpad Learn — Modules 2–8. Grounded in Loan Ranger, branch BP-2316013.
window.COURSE.modules.push(

/* ───────────────────────── MODULE 2 ───────────────────────── */
{
  id: "m2", num: 2, title: "Case lifecycle", subtitle: "Stages, processes, steps, assignments",
  analogy: "A state machine with human tasks", ready: true, minutes: 20,
  sections: [
    { type: "text", title: "2.1 The hierarchy",
      html: `<p>A case lifecycle is built from four nested levels. Each level is its own rule:</p>
      <div class="hier"><span>Case Type</span>→<span>Stages</span>→<span>Processes</span>→<span>Steps</span></div>
      <p>The <b>CaseType</b> lists stages (Module 1). Each <b>Stage</b> rule lists the processes it runs. Each <b>Process</b> rule is a small flow graph made of <i>nodes</i> (steps) and <i>connectors</i> (edges).</p>` },
    { type: "code", caption: "Stage rule: EligibilityReview (complete)",
      code: `{
  "Type": "Stage",
  "Name": "Eligibility Review",
  "RuleResolutionID": "EligibilityReview",
  "AppliesTo": {"ReferenceID": "PreapprovalWorkflow"},
  "Description": "Determine if the applicant meets specific product criteria and guidelines.",
  "Processes": [
    {"Process": {"ReferenceID": "EvaluateCriteria"}, "SkipProcess": {"SkipType": "Never"}}
  ]
}`,
      notes: ["The stage is thin. It only says which processes run and whether any can be skipped. The real logic is in the process."] },
    { type: "table", title: "2.2 Step (node) types you'll see in this app",
      headers: ["Node type", "What it does", "Python analogy"],
      rows: [
        ["<code>Start</code> / <code>End</code>", "Entry and exit of a process", "<code>def</code> … <code>return</code>"],
        ["<code>Assignment</code>", "<b>Human work.</b> The case waits until a user or work queue submits a form (an Action).", "<code>await user_submits(form)</code>"],
        ["<code>CallAutomation</code>", "A system step that calls an Automation rule", "A function call"],
        ["<code>Process-Decision</code>", "Calls a Decision rule and follows the connector that matches the result", "<code>match result:</code>"],
        ["<code>GoTo</code>", "Jumps to another node", "<code>goto</code> (sorry)"]
      ] },
    { type: "flow", title: "2.3 Real process: Evaluate Criteria",
      intro: "This is the only process in Eligibility Review. Trace it the way you'd trace a function:",
      spine: [ {name: "Start", kind: "start"}, {name: "Match Products", kind: "auto"}, {name: "Evaluate Conditions", kind: "decision"} ],
      branches: [
        { label: "Approved", path: [ {name: "Change Stage → Decision & Notify", kind: "auto"}, {name: "End", kind: "end"} ] },
        { label: "Denied", path: [ {name: "Change Stage → Decision & Notify", kind: "auto"}, {name: "End", kind: "end"} ] },
        { label: "Conditional", path: [ {name: "Summarize Eligibility", kind: "auto"}, {name: "End", kind: "end"} ] },
        { label: "Manual Review", path: [ {name: "GoTo → Summarize Eligibility", kind: "goto"}, {name: "End", kind: "end"} ] },
        { label: "otherwise", path: [ {name: "GoTo → Summarize Eligibility", kind: "goto"}, {name: "End", kind: "end"} ] }
      ] },
    { type: "callout", kind: "found",
      html: `<b>Read it like a code review.</b> Two things stand out:
      <ul><li><b>Denied</b> goes to <i>Decision & Notify</i>, not the <i>Pre-approval Denied</i> alternate stage.</li>
      <li><b>Manual Review</b> has no human Assignment. It only summarizes and ends.</li></ul>
      This app started from a generated blueprint. Paths like these may be scaffolding nobody has finished yet. Ask the team before you "fix" them.` },
    { type: "code", caption: "An Assignment node from the Request Info process (Rework Request stage)",
      code: `{
  "Type": "Assignment",
  "Name": "Receive Updates",
  "Action": {"ReferenceID": "ReceiveUpdates"},
  "Routing": {
    "RoutingType": "WorkQueue",
    "RouteTo": {"Type": "ConstantRuleReference", "RuleType": "WorkQueue",
                "ReferencedRule": {"ReferenceID": "RetailCustomer"}}
  },
  "ToConnectors": [{"Name": "Submit", "Value": "Submit"}]
}`,
      notes: [
        "<b>Action</b> is the form the user fills in. It's another rule, which references a View.",
        "<b>Routing</b> decides who gets the task. Here it goes to the <i>RetailCustomer</i> work queue (more in Module 5).",
        "The case stays on this node until someone submits. Then it follows the <i>Submit</i> connector."
      ] },
    { type: "text", title: "2.4 Statuses",
      html: `<p>Each stage sets an <b>entry status</b> on the case, such as <code>Pending-EligibilityReview</code>. A Resolution transition sets a resolved status, such as <code>Resolved-Completed2</code> or <code>Resolved-Withdrawn2</code>. Treat status as the coarse state-machine value that reports, worklists and conditions like the platform's <code>IsCaseOpen</code> decision rely on.</p>` },
    { type: "handson", title: "Hands-on (5 min)", steps: [
      "Cases designer → <b>Preapproval</b> → <b>Workflow</b> tab.",
      "Open <b>Eligibility Review</b> → <b>Evaluate Criteria</b>. Find the five connectors leaving <i>Evaluate Conditions</i>.",
      "Open the <b>Rework Request</b> alternate stage → <b>Request Info</b>. Find the <i>Receive Updates</i> assignment and its routing.",
      "Note one question for the team about the Denied or Manual Review paths."
    ] }
  ],
  quiz: [
    { id: "m2q1", type: "mcq", q: "An applicant evaluates to \"Denied\" in Evaluate Criteria. Which stage does the case move to?",
      options: [
        { t: "Pre-approval Denied", why: "That's what you'd expect, but the Change Stage step on the Denied path targets DecisionNotify." },
        { t: "Decision & Notify", correct: true, why: "Both the Approved and Denied paths call ChangeToSpecifiedStage with Stage = DecisionNotify." },
        { t: "Rework Request", why: "Nothing in Evaluate Criteria goes there." },
        { t: "It stays in Eligibility Review", why: "Change Stage moves it out explicitly." }
      ] },
    { id: "m2q2", type: "mcq", q: "Which node type creates work for a human?",
      options: [
        { t: "CallAutomation", why: "System step, so no human is involved." },
        { t: "Process-Decision", why: "It only branches on a Decision result." },
        { t: "Assignment", correct: true, why: "An Assignment pauses the case until a routed user or queue submits its Action." }
      ] },
    { id: "m2q3", type: "classify", q: "What type of node is each step in your app?",
      choices: ["Assignment", "Automation", "Decision"],
      items: [
        { label: "<b>Match Products</b> in Evaluate Criteria", answer: "Automation", why: "CallAutomation → MatchProducts." },
        { label: "<b>Evaluate Conditions</b> with five outgoing outcomes", answer: "Decision", why: "Process-Decision calling the EvaluateConditions decision." },
        { label: "<b>Receive Updates</b> routed to RetailCustomer", answer: "Assignment", why: "Human task with an Action and Routing." }
      ] },
    { id: "m2q4", type: "mcq", q: "What does the \"Manual Review\" outcome do today?",
      options: [
        { t: "Creates a task for an Underwriter", why: "There's no Assignment on that path." },
        { t: "Jumps to Summarize Eligibility, then ends, with no human involved", correct: true, why: "It's a GoTo to the Summarize Eligibility automation. This is a likely gap and a good first contribution to discuss with the team." },
        { t: "Moves the case to Rework Request", why: "No Change Stage on that path." }
      ] }
  ]
},

/* ───────────────────────── MODULE 3 ───────────────────────── */
{
  id: "m3", num: 3, title: "Data model", subtitle: "Fields, data types, relationships, data pages",
  analogy: "ORM models plus cached query endpoints", ready: true, minutes: 20,
  sections: [
    { type: "text", title: "3.1 Fields are rules too",
      html: `<p>Every attribute is a <b>Field</b> rule whose <code>AppliesTo</code> is the class it belongs to. Preapproval has <b>29 fields</b> in your branch: ApplicantName, AnnualSalary, CreditScore, DownPayment, PurchasePrice, RequestedLoanAmount, YearBuilt and more. Think of each as one column on a Django model, with metadata.</p>` },
    { type: "code", caption: "A plain field: PropertyLocation",
      code: `{
  "Type": "Field",
  "Name": "Property Location",
  "RuleResolutionID": "PropertyLocation",
  "AppliesTo": {"ReferenceID": "PreapprovalWorkflow"},
  "Mode": "Text",
  "Description": "Location of the property being purchased"
}` },
    { type: "code", caption: "A calculated field: LoanToValueRatio (added in your branch)",
      code: `{
  "Type": "Field",
  "Name": "Loan to Value Ratio",
  "RuleResolutionID": "LoanToValueRatio",
  "Mode": "Decimal",
  "DisplayAs": "Percentage",
  "IsCalculated": true,
  "CalculatedValue": {
    "Type": "CallExpression", "CallType": "Decision",
    "CallReference": {"ReferenceID": "LoanToValueRatio"}
  }
}`,
      notes: [
        "<b>Calculated field ≈ <code>@property</code>.</b> Its value comes from a Decision rule (Module 4), so users can't type it in.",
        "<code>Mode</code> is the storage type. <code>DisplayAs</code> controls how it's shown.",
        "Field shapes you'll meet: scalar, prompt-list (picklist), embedded data, object reference, calculated, and relationship fields."
      ] },
    { type: "callout", kind: "found",
      html: `<b>Possible duplicates:</b> the branch has both <code>HomeType</code> and <code>HomeType2</code> ("Home Type"), and both <code>LoanTerm</code> and <code>LoanTerm2</code> ("Loan term"). <code>HomeType</code> and <code>LoanTerm</code> are the ones in PrimaryFields. Before cleaning these up, search for references to the "2" versions. Unreferenced rules are like dead code, but they may be used in a view.` },
    { type: "text", title: "3.2 Primary fields",
      html: `<p><code>PrimaryFields</code> on the CaseType (ApplicantName, ApplicantContactInformation, RequestedLoanAmount, AnnualSalary, LoanTerm, HomeType, Description) <b>auto-populate the Create, Edit and Summary views</b>. A web developer would write three templates for this. In Launchpad you curate one list.</p>` },
    { type: "table", title: "3.3 Relationships",
      headers: ["Relationship", "When", "Analogy"],
      rows: [
        ["<b>Parent / child</b> (Case ↔ Case)", "A case spawns sub-cases, e.g. Loan Application → Document Verification", "Aggregate root and child entities"],
        ["<b>Reference</b> field (Case ↔ Data, Data ↔ Data)", "Point at an independent record by key", "<code>ForeignKey</code>"],
        ["<b>Embedded</b> field", "The data lives inside the parent and has no life of its own", "A JSON column or value object"]
      ] },
    { type: "text", title: "3.4 Data Pages: how data is read",
      html: `<p>A <b>Data Page</b> is a named, parameterized, read-only data source. Views, picklists, automations and the case type itself read through it. The chain is:</p>
      <div class="hier"><span>Data Page</span>→<span>Data Connection</span>→<span>Query (internal) or REST Connector (external)</span></div>
      <p>Think <b>repository function / GET endpoint</b>, with optional caching. Every case type in your app gets a <b>List</b> page and a <b>Lookup</b> (single record) page. Preapproval has <code>PreapprovalWorkflowList</code> and <code>PreapprovalWorkflowLookup</code>.</p>` },
    { type: "code", caption: "PreapprovalWorkflowLookup (trimmed)",
      code: `{
  "Type": "DataPage",
  "RuleResolutionID": "PreapprovalWorkflowLookup",
  "DataPageMode": "SingleRecord",
  "Inputs": [{"Name": "ID", "Required": "true", "Description": "object key"}],
  "DataConnection": {
    "CallType": "DataConnection",
    "CallReference": {"ReferenceID": "PreapprovalWorkflowLookup"},
    "CallInputs": [{"ParameterName": "ID", "Source": {"Type": "Variable", "Name": "ID"}}]
  },
  "Output": {"Mode": "SingleRecord", "ObjectType": {"TypeReferenceID": "PreapprovalWorkflow"}},
  "CachingEnabled": false
}`,
      notes: ["Python version: <code>def preapproval_lookup(ID: str) -> Preapproval</code>. The DataConnection is the implementation behind it."] },
    { type: "handson", title: "Hands-on (5 min)", steps: [
      "Cases → Preapproval → <b>Data model</b> tab. Find <i>Loan to Value Ratio</i> and confirm it's calculated.",
      "Open <b>Data & Integrations</b> and look at the Data Pages for Preapproval.",
      "Find what references <code>HomeType2</code>: search the Rules Library in Studio, or ask your Launchpad-connected agent <i>\"Which rules reference HomeType2?\"</i> and watch it call <code>search_rules</code>."
    ] }
  ],
  quiz: [
    { id: "m3q1", type: "mcq", q: "Closest Python analogy for a calculated field like LoanToValueRatio?",
      options: [
        { t: "A model column with a default value", why: "Defaults are set once. A calculated field is derived every time." },
        { t: "A @property computed from other attributes", correct: true, why: "Its value comes from calling the LoanToValueRatio Decision, and it's read-only." },
        { t: "A database trigger", why: "Close, but there's no write side effect." }
      ] },
    { id: "m3q2", type: "mcq", q: "What do you pass to PreapprovalWorkflowLookup, and what comes back?",
      options: [
        { t: "Nothing → a list of all preapprovals", why: "That's PreapprovalWorkflowList." },
        { t: "ID → one Preapproval record", correct: true, why: "Required input ID, SingleRecord output." },
        { t: "A query string → JSON from a REST API", why: "This one uses an internal DataConnection, not a REST connector." }
      ] },
    { id: "m3q3", type: "classify", q: "Which relationship would you use for each?",
      choices: ["Parent/child", "Reference", "Embedded"],
      items: [
        { label: "Preapproval points to a <b>Lender</b> record that many cases share", answer: "Reference", why: "It's an independent record shared by many cases." },
        { label: "Loan Application spawns a <b>Document Verification</b> case", answer: "Parent/child", why: "Case to case, where the child has its own lifecycle." },
        { label: "An applicant's <b>mailing address</b> that only matters on this case", answer: "Embedded", why: "It has no independent identity." }
      ] },
    { id: "m3q4", type: "mcq", q: "You want to delete HomeType2. What do you do first?",
      options: [
        { t: "Delete it. It's clearly a duplicate.", why: "Views or automations may reference it, and the build would break." },
        { t: "Search for references to it, and check with the team", correct: true, why: "Treat it like dead-code removal: find usages first. search_rules over the JSON can do that." }
      ] }
  ]
},

/* ───────────────────────── MODULE 4 ───────────────────────── */
{
  id: "m4", num: 4, title: "Business logic", subtitle: "Decisions, automations, validations, expressions",
  analogy: "Pure functions, scripts and form validators", ready: true, minutes: 25,
  sections: [
    { type: "table", title: "4.1 The logic toolbox",
      headers: ["Rule type", "What it is", "Python analogy", "In your app"],
      rows: [
        ["<b>Decision</b>", "Evaluates inputs and returns a typed result. Builder, Expression, or Table logic.", "Pure function", "53 decisions, e.g. LoanToValueRatio, RiskAssessmentScore, IdentifyRedFlags"],
        ["<b>Automation</b>", "A sequence of steps with side effects: set fields, call rules, send notifications, create cases", "A script / service function", "127 automations, e.g. MatchProducts, GenerateOfferLetter"],
        ["<b>Validation</b>", "Blocks a submit when data is invalid. Often gated by a Decision (\"required only when…\")", "Form <code>clean()</code> / validators", "—"],
        ["<b>Expression</b>", "Inline formula, stored as a JSON AST", "An expression tree (<code>ast</code>)", "Inside every Decision"],
        ["<b>Function</b>", "Reusable operation. Custom functions can run Java, Python 3.12 or Node.js on AWS Lambda.", "A library function", "—"]
      ] },
    { type: "code", caption: "Decision: LoanToValueRatio (Table logic, trimmed)",
      code: `{
  "Type": "Decision",
  "RuleResolutionID": "LoanToValueRatio",
  "AppliesTo": {"ReferenceID": "PreapprovalWorkflow"},
  "LogicType": "Table",
  "Output": {"Mode": "SingleRecord", "ObjectType": {"TypeReferenceID": "Decimal"}},
  "DefaultReturn": {"Type": "ConstantDouble", "Value": "0"},
  "Logic": {
    "Headers": [{"Label": "Purchase Price",
                 "Source": {"Type": "FieldReference", "Root": {"Type": "Variable", "Name": "Primary"},
                            "Field": {"ReferenceID": "PurchasePrice"}},
                 "Comparator": {"Operator": ">"}}],
    "Rows": [{"Columns": [{"CellRows": [{"Expression": {"Type": "ConstantInteger", "Value": 0}}]}]}],
    "ReturnColumn": [{"ExpressionType": "/", "Expressions": [
        {"ExpressionType": "*", "Expressions": [ "Primary.RequestedLoanAmount", 100 ]},
        "Primary.PurchasePrice" ]}]
  }
}`,
      notes: [
        "<b>Read it as Python:</b><pre class='py'>def loan_to_value_ratio(self) -> Decimal:\n    if self.PurchasePrice > 0:\n        return self.RequestedLoanAmount * 100 / self.PurchasePrice\n    return 0</pre>",
        "<code>Root: Variable \"Primary\"</code> ≈ <code>self</code>, meaning the current case.",
        "The header column is the condition (<code>PurchasePrice &gt; …</code>), each row supplies a value (0), and the return column is the result. If no row matches, <code>DefaultReturn</code> is used."
      ] },
    { type: "callout", kind: "found",
      html: `<b>Stub automations.</b> <code>MatchProducts</code> has a good description ("determine suitable loan products…") but <code>Inputs: []</code> and <b>no steps</b>. Many automations generated from the blueprint look like this: named, described and wired into processes, but empty. <b>Implementing one is a classic first ticket.</b>` },
    { type: "text", title: "4.2 Scope matters: same name, different class",
      html: `<p>There are <b>two</b> <code>CreditScore</code> decisions, one on <code>PreapprovalWorkflow</code> and one on <code>CreditDecisioningWorkflow</code>. There are <b>four</b> <code>Name</code> decisions, one per case type. They're different rules. When a Preapproval process calls <code>CreditScore</code>, it resolves against the Preapproval class, just like <code>self.credit_score()</code> resolves on the instance's class.</p>` },
    { type: "text", title: "4.3 Where logic plugs in",
      html: `<ul>
        <li><b>Process-Decision nodes</b> branch on a Decision result (Module 2).</li>
        <li><b>CallAutomation nodes</b> run an Automation.</li>
        <li><b>Calculated fields</b> call a Decision (Module 3).</li>
        <li><b>Visibility conditions</b>, e.g. <code>IsCaseOpen</code> gating optional actions (Module 1).</li>
        <li><b>Actions</b> run validations and pre/post automations when a form is submitted.</li></ul>` },
    { type: "handson", title: "Hands-on (5 min)", steps: [
      "Rules Library → <b>App Logic</b> → <b>Decisions</b>. Open <i>Loan to Value Ratio</i> and compare the table UI with the JSON above.",
      "Open the <i>Match Products</i> automation and confirm it's empty.",
      "Open <i>Risk Assessment Score</i> on Preapproval in Studio and write it out as Python pseudocode. Optionally, ask your Launchpad-connected agent to do the same and compare."
    ] }
  ],
  quiz: [
    { id: "m4q1", type: "mcq", q: "RequestedLoanAmount = 360,000 and PurchasePrice = 400,000. What does LoanToValueRatio return?",
      options: [ { t: "0.9", why: "It multiplies by 100 first." }, { t: "90", correct: true, why: "360000 × 100 / 400000 = 90 (shown as a percentage)." }, { t: "0", why: "Only when PurchasePrice isn't > 0." } ] },
    { id: "m4q2", type: "mcq", q: "PurchasePrice hasn't been entered yet (0). What happens?",
      options: [ { t: "Division-by-zero error", why: "The table guards against it." }, { t: "Returns null", why: "DefaultReturn is 0." }, { t: "Returns 0", correct: true, why: "The row doesn't match, so DefaultReturn (0) is used." } ] },
    { id: "m4q3", type: "classify", q: "Which rule type fits each requirement?",
      choices: ["Decision", "Automation", "Validation"],
      items: [
        { label: "Compute a <b>risk score</b> from credit score and DTI", answer: "Decision", why: "Pure, typed result." },
        { label: "<b>Generate the offer letter</b> and email it to the applicant", answer: "Automation", why: "Steps with side effects." },
        { label: "<b>Block submit</b> if DownPayment is negative", answer: "Validation", why: "Stops bad data at the form." }
      ] },
    { id: "m4q4", type: "mcq", q: "A step in a Preapproval process calls CreditScore. Which CreditScore decision runs?",
      options: [ { t: "The one on CreditDecisioningWorkflow", why: "Wrong class." }, { t: "The one whose AppliesTo is PreapprovalWorkflow", correct: true, why: "References resolve in the caller's class (or its parents)." }, { t: "Whichever was edited last", why: "Resolution is by class and layer, not by time." } ] }
  ]
},

/* ───────────────────────── MODULE 5 ───────────────────────── */
{
  id: "m5", num: 5, title: "Personas, access & routing", subtitle: "Who can do what, and where work goes",
  analogy: "Auth groups and permissions, task queues", ready: true, minutes: 15,
  sections: [
    { type: "text", title: "5.1 From persona to permissions",
      html: `<div class="hier"><span>Persona</span>→<span>Access Group</span>→<span>Access Roles · Portals · Work Queues</span></div>
      <p>A <b>Persona</b> (a CaseType rule with Category Persona) is the business idea of a user type. Its <b>Access Group</b> is the security wiring: which <b>Access Roles</b> grant privileges, which <b>Portals</b> the user can open, and which <b>Work Queues</b> they pull work from. Each user has one persona.</p>
      <p>Your app has five access groups: Loan Officer, Underwriter, Customer Service Agent, Retail Customer, and <i>Developers (preview only)</i>.</p>` },
    { type: "code", caption: "AccessGroup: LoanOfficer (complete, minus metadata)",
      code: `{
  "Type": "AccessGroup",
  "RuleResolutionID": "LoanOfficer",
  "AccessRoles": [{"ReferenceID": "LoanOfficer"}],
  "PrivilegesSet": {"ReferenceID": "LoanOfficer"},
  "AvailablePortals": [{"Name": {"ReferenceID": "OccasionalUserPortal"}}],
  "DefaultPortal": {"ReferenceID": "OccasionalUserPortal"},
  "WorkQueues": [{"Name": {"ReferenceID": "LoanOfficer"}}],
  "PreviewOnly": false
}`,
      notes: [
        "Django analogy: Group → Permissions, plus a landing page and Celery queues.",
        "<b>Worth asking:</b> Loan Officers default to the <i>Occasional user portal</i>, not the full <i>Work Portal</i>. Is that on purpose?"
      ] },
    { type: "table", title: "5.2 Two flavours of access control",
      headers: ["Model", "Launchpad rules", "Answers"],
      rows: [
        ["<b>RBAC</b>", "Access Roles and privileges", "\"Can Underwriters run the Approve action?\""],
        ["<b>ABAC</b>", "Access Control Policies and conditions", "\"Can this user see <i>this</i> record?\" (e.g. only their region)"]
      ] },
    { type: "text", title: "5.3 Routing: where an Assignment goes",
      html: `<p>Every Assignment node has <code>Routing</code>. The common targets are a specific user, the current user's <b>manager</b>, a <b>persona/user referenced on the case</b> (e.g. an Approver field), or a <b>work queue</b> that a group pulls from. You saw <code>RoutingType: "WorkQueue"</code> → <code>RetailCustomer</code> in Request Info. The Preapproval case type also has <code>EnableGetNextWork: true</code>, which lets users ask for "the next most urgent item".</p>` },
    { type: "handson", title: "Hands-on (5 min)", steps: [
      "Open the <b>Personas</b> designer and compare Loan Officer and Underwriter.",
      "Rules Library → <b>Security</b> → Access Groups. Open <i>Underwriter</i> and compare its portals and work queues with Loan Officer's.",
      "Preview the app as a Loan Officer and see which portal opens."
    ] }
  ],
  quiz: [
    { id: "m5q1", type: "mcq", q: "Which portal does a Loan Officer land in by default?",
      options: [ { t: "Work Portal", why: "Not in the access group's DefaultPortal." }, { t: "Occasional user portal", correct: true, why: "DefaultPortal = OccasionalUserPortal." } ] },
    { id: "m5q2", type: "mcq", q: "Who receives the 'Receive Updates' assignment?",
      options: [ { t: "The Loan Officer who created the case", why: "Routing is to a work queue, not a user." }, { t: "The RetailCustomer work queue", correct: true, why: "RoutingType WorkQueue → RetailCustomer." }, { t: "The Underwriter's manager", why: "No manager routing here." } ] },
    { id: "m5q3", type: "classify", q: "Where would you configure each requirement?",
      choices: ["Access Role", "Access Control Policy", "Portal"],
      items: [
        { label: "Only <b>Underwriters</b> may run the Approve action", answer: "Access Role", why: "Role-based privilege." },
        { label: "Loan Officers see <b>only their own region's</b> preapprovals", answer: "Access Control Policy", why: "Attribute-based, per record." },
        { label: "Customers get a <b>simplified landing page</b>", answer: "Portal", why: "The portal defines the app shell and navigation." }
      ] }
  ]
},

/* ───────────────────────── MODULE 6 ───────────────────────── */
{
  id: "m6", num: 6, title: "User experience", subtitle: "Portals, pages, views, case display, themes",
  analogy: "App shell, routes, templates, CSS", ready: true, minutes: 15,
  sections: [
    { type: "table", title: "6.1 The UX building blocks",
      headers: ["Rule", "What it is", "Web analogy"],
      rows: [
        ["<b>Portal</b>", "The app shell: navigation, create menu, search, template", "Layout and router"],
        ["<b>Page</b>", "A navigable screen in a portal (dashboard, case list…)", "A route"],
        ["<b>View</b>", "A form or layout on a class (Create, Edit, Details, assignment forms)", "A template or component"],
        ["<b>Case view (Display)</b>", "Summary, lifecycle, widgets (Pulse, Attachments, Followers, Agent)", "Detail page layout"],
        ["<b>Theme</b>", "Colors, fonts, logo, spacing", "Design tokens / CSS"]
      ] },
    { type: "callout", kind: "tip",
      html: `<b>Model-driven UI.</b> You mostly <i>configure</i> UI rather than write HTML. Views reference fields, and the renderer draws them. For custom needs there are custom UX components, the DX REST APIs for a fully custom front end, and web embed for putting Launchpad inside another site.` },
    { type: "code", caption: "Portal: WebPortal (\"Work Portal\", trimmed)",
      code: `{
  "Type": "Portal",
  "RuleResolutionID": "WebPortal",
  "Template": "work",
  "NavigationPages": [
    {"Page": {"ReferenceID": "Home", "Namespace": "PegaPlatform"}},
    {"Page": {"ReferenceID": "Dashboard"}},
    {"Page": {"ReferenceID": "Preapproval"}},
    {"Page": {"ReferenceID": "LoanApplication"}},
    {"Page": {"ReferenceID": "LoanRangerAgent"}},
    "… 5 more"
  ],
  "CreateMenu": "Custom",
  "AvailableCaseToCreate": [
    {"CaseType": {"ReferenceID": "PreapprovalWorkflow"}},
    {"CaseType": {"ReferenceID": "LoanApplicationWorkflow"}},
    "… DocumentVerification, CreditDecisioning, FundsDisbursement"
  ]
}`,
      notes: ["Pages from <code>PegaPlatform</code> (Home, ExploreData) and from your app (Dashboard, Preapproval…) are mixed in one nav list. That's layering again."] },
    { type: "text", title: "6.2 Primary fields drive views",
      html: `<p>Remember <code>PrimaryFields</code>? They populate the Create, Edit and Summary views automatically. <b>To show a new field everywhere, add it to primary fields</b> rather than editing three views. The Preapproval case's own display is the <code>PreapprovalDisplay</code> rule referenced from its <code>Display</code> property.</p>` },
    { type: "callout", kind: "found",
      html: `<b>UX work in progress in your branch</b> (uncommitted): a new theme <i>Indiana Loans</i>, a modified <i>Occasional user portal</i>, and modified <i>Occasional User Home</i> and <i>Details</i> views. Check with the team before touching these.` },
    { type: "handson", title: "Hands-on (5 min)", steps: [
      "Cases → Preapproval → <b>UX</b> / <b>Display</b> tab. Find the summary panel and its widgets.",
      "Rules Library → <b>UI</b> → Portals. Open <i>Work Portal</i> and match the nav pages to the JSON.",
      "Preview the app and create a Preapproval. Which fields appear on the Create form?"
    ] }
  ],
  quiz: [
    { id: "m6q1", type: "mcq", q: "You want 'Down Payment' on the Create, Edit and Summary views. Simplest approach?",
      options: [ { t: "Edit all three views", why: "That works, but it's three edits that can drift apart." }, { t: "Add DownPayment to the case type's primary fields", correct: true, why: "Primary fields auto-populate all three." }, { t: "Write a custom React component", why: "Overkill." } ] },
    { id: "m6q2", type: "mcq", q: "How many case types can be created from the Work Portal's create menu?",
      options: [ { t: "1 (Preapproval)", why: "Look at AvailableCaseToCreate again." }, { t: "5 (all case types)", correct: true, why: "All five Case-category case types are listed." } ] },
    { id: "m6q3", type: "classify", q: "Which rule do you edit?",
      choices: ["Portal", "View", "Theme"],
      items: [
        { label: "Add a <b>Reports</b> item to the left nav", answer: "Portal", why: "NavigationPages lives on the portal." },
        { label: "Rearrange fields on the <b>Receive Updates</b> form", answer: "View", why: "The assignment's Action shows a View." },
        { label: "Change the <b>brand color and logo</b>", answer: "Theme", why: "Design tokens live in the theme." }
      ] }
  ]
},

/* ───────────────────────── MODULE 7 ───────────────────────── */
{
  id: "m7", num: 7, title: "Rule resolution & overrides", subtitle: "Layers, namespaces, inheritance",
  analogy: "Python MRO plus template override directories", ready: true, minutes: 15,
  sections: [
    { type: "text", title: "7.1 Layers",
      html: `<p>Rules live in <b>layers</b>: your <b>application layer</b> sits on top of the <b>platform layer</b> (Launchpad). Rules call each other by name, type and class. <b>Whichever layer is on top wins</b>, regardless of which layer the caller is in.</p>
      <div class="layers"><div class="layer app">App layer: LoanRanger</div><div class="layer plat">Platform layer: PegaPlatform</div></div>
      <p>Example: Rule A (app) → Rule B (platform) → Rule C (exists in <i>both</i>). The <b>app's C</b> runs, even though a platform rule called it. Django analogy: a template in your project's <code>templates/</code> shadows the one shipped with an installed app, even when the app's own code renders it.</p>
      <p>App layers can also stack, e.g. a regional or line-of-business specialization layer on top of a base app.</p>` },
    { type: "text", title: "7.2 Overrides keep the original namespace",
      html: `<p>When you override a platform rule, <b>the copy keeps the source rule's namespace</b>. Your branch has two live examples, both uncommitted:</p>` },
    { type: "code", caption: "From your workspace changes (trimmed)",
      code: `[
  {"RuleType": "View", "Name": "Occasional User Home",
   "RuleResolutionID": "OccasionalUserHome",
   "Namespace": "PegaPlatform",
   "AppliesTo": {"ReferenceID": "Data-Portal", "Namespace": "PegaPlatform"},
   "Reusability": "PublicMayOverride", "Status": "MODIFIED"},

  {"RuleType": "View", "Name": "Details",
   "RuleResolutionID": "pyReview",
   "Namespace": "PegaPlatform",
   "AppliesTo": {"ReferenceID": "PreapprovalWorkflow", "Namespace": "LoanRanger"},
   "Status": "MODIFIED"}
]`,
      notes: [
        "Both are owned by your app but keep <code>Namespace: PegaPlatform</code>, because that's the name callers use.",
        "<code>pyReview</code> is a platform view <i>specialized on your class</i> (AppliesTo = PreapprovalWorkflow). It's a subclass override, much like overriding a method in a subclass."
      ] },
    { type: "table", title: "7.3 Inheritance rules of thumb",
      headers: ["Fact", "Implication"],
      rows: [
        ["<b>Directed inheritance only.</b> Each Class rule names its immediate parent, and nothing is inferred from naming patterns.", "Check the parent explicitly. Don't guess from names."],
        ["A case type's class can have <b>intermediate parents</b>, chained to any depth, until one extends <code>Case</code>.", "Shared logic can live on an intermediate parent class."],
        ["<b>No circumstancing.</b>", "Model situational variants (region, product) with runtime <b>Decision</b> rules."],
        ["Subscriber <b>Configuration Set</b> changes are overrides of the original rule and <b>survive app upgrades</b>.", "Expose tunables as configuration settings instead of hard-coding them."]
      ] },
    { type: "handson", title: "Hands-on (5 min)", steps: [
      "Rules Library → <b>UI</b> → Views. Search <i>Occasional User Home</i> and note its namespace and class.",
      "Find the other override in the branch (hint: a view named <i>Details</i>). Use the Rules Library in Studio, or ask your Launchpad-connected agent <i>\"Which rules in BP-2316013 override PegaPlatform rules?\"</i>"
    ] }
  ],
  quiz: [
    { id: "m7q1", type: "mcq", q: "Rule A (app) calls B (platform), which calls C. C exists in both layers. Which C runs?",
      options: [ { t: "Platform C, because B is a platform rule", why: "The caller's layer doesn't matter." }, { t: "App C", correct: true, why: "The top layer wins, regardless of the caller." } ] },
    { id: "m7q2", type: "mcq", q: "Your team overrode OccasionalUserHome. What namespace does the override have?",
      options: [ { t: "LoanRanger", why: "Overrides keep the source namespace." }, { t: "PegaPlatform", correct: true, why: "Overrides keep the namespace of the rule they override." } ] },
    { id: "m7q3", type: "mcq", q: "Eligibility thresholds must differ for Canadian applicants. How do you model it?",
      options: [ { t: "Circumstance the decision by country", why: "Launchpad has no circumstancing." }, { t: "A Decision that branches on country at runtime (optionally driven by configuration settings)", correct: true, why: "Variants are modeled with runtime Decisions." }, { t: "Copy the whole case type", why: "Duplicating the case type means maintaining two copies." } ] },
    { id: "m7q4", type: "mcq", q: "How does a class know its parent?",
      options: [ { t: "From its name (e.g. a dash-delimited prefix)", why: "Launchpad doesn't infer parents from names." }, { t: "The Class rule names its immediate parent explicitly", correct: true, why: "Directed inheritance only." } ] }
  ]
},

/* ───────────────────────── MODULE 8 ───────────────────────── */
{
  id: "m8", num: 8, title: "Team workflow & first change", subtitle: "Workspace, branches, builds, releases",
  analogy: "git working tree, branches, CI, releases", ready: true, minutes: 20,
  sections: [
    { type: "table", title: "8.1 The development loop, mapped to git",
      headers: ["Launchpad", "git / CI analogy", "MCP tool"],
      rows: [
        ["<b>Workspace</b>: draft, uncommitted rule edits", "Working tree", "<code>get_workspace_changes</code> ≈ <code>git status</code>"],
        ["<b>Commit</b> to branch", "<code>git commit</code>", "—"],
        ["<b>Branch</b> changes vs parent", "<code>git log main..branch</code>", "<code>get_changes</code>"],
        ["<b>Build / Preview</b>: compile every rule and get a preview URL", "CI build + review app", "<code>build</code> (the agent must ask you first)"],
        ["<b>Merge</b> to main", "Merge PR", "—"],
        ["<b>Publish</b> a version and push it to Subscribers", "Tag a release and deploy", "Human-only (Provider roles)"]
      ] },
    { type: "callout", kind: "found",
      html: `<b>Your branch today:</b> <code>BP-2316013</code> (parent <code>main</code>) holds all of the app's rules, and <code>main</code> only has platform rules. There are <b>7 uncommitted workspace changes</b>: the Application rule, the <i>Indiana Loans</i> theme (added), the <i>Occasional user portal</i>, the <i>Occasional User Home</i> and <i>Details</i> view overrides, and the <i>Loan to Value Ratio</i> field and decision (added). All are flagged AI-assisted. Ask the team who owns these and how you should branch before you start.` },
    { type: "text", title: "8.2 Working with an AI agent + the authoring MCP",
      html: `<ul>
        <li><b>Read:</b> <code>search_rules</code>, <code>list_rules</code>, <code>get_rule</code>, <code>fetch_data</code>. Safe, and good for exploring.</li>
        <li><b>Write:</b> <code>create_rule</code>, <code>edit_rule</code>, <code>override_rule</code>, <code>delete_rule</code>. These go into the workspace.</li>
        <li><b>Guided builders:</b> <code>discover_workflows</code> / <code>start_workflow</code> run deterministic platform workflows for complex rules.</li>
        <li><b>Validate:</b> <code>build</code>. The agent must ask you before it runs one.</li>
        <li><b>Dependency order:</b> create the rules that get referenced before the rules that reference them.</li>
        <li><b>Releases, subscriptions and go-live</b> are human-only. The agent can't do them.</li></ul>` },
    { type: "table", title: "8.3 Good first contributions (found in this app)",
      headers: ["Idea", "Why it's a good starter", "Modules"],
      rows: [
        ["Implement the empty <b>Match Products</b> automation", "Self-contained, well described, already wired into Evaluate Criteria", "4"],
        ["Add a real <b>Manual Review</b> assignment routed to the Underwriter work queue", "Teaches assignments, actions, views and routing end to end", "2, 5, 6"],
        ["Resolve the <b>HomeType / HomeType2</b> and <b>LoanTerm / LoanTerm2</b> duplicates", "Reference search, safe refactoring", "3"],
        ["Low down payment (&lt; 10%) → Loan Officer approve/deny check in Eligibility Review", "Small but complete: a Decision, a human Assignment and routing in one change", "2, 4, 5"]
      ] },
    { type: "handson", title: "Your first change", steps: [
      "Pick an item from the table above and agree on it with the team.",
      "<b>Plan</b> it: list which rules to create or edit, in dependency order. Sketch it in the Studio designers, or ask your Launchpad-connected agent for a plan.",
      "Make the edits in the branch: in Studio (designers first, rule forms when needed), or have your agent make them after you review its plan.",
      "Approve a <b>build</b>, open the preview URL, and run a Preapproval case through.",
      "Commit and merge following the team's process."
    ] }
  ],
  quiz: [
    { id: "m8q1", type: "mcq", q: "A rule shows up in get_workspace_changes but not in get_changes. What state is it in?",
      options: [ { t: "Merged to main", why: "Then it wouldn't be a workspace change." }, { t: "Drafted but not committed to the branch", correct: true, why: "Workspace ≈ git working tree. get_changes only shows committed branch changes." }, { t: "Published to Subscribers", why: "Publishing is a separate release step." } ] },
    { id: "m8q2", type: "mcq", q: "You ask your Launchpad-connected agent to fix a rule. When does a build run?",
      options: [ { t: "Automatically after every edit", why: "Builds always need your approval." }, { t: "Only after the agent asks and you approve", correct: true, why: "The build tool requires explicit user confirmation." } ] },
    { id: "m8q3", type: "classify", q: "Match each need to its tool or step.",
      choices: ["get_workspace_changes", "get_changes", "build"],
      items: [
        { label: "\"What have I edited but not committed?\"", answer: "get_workspace_changes", why: "≈ git status." },
        { label: "\"What does this branch change vs main?\"", answer: "get_changes", why: "Committed branch diff." },
        { label: "\"Do all rules compile, and can I click through it?\"", answer: "build", why: "Preview build plus URL." }
      ] },
    { id: "m8q4", type: "mcq", q: "Who can publish a new version and push it to Subscribers?",
      options: [ { t: "An AI agent, via the MCP", why: "Release steps are human-only." }, { t: "Humans with the right Provider roles", correct: true, why: "Publishing, approval and Subscriber updates are role-controlled and done by people." } ] }
  ]
}

);

window.COURSE.glossary.push(
  ["Process", "A flow graph of nodes (steps) and connectors inside a stage. Stored as a Process rule."],
  ["Assignment", "A process node that creates human work. The case waits until the routed user or work queue submits its Action."],
  ["Action", "The form-backed operation a user submits on an assignment (or as an optional action). It references a View and can run validations and automations."],
  ["Work Queue", "A shared queue of assignments that members of an access group pull from."],
  ["Automation", "A rule made of steps with side effects (set values, call rules, send notifications), like a service function."],
  ["Validation", "A rule that blocks a submit when data is invalid. Often gated by a Decision."],
  ["Calculated field", "A read-only field whose value comes from a Decision or expression, like a Python @property."],
  ["Data Page", "A named, parameterized, read-only data source (List or SingleRecord), backed by a Data Connection (Query or REST Connector)."],
  ["Access Group", "Security wiring for a persona: access roles, available and default portals, and work queues."],
  ["Access Role", "RBAC privileges, e.g. which actions a user can run."],
  ["Access Control Policy", "ABAC rule that restricts access to records based on conditions."],
  ["Portal", "The app shell a persona sees: navigation pages, create menu, search."],
  ["View", "A form or layout on a class (Create, Edit, Details, assignment forms)."],
  ["Theme", "Branding: colors, fonts, logo, spacing."],
  ["Override", "An app-layer copy of a rule that shadows the platform version. It keeps the original namespace."],
  ["Configuration Set", "Subscriber-tunable settings. Subscriber changes are overrides that survive app upgrades."],
  ["Workspace", "Your draft, uncommitted rule changes on a branch, like a git working tree."],
  ["Build / Preview", "Compiles every rule in the workspace and returns a preview URL, like CI plus a review app."],
  ["Publish", "Create an app version and push it to Subscribers. Human-only and role-controlled."]
);
