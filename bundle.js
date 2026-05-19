#!/usr/bin/env node
// bundle.js - Node 18+
// Usage: node bundle.js <owner> <repo> [branch] [--inline-assets]

import fs from "fs/promises";
import path from "path";
import process from "process";
const [,, owner, repo, branchArg, maybeFlag] = process.argv;
if (!owner || !repo) {
  console.error("Usage: node bundle.js <owner> <repo> [branch] [--inline-assets]");
  process.exit(1);
}
const branch = branchArg && !branchArg.startsWith("--") ? branchArg : "main";
const inlineAssets = (maybeFlag === "--inline-assets") || (branchArg === "--inline-assets");
const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;

async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch ${url} -> ${r.status}`);
  return await r.text();
}
async function fetchArrayBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Fetch ${url} -> ${r.status}`);
  return await r.arrayBuffer();
}
function guessMime(name) {
  const ext = (path.extname(name)||"").toLowerCase();
  return {
    ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".gif":"image/gif",
    ".svg":"image/svg+xml",".webp":"image/webp",".ico":"image/x-icon",
    ".woff":"font/woff",".woff2":"font/woff2",".ttf":"font/ttf",".otf":"font/otf",
    ".eot":"application/vnd.ms-fontobject"
  }[ext] || "application/octet-stream";
}
function toDataURI(buf, mime){
  return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
}
function isRemote(u){ return /^https?:\/\//i.test(u) || /^data:/i.test(u); }
function resolveRawUrl(baseRawUrl, ref){
  if (isRemote(ref)) return ref;
  if (ref.startsWith("/")) {
    // path from repo root
    return `${rawBase}${ref}`;
  }
  // baseRawUrl should be full raw URL to file; get its dirname
  const dir = baseRawUrl.substring(0, baseRawUrl.lastIndexOf("/") + 1);
  return new URL(ref, dir).toString();
}

async function inlineCss(cssText, cssRawUrl){
  // replace url(...) with resolved or data URIs if inlineAssets
  return cssText.replace(/url\(([^)]+)\)/g, (m, g) => {
    let url = g.trim().replace(/^['"]|['"]$/g, "");
    if (isRemote(url)) return `url("${url}")`;
    const resolved = resolveRawUrl(cssRawUrl, url);
    if (!inlineAssets) return `url("${resolved}")`;
    // attempt fetch and convert
    return `url("${resolved}")`;
  });
}

(async function main(){
  try{
    const indexUrl = `${rawBase}/index.html`;
    let html = await fetchText(indexUrl);

    // Collect link rel=stylesheet and script src
    const linkRe = /<link[^>]*rel=["']?stylesheet["']?[^>]*href=["']([^"']+)["'][^>]*>/gi;
    const scriptRe = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;

    // Inline CSS files
    let m;
    const cssReplacements = [];
    while ((m = linkRe.exec(html)) !== null) {
      const href = m[1];
      if (isRemote(href)) continue;
      const cssRawUrl = resolveRawUrl(indexUrl, href);
      try {
        let cssText = await fetchText(cssRawUrl);
        cssText = await inlineCss(cssText, cssRawUrl);

        // If inlineAssets, find url(...) references and replace with data URIs
        if (inlineAssets) {
          const urls = [...cssText.matchAll(/url\(([^)]+)\)/g)].map(x=>x[1].trim().replace(/^['"]|['"]$/g,""));
          for (const u of urls) {
            if (isRemote(u)) continue;
            const resolved = resolveRawUrl(cssRawUrl, u);
            try {
              const buf = await fetchArrayBuffer(resolved);
              const datauri = toDataURI(buf, guessMime(u));
              cssText = cssText.split(resolved).join(datauri);
              cssText = cssText.split(u).join(datauri);
            } catch(e){ /* ignore */ }
          }
        }

        cssReplacements.push({orig: m[0], replacement: `<style>\n${cssText}\n</style>`});
      } catch(e){
        console.warn(`Warning: cannot fetch CSS ${href}: ${e.message}`);
      }
    }
    for (const r of cssReplacements) html = html.replace(r.orig, r.replacement);

    // Inline JS files
    const jsReplacements = [];
    while ((m = scriptRe.exec(html)) !== null) {
      const src = m[1];
      if (isRemote(src)) continue;
      const jsRawUrl = resolveRawUrl(indexUrl, src);
      try {
        const jsText = await fetchText(jsRawUrl);
        jsReplacements.push({orig: m[0], replacement: `<script>\n${jsText}\n</script>`});
      } catch(e){
        console.warn(`Warning: cannot fetch JS ${src}: ${e.message}`);
      }
    }
    for (const r of jsReplacements) html = html.replace(r.orig, r.replacement);

    // Inline <img src> and other hrefs if requested
    if (inlineAssets) {
      // images in img tags
      const imgRe = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
      const imgs = [...html.matchAll(imgRe)];
      for (const im of imgs) {
        const src = im[1];
        if (isRemote(src)) continue;
        const resolved = resolveRawUrl(indexUrl, src);
        try{
          const buf = await fetchArrayBuffer(resolved);
          const datauri = toDataURI(buf, guessMime(src));
          html = html.replace(new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'), datauri);
        }catch(e){}
      }
      // link hrefs (icons, manifest)
      const linkHrefRe = /<link[^>]*href=["']([^"']+)["'][^>]*>/gi;
      const links = [...html.matchAll(linkHrefRe)];
      for (const l of links) {
        const href = l[1];
        if (isRemote(href)) continue;
        const resolved = resolveRawUrl(indexUrl, href);
        try{
          const buf = await fetchArrayBuffer(resolved);
          const datauri = toDataURI(buf, guessMime(href));
          html = html.replace(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'), datauri);
        }catch(e){}
      }
    }

    // Remove integrity/crossorigin attributes
    html = html.replace(/\s+integrity=["'][^"']*["']/gi, "");
    html = html.replace(/\s+crossorigin=["'][^"']*["']/gi, "");

    await fs.writeFile("bundle.html", html, "utf8");
    console.log("bundle.html creato.");
  }catch(err){
    console.error("Errore:", err.message);
    process.exit(1);
  }
})();
