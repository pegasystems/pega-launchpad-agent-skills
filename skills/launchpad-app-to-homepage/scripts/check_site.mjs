#!/usr/bin/env node
// launchpad-app-to-homepage static site checker. Node 20+, no dependencies.
// Usage: node check_site.mjs <site-dir> [--json]
// Exit code 1 when any error is found. Regex-based: it catches common mistakes, it is not a full HTML validator.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const siteDir = path.resolve(args.find((a) => !a.startsWith("--")) || ".");
const findings = [];
const add = (level, code, message) => findings.push({ level, code, message });

const BANNED = [
  "unlock", "seamless", "seamlessly", "supercharge", "game-changer", "game-changing", "revolutionize",
  "revolutionise", "effortless", "effortlessly", "cutting-edge", "next-gen", "next-generation",
  "harness the power", "magic", "magical", "autonomous", "autonomously", "in seconds", "empower",
  "synergy", "world-class", "best-in-class",
];
const LIMITS = { imageKB: 300, heroKB: 250, cssKB: 60, jsKB: 30, initialMB: 1, pageMB: 3, videoMB: 4 };

const indexPath = path.join(siteDir, "index.html");
if (!fs.existsSync(indexPath)) {
  add("error", "missing-index", `No index.html in ${siteDir}`);
  report();
}
const html = fs.readFileSync(indexPath, "utf8");

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? (m[2] ?? m[3] ?? m[4] ?? "") : null;
};
const tags = (name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => m[0]);
const kb = (p) => fs.statSync(p).size / 1024;
const isExternal = (u) => /^(https?:)?\/\//i.test(u);
const isSkippable = (u) => !u || /^(#|mailto:|tel:|data:|javascript:)/i.test(u);
const localPath = (u, base = siteDir) => path.join(base, decodeURIComponent(u.split(/[?#]/)[0]));

// --- Document basics
if (!/<html\b[^>]*\slang\s*=/i.test(html)) add("error", "html-lang", "<html> has no lang attribute");
if (!/<meta\b[^>]*name\s*=\s*["']viewport["']/i.test(html)) add("error", "viewport", "No viewport meta tag");
const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim();
if (!title) add("error", "title", "No <title>");
else if (title.length > 60) add("warn", "title-length", `<title> is ${title.length} chars (aim for 60 or fewer)`);
const desc = tags("meta").find((t) => /name\s*=\s*["']description["']/i.test(t));
if (!desc) add("error", "meta-description", "No meta description");
else if ((attr(desc, "content") || "").length > 160) add("warn", "meta-description-length", "Meta description over 160 chars");
for (const p of ["og:title", "og:description", "og:image"]) {
  if (!tags("meta").some((t) => attr(t, "property") === p)) add("warn", "open-graph", `Missing <meta property="${p}">`);
}
if (!tags("link").some((t) => /\bicon\b/i.test(attr(t, "rel") || ""))) add("warn", "favicon", "No favicon link");

// --- Structure
const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
if (h1s.length !== 1) add("error", "h1-count", `Expected exactly one <h1>, found ${h1s.length}`);
else {
  const words = h1s[0][1].replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  if (words > 12) add("warn", "h1-length", `Hero <h1> has ${words} words (aim for about 10)`);
  if (/\bAI[- ]powered\b/i.test(h1s[0][1])) add("warn", "h1-ai-powered", `Hero <h1> leads with "AI-powered": lead with the outcome`);
}
for (const lm of ["main", "nav", "footer"]) {
  if (!new RegExp(`<${lm}\\b`, "i").test(html)) add("error", "landmark", `No <${lm}> landmark`);
}
if (!/href\s*=\s*["']#(main|content)[^"']*["']/i.test(html)) add("warn", "skip-link", "No skip link to #main/#content");
const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
for (let i = 1; i < levels.length; i++) {
  if (levels[i] > levels[i - 1] + 1) { add("warn", "heading-order", `Heading level jumps from h${levels[i - 1]} to h${levels[i]}`); break; }
}
const ids = [...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
if (dupes.length) add("error", "duplicate-id", `Duplicate id(s): ${[...new Set(dupes)].join(", ")}`);
for (const t of tags("a")) {
  const href = attr(t, "href");
  if (href && href.startsWith("#") && href.length > 1 && !ids.includes(href.slice(1))) add("error", "anchor", `Link to missing anchor ${href}`);
}

// --- Images and media
const imgs = tags("img");
imgs.forEach((t, i) => {
  const src = attr(t, "src") || "";
  const alt = attr(t, "alt");
  if (alt === null) add("error", "img-alt", `<img src="${src}"> has no alt attribute`);
  if (attr(t, "width") === null || attr(t, "height") === null) add("error", "img-size", `<img src="${src}"> lacks width/height (layout shift)`);
  const hero = attr(t, "fetchpriority") === "high";
  if (!hero && i > 0 && attr(t, "loading") !== "lazy") add("warn", "img-lazy", `<img src="${src}"> is not loading="lazy"`);
  if (!isExternal(src) && !isSkippable(src) && fs.existsSync(localPath(src))) {
    const size = kb(localPath(src));
    const limit = hero ? LIMITS.heroKB : LIMITS.imageKB;
    if (size > limit) add("warn", "img-weight", `${src} is ${size.toFixed(0)} KB (limit ${limit} KB)`);
  }
});
if (imgs.length && !imgs.some((t) => attr(t, "fetchpriority") === "high")) add("warn", "hero-priority", `No image has fetchpriority="high" (the hero image should)`);
for (const t of tags("video")) {
  if (/\sautoplay\b/i.test(t) && !/\smuted\b/i.test(t)) add("error", "video-muted", "Autoplay <video> must be muted");
  if (!attr(t, "poster")) add("warn", "video-poster", "<video> has no poster");
}

// --- Local references (HTML + CSS) and external requests
const refs = [];
for (const name of ["img", "script", "link", "source", "video", "a", "use"]) {
  for (const t of tags(name)) {
    for (const a of ["src", "href", "poster"]) { const v = attr(t, a); if (v) refs.push({ from: "index.html", u: v, tag: name }); }
    const srcset = attr(t, "srcset");
    if (srcset) srcset.split(",").forEach((s) => refs.push({ from: "index.html", u: s.trim().split(/\s+/)[0], tag: name }));
  }
}
const cssFiles = fs.readdirSync(siteDir, { recursive: true }).filter((f) => String(f).endsWith(".css")).map(String);
for (const f of cssFiles) {
  const css = fs.readFileSync(path.join(siteDir, f), "utf8");
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.push({ from: f, u: m[1], tag: "css", base: path.dirname(path.join(siteDir, f)) });
  for (const m of css.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/gi)) refs.push({ from: f, u: m[1], tag: "css", base: path.dirname(path.join(siteDir, f)) });
}
const external = new Set();
for (const r of refs) {
  if (isSkippable(r.u)) continue;
  if (isExternal(r.u)) {
    if (r.tag !== "a") external.add(new URL(r.u, "https://x").host);
    continue;
  }
  if (!fs.existsSync(localPath(r.u, r.base))) add("error", "broken-ref", `${r.from}: ${r.u} not found`);
}
if (external.size) add("warn", "external-requests", `Loads resources from: ${[...external].join(", ")} (default is none; needs the user's OK and a note in CREDITS.md)`);
if (/\b(gtag|googletagmanager|analytics\.js|hotjar|segment\.com|clarity\.ms)\b/i.test(html)) add("error", "tracking", "Tracking/analytics found (not allowed by default)");
if (/(sk-[A-Za-z0-9]{16,}|api[_-]?key\s*[:=]|Authorization\s*:\s*Bearer)/i.test(html + cssFiles.map((f) => fs.readFileSync(path.join(siteDir, f), "utf8")).join(""))) add("error", "secret", "Something that looks like an API key or bearer token is in the page");

// --- Copy
const visible = html
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z#0-9]+;/gi, " ")
  .replace(/\s+/g, " ");
for (const w of BANNED) {
  const re = new RegExp(`\\b${w.replace(/[-]/g, "[- ]")}\\b`, "gi");
  const n = (visible.match(re) || []).length;
  if (n) add("error", "banned-word", `Banned word "${w}" appears ${n}x in visible copy`);
}
// Platform jargon: the page sells the app to its buyer, not Launchpad to a builder.
const JARGON = ["case types?", "data types?", "stages?", "personas?", "portals?", "work ?queues?", "access groups?", "access roles?", "data model", "record types?", "automations?", "insights?", "scoped to", "case of type"];
const readIf = (f) => (fs.existsSync(path.join(siteDir, f)) ? fs.readFileSync(path.join(siteDir, f), "utf8") : "");
const ldText = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(" ");
const jsStrings = (readIf("main.js").replace(/^\s*\/\/.*$/gm, "").match(/(["'`])(?:(?!\1)[^\\\n]|\\.)*\1/g) || []).join(" ");
const copyAll = { "visible copy": visible, "JSON-LD": ldText, "main.js strings": jsStrings, "llms.txt": readIf("llms.txt") };
for (const [where, text] of Object.entries(copyAll)) {
  for (const w of JARGON) {
    const n = (text.match(new RegExp(`(?<![-\\w])${w}(?![-\\w])`, "gi")) || []).length;
    if (n) add("warn", "platform-jargon", `"${w.replace(/\?|\\s/g, "")}" appears ${n}x in ${where}: say it in the buyer's words (see page-blueprint.md, Translate, don't transcribe)`);
  }
}
for (const [where, text] of Object.entries(copyAll)) {
  const n = (text.match(/\b(Launchpad|Pega)\b/g) || []).length;
  if (n) add("warn", "platform-name", `"Pega"/"Launchpad" appears ${n}x in ${where}: the page sells the app, not the platform; keep it only if the user asked for a platform credit`);
}

const placeholders = (visible.match(/\bPLACEHOLDER\b/g) || []).length;
const illustrative = (visible.match(/\bIllustrative\b/g) || []).length;
const examples = (visible.match(/\bExample answer\b/gi) || []).length;
if (placeholders) add("warn", "placeholder", `${placeholders} PLACEHOLDER label(s) still on the page: list them for the user`);
if (illustrative) add("info", "illustrative", `${illustrative} Illustrative label(s): list them for the user`);
if (examples) add("info", "example-answer", `${examples} "Example answer" label(s): list them for the user`);
if (/lorem ipsum/i.test(visible)) add("error", "lorem", "Lorem ipsum in visible copy");
if (/\b(TODO|TBD|FIXME)\b/.test(visible)) add("warn", "todo", "TODO/TBD/FIXME in visible copy");

// --- Structured data and llms.txt
for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
  try {
    const data = JSON.parse(m[1]);
    const s = JSON.stringify(data);
    if (/aggregateRating|"review"/i.test(s)) add("warn", "jsonld-rating", "JSON-LD has ratings/reviews: only with real, user-supplied data");
  } catch (e) { add("error", "jsonld-parse", `JSON-LD does not parse: ${e.message}`); }
}
if (!/application\/ld\+json/i.test(html)) add("warn", "jsonld", "No JSON-LD (SoftwareApplication) block");
const llms = path.join(siteDir, "llms.txt");
if (!fs.existsSync(llms)) add("warn", "llms-txt", "No llms.txt");
else if (!/^#\s+\S/.test(fs.readFileSync(llms, "utf8").trimStart())) add("warn", "llms-txt-format", "llms.txt should start with '# <Product name>'");
if (!fs.existsSync(path.join(siteDir, "CREDITS.md"))) add("warn", "credits", "No CREDITS.md (licence/source of fonts, images, recordings)");

// --- Reduced motion
const allCss = cssFiles.map((f) => fs.readFileSync(path.join(siteDir, f), "utf8")).join("\n") + html;
if (/(@keyframes|transition\s*:|animation\s*:)/i.test(allCss) && !/prefers-reduced-motion/i.test(allCss)) add("error", "reduced-motion", "Motion is used but prefers-reduced-motion is not handled");

// --- Weight
const files = fs.readdirSync(siteDir, { recursive: true }).map(String).filter((f) => fs.statSync(path.join(siteDir, f)).isFile());
let total = 0;
for (const f of files) {
  const size = kb(path.join(siteDir, f));
  if (/\.(md|txt)$/i.test(f)) continue;
  if (/\.(mp4|webm)$/i.test(f)) { if (size / 1024 > LIMITS.videoMB) add("warn", "video-weight", `${f} is ${(size / 1024).toFixed(1)} MB (limit ${LIMITS.videoMB} MB)`); continue; }
  total += size;
  if (f.endsWith(".css") && size > LIMITS.cssKB) add("warn", "css-weight", `${f} is ${size.toFixed(0)} KB (limit ${LIMITS.cssKB} KB)`);
  if (f.endsWith(".js") && size > LIMITS.jsKB) add("warn", "js-weight", `${f} is ${size.toFixed(0)} KB (limit ${LIMITS.jsKB} KB)`);
}
if (total / 1024 > LIMITS.pageMB) add("warn", "page-weight", `Site is ${(total / 1024).toFixed(2)} MB excluding video (limit ${LIMITS.pageMB} MB)`);

report(total);

function report(totalKB = 0) {
  const errors = findings.filter((f) => f.level === "error").length;
  const warnings = findings.filter((f) => f.level === "warn").length;
  const summary = { site: siteDir, ok: errors === 0, errors, warnings, totalKB: Math.round(totalKB), findings };
  if (asJson) console.log(JSON.stringify(summary, null, 2));
  else {
    for (const f of findings) console.log(`${f.level.toUpperCase().padEnd(5)} ${f.code}: ${f.message}`);
    console.log(`\n${errors} error(s), ${warnings} warning(s), ${Math.round(totalKB)} KB excluding video.`);
  }
  process.exit(errors ? 1 : 0);
}
