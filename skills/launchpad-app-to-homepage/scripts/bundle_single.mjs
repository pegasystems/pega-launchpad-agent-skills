#!/usr/bin/env node
// Bundle a static launchpad-app-to-homepage site into one self-contained HTML file for sharing.
// Usage: node bundle_single.mjs <site-dir> <out.html>
// Inlines styles.css (with its font files), main.js and local images (src and srcset, on <img> and <source>),
// embeds the favicon, and drops the og:image and preload tags, which need a host. Node 20+, no dependencies.
import fs from "node:fs"; import path from "node:path";
const [site, out] = process.argv.slice(2);
if (!site || !out) { console.error("Usage: node bundle_single.mjs <site-dir> <out.html>"); process.exit(1); }
const r = (p, e) => fs.readFileSync(path.join(site, p), e);
const b64 = (p) => r(p).toString("base64");
const TYPES = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", avif: "image/avif", ico: "image/x-icon" };
// A local asset as a data URI, or null when it is not a local image that exists.
const dataUri = (p) => {
  const t = TYPES[p.split(/[?#]/)[0].split(".").pop().toLowerCase()];
  const file = decodeURIComponent(p.split(/[?#]/)[0]);
  return t && !/^(data:|[a-z]+:|\/\/)/i.test(p) && fs.existsSync(path.join(site, file)) ? `data:${t};base64,${b64(file)}` : null;
};
let css = r("styles.css", "utf8").replace(/url\("(assets\/fonts\/[^"]+)"\)/g, (_, p) => `url("data:font/woff2;base64,${b64(p)}")`);
const js = r("main.js", "utf8");
let html = r("index.html", "utf8");
html = html
  .replace(/<meta property="og:image"[^>]*>\n?/g, "")
  .replace(/<link rel="preload"[^>]*>\n?/g, "")
  .replace(/<link rel="icon" href="([^"]+)"([^>]*)>/g, (_, p, rest) => { const d = dataUri(p); return d ? `<link rel="icon" href="${d}"${rest}>` : ""; })
  .replace(/<link rel="stylesheet" href="styles.css">/, () => `<style>\n${css}\n</style>`)
  .replace(/<(img|source)\b[^>]*>/g, (tag) => tag
    .replace(/ src="([^"]+)"/, (m, p) => { const d = dataUri(p); return d ? ` src="${d}"` : m; })
    .replace(/ srcset="([^"]+)"/, (m, set) => ` srcset="${set.split(",").map((c) => {
      const [u, ...desc] = c.trim().split(/\s+/);
      return [dataUri(u) || u, ...desc].join(" ");
    }).join(", ")}"`))
  // Inlined images are already in the file, so lazy loading gains nothing and some viewers never trigger it.
  .replace(/<img[^>]* src="data:[^>]*>/g, (tag) => tag.replace(/ loading="lazy"/, ""))
  .replace(/<script src="main.js" defer><\/script>/, () => `<script>\n${js}\n</script>`);
const left = [...html.matchAll(/\s(?:src|srcset|href|poster)="(assets\/[^"]+)"/g)].map((m) => m[1]);
if (left.length) console.warn(`Still references local files (open in a browser to check): ${[...new Set(left)].join(", ")}`);
fs.writeFileSync(out, html);
console.log(out, (fs.statSync(out).size / 1024).toFixed(0) + " KB");
