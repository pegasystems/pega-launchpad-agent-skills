#!/usr/bin/env node
// Validates a Launchpad Learn course.js against the schema in course-schema.md.
// Usage: node check-course.js <path-to-course.js> [more.js ...]
const fs = require("fs"), vm = require("vm");
const files = process.argv.slice(2);
if (!files.length) { console.error("usage: node check-course.js course.js"); process.exit(2); }

const ctx = { window: {} }; vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
const C = ctx.window.COURSE;
const errs = [], warn = [];
const E = m => errs.push(m), W = m => warn.push(m);

if (!C) { console.error("window.COURSE not defined"); process.exit(1); }
for (const k of ["title", "audience", "app", "glossary", "modules"]) if (!C[k]) E(`COURSE.${k} missing`);
for (const k of ["name", "namespace", "branch"]) if (C.app && !C.app[k]) E(`COURSE.app.${k} missing`);

const SECTIONS = {
  text: ["html"], table: ["headers", "rows"], callout: ["html"], code: ["code"],
  lifecycle: ["title", "primary", "alternate"], flow: ["title", "spine", "branches"], handson: ["title", "steps"]
};
const NODE_KINDS = ["start", "end", "auto", "decision", "goto", "assign"];
const ids = new Set(), qids = new Set();

(C.glossary || []).forEach((g, i) => { if (!Array.isArray(g) || g.length !== 2) E(`glossary[${i}] must be [term, definition]`); });

(C.modules || []).forEach((m, mi) => {
  const at = `module ${m.id || mi}`;
  for (const k of ["id", "num", "title", "subtitle", "analogy"]) if (m[k] == null) E(`${at}: ${k} missing`);
  if (ids.has(m.id)) E(`${at}: duplicate id`); ids.add(m.id);
  if (m.num !== mi + 1) W(`${at}: num ${m.num} but position ${mi + 1}`);
  if (!m.ready) { W(`${at}: ready=false (rendered as outline only? the shell expects ready modules to have sections+quiz)`); return; }
  if (!Array.isArray(m.sections) || !m.sections.length) E(`${at}: no sections`);
  (m.sections || []).forEach((s, si) => {
    const sat = `${at} section ${si} (${s.type})`;
    if (!SECTIONS[s.type]) return E(`${sat}: unknown type`);
    for (const k of SECTIONS[s.type]) if (s[k] == null) E(`${sat}: ${k} missing`);
    if (s.type === "table") s.rows.forEach((r, ri) => { if (r.length !== s.headers.length) E(`${sat}: row ${ri} has ${r.length} cells, headers ${s.headers.length}`); });
    if (s.type === "callout" && !["tip", "found"].includes(s.kind || "tip")) E(`${sat}: kind must be tip|found`);
    if (s.type === "flow") [...s.spine, ...s.branches.flatMap(b => b.path)].forEach(n => { if (!NODE_KINDS.includes(n.kind)) E(`${sat}: node kind '${n.kind}'`); });
    if (s.type === "code" && /"(?:ID|isolationID|TenantID)"\s*:/.test(s.code)) W(`${sat}: code contains internal IDs; trim them`);
    if (s.type === "code" && /@[a-z0-9.-]+\.[a-z]{2,}/i.test(s.code)) E(`${sat}: code contains an email address; remove personal data`);
  });
  if (!Array.isArray(m.quiz) || m.quiz.length < 3) E(`${at}: needs >= 3 quiz questions`);
  if (!(m.sections || []).some(s => s.type === "handson")) W(`${at}: no handson section`);
  if (!(m.sections || []).some(s => s.type === "code")) W(`${at}: no real rule JSON (code section)`);
  (m.quiz || []).forEach((q, qi) => {
    const qat = `${at} quiz ${q.id || qi}`;
    if (!q.id) E(`${qat}: id missing`); else if (qids.has(q.id)) E(`${qat}: duplicate id`); qids.add(q.id);
    if (q.type === "mcq") {
      const n = (q.options || []).filter(o => o.correct).length;
      if (n !== 1) E(`${qat}: mcq must have exactly 1 correct option (has ${n})`);
      (q.options || []).forEach((o, oi) => { if (!o.why) W(`${qat}: option ${oi} has no 'why'`); });
    } else if (q.type === "classify") {
      (q.items || []).forEach((it, ii) => {
        if (!(q.choices || []).includes(it.answer)) E(`${qat}: item ${ii} answer '${it.answer}' not in choices`);
        if (!it.why) W(`${qat}: item ${ii} has no 'why'`);
      });
    } else E(`${qat}: type must be mcq|classify`);
  });
});

const json = JSON.stringify(C);
if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(json)) E("course contains an email address; remove personal data");
const vendor = json.match(/\b(claude|anthropic|chatgpt|openai|copilot|cursor|gemini)\b/i);
if (vendor) E(`course names a specific AI product ("${vendor[0]}"); say "your Launchpad-connected agent" or point to Launchpad Studio instead`);

warn.forEach(w => console.log("WARN ", w));
errs.forEach(e => console.log("ERROR", e));
console.log(`${(C.modules || []).length} modules, ${qids.size} questions, ${(C.glossary || []).length} glossary terms — ${errs.length} errors, ${warn.length} warnings`);
process.exit(errs.length ? 1 : 0);
