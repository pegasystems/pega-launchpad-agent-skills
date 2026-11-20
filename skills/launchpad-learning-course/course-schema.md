# course.js schema

`template/index.html` renders whatever `course.js` defines on `window.COURSE`. It's plain data with no build step. Strings inside `html`, table cells, `notes`, `steps`, quiz labels and `q` text **are HTML**: escape `<` as `&lt;` and use `<code>`, `<b>`, `<i>`. Option text `t` is plain text and gets escaped.

```js
window.COURSE = {
  title: "Launchpad for <Audience>",          // H1 on home + browser tab
  audience: "for Python & web devs",          // sidebar subtitle
  app: {
    name: "<Application name>", namespace: "<Namespace>", branch: "<branch used>",
    note: "<one-sentence repo-state observation shown on home, e.g. where the content lives>"
  },
  glossary: [ ["Term", "Developer-friendly definition"], ... ],   // 25–40 terms
  modules: [ Module, ... ]                                        // normally 8
};
// Optional: split files may append: window.COURSE.modules.push(...); window.COURSE.glossary.push(...)
```

## Module
```js
{ id: "m1", num: 1, title: "The mental model", subtitle: "Rules, and Cases / Data / Personas",
  analogy: "Your whole codebase, stored as JSON",   // audience-specific analogy chip
  ready: true, minutes: 15,
  sections: [ Section, ... ],
  quiz: [ Question, ... ] }                          // 3–4 questions
```

## Section types
| type | fields | renders |
|---|---|---|
| `text` | `title?`, `html` | Card with heading and HTML body. Inside html you can use `<div class="hier"><span>A</span>→<span>B</span></div>` for a chain, and `<div class="layers"><div class="layer app">…</div><div class="layer plat">…</div></div>` for a layer stack. |
| `table` | `title?`, `headers[]`, `rows[][]` | Table. Every row needs the same number of cells as there are headers. You can use `<span class='pill case|data|persona'>` in cells. |
| `callout` | `kind: "tip"\|"found"`, `html` | `tip` shows a 💡 Tip box. `found` shows a 🔎 "Found in your app" box. Use `found` **only** for facts you read with a tool in this session. |
| `code` | `caption?`, `code` (string), `notes?[]` | Highlighted JSON with a Copy button and HTML bullet notes. Notes may contain `<pre class='py'>` for a Python translation. |
| `lifecycle` | `title`, `primary[{name, tag}]`, `alternate[{name, tag}]` | Stage lanes. `tag`: `"init"`, `"Automatic"`, `"Manual"`, `"Resolution"` (shown in green). |
| `flow` | `title`, `intro?`, `spine[Node]`, `branches[{label, path[Node]}]` | Process diagram. Node = `{name, kind}` with kind `start\|end\|auto\|decision\|goto\|assign`. |
| `handson` | `title`, `steps[]` (HTML) | Checklist saved in localStorage. Use Studio navigation, e.g. "Cases → Preapproval → Workflow tab". Optional agent prompts say "your Launchpad-connected agent", never a product name (the validator enforces this). |

## Question types
```js
{ id: "m1q1", type: "mcq", q: "Question?",
  options: [ { t: "Option", correct: true, why: "Explanation" }, { t: "Other", why: "Why it's wrong" } ] }  // exactly one correct

{ id: "m1q4", type: "classify", q: "Classify each…", choices: ["Case", "Data", "Persona"],
  items: [ { label: "HTML label", answer: "Case", why: "Explanation" } ] }   // answer must be one of choices
```
Question IDs must be unique across the course. Every option and item should have a `why`. Wrong-answer explanations teach as much as the right one.

Validate with: `node scripts/check-course.js <course.js>`
