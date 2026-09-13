const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "public", "docs");

const groups = [
  ["Producto", [["docs/INDEX.md", "", "Introduccion"], ["README.md", "product/introduction", "Producto SmartTense"], ["docs/SOFTWARE_REQUIREMENTS.md", "product/requirements", "Definicion y alcance"], ["docs/USER_GUIDE.md", "product/user-guide", "Guia de uso"], ["docs/METHODOLOGY_DARIO_A2.md", "product/methodology", "Metodologia"], ["docs/CURRICULUM_PHASE_PLAN.md", "product/curriculum", "Plan curricular"], ["docs/CONTENT_GAPS_A1_A2.md", "product/content-quality", "Calidad de contenido"], ["docs/TROUBLESHOOTING.md", "product/troubleshooting", "Solucion de problemas"]]],
  ["Arquitectura", [["docs/ARCHITECTURE.md", "architecture/overview", "Vision general"], ["docs/API.md", "architecture/api", "API y modulos"], ["docs/DATA_SCHEMA.md", "architecture/data-schema", "Datos de verbos"], ["docs/LEARNING_CONTENT_SCHEMA.md", "architecture/content-schema", "Datos curriculares"], ["docs/DEVELOPMENT.md", "architecture/development", "Preparacion del entorno"], ["docs/DEVELOPER_GUIDE.md", "architecture/code-tour", "Recorrido por el codigo"], ["docs/JUNIOR_DEVELOPER_GUIDE.md", "architecture/junior-guide", "Guia junior"], ["docs/TESTING.md", "architecture/testing", "Estrategia de pruebas"], ["docs/OPERATIONS.md", "architecture/operations", "Operaciones"]]],
  ["Entrega", [["docs/DEPLOYMENT.md", "delivery/deployment", "Publicacion"], ["docs/GITHUB_PAGES.md", "delivery/github-pages", "GitHub Pages"], ["docs/PROJECT_PHASE_ROADMAP.md", "delivery/roadmap", "Roadmap"], ["docs/RELEASE_CHECKLIST.md", "delivery/release-checklist", "Checklist de release"], ["docs/adr/README.md", "delivery/adr", "Decisiones de arquitectura"], ["docs/adr/0001-local-first-architecture.md", "delivery/adr/local-first", "ADR 0001: Local-first"], ["docs/adr/0002-content-driven-curriculum.md", "delivery/adr/content-driven", "ADR 0002: Curriculo"], ["docs/adr/0003-github-actions-pages.md", "delivery/adr/github-pages", "ADR 0003: Pages"]]],
  ["Gestion del proyecto", [["CURRENT_STATUS.md", "project/status", "Estado actual"], ["docs/PHASE_EXECUTION_LOG.md", "project/tasks", "Fases y tareas"], ["CHANGELOG.md", "project/changelog", "Changelog"], ["CONTRIBUTING.md", "project/contributing", "Contribucion"], ["docs/SECURITY.md", "project/security", "Seguridad"], ["THIRD_PARTY_LICENSES.md", "project/third-party", "Licencias de terceros"]]]
];
const documents = groups.flatMap(([group, entries]) => entries.map(([source, slug, label]) => ({ group, source, slug, label })));
const route = (slug) => slug ? `/docs/${slug}/` : "/docs/";
const routes = new Map(documents.map((doc) => [path.normalize(path.join(root, doc.source)), route(doc.slug)]));
const broken = [];
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const slugify = (value) => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
const plain = (value) => String(value).replace(/```[\s\S]*?```/g, " ").replace(/!?(\[([^\]]+)\])\([^)]*\)/g, "$2").replace(/[#>*_`|~-]/g, " ").replace(/\s+/g, " ").trim();

function linkFor(href, source) {
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(href)) return href;
  const [file, anchor] = href.split("#");
  const target = path.normalize(path.resolve(path.dirname(source), decodeURIComponent(file)));
  if (routes.has(target)) return `${routes.get(target)}${anchor ? `#${slugify(anchor)}` : ""}`;
  if (file.toLowerCase().endsWith(".md")) broken.push(`${path.relative(root, source)} -> ${href}`);
  return href.replace(/\\/g, "/");
}

function inline(value, source) {
  const tokens = [];
  const hold = (html) => { const key = `\u0000${tokens.length}\u0000`; tokens.push(html); return key; };
  let text = String(value)
    .replace(/`([^`]+)`/g, (_, code) => hold(`<code>${escape(code)}</code>`))
    .replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, (_, alt, href) => hold(`<img src="${escape(linkFor(href, source))}" alt="${escape(alt)}" loading="lazy">`))
    .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, (_, label, href) => hold(`<a href="${escape(linkFor(href, source))}">${escape(label)}</a>`));
  text = escape(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}

function markdown(source, file) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html = []; const toc = []; const ids = new Map(); let i = 0;
  const idFor = (title) => { const base = slugify(title); const count = ids.get(base) || 0; ids.set(base, count + 1); return count ? `${base}-${count + 1}` : base; };
  while (i < lines.length) {
    const line = lines[i]; if (!line.trim()) { i += 1; continue; }
    const fence = line.match(/^```([^\s]*)/);
    if (fence) { const code = []; i += 1; while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]); i += 1; html.push(`<pre><code${fence[1] ? ` class="language-${escape(fence[1])}"` : ""}>${escape(code.join("\n").replace(/[ \t]+$/gm, ""))}</code></pre>`); continue; }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) { const level = heading[1].length; const title = plain(heading[2]); const id = idFor(title); html.push(`<h${level} id="${id}">${inline(heading[2], file)}</h${level}>`); if (level === 2 || level === 3) toc.push({ level, title, id }); i += 1; continue; }
    const list = line.match(/^\s*(?:([-+*])|(\d+)\.)\s+(.+)$/);
    if (list) { const ordered = Boolean(list[2]); const items = []; while (i < lines.length) { const item = lines[i].match(/^\s*(?:([-+*])|(\d+)\.)\s+(.+)$/); if (!item || Boolean(item[2]) !== ordered) break; items.push(item[3]); i += 1; } const tag = ordered ? "ol" : "ul"; html.push(`<${tag}>${items.map((item) => `<li>${inline(item, file)}</li>`).join("")}</${tag}>`); continue; }
    if (line.startsWith(">")) { const quote = []; while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, "")); html.push(`<blockquote><p>${inline(quote.join(" "), file)}</p></blockquote>`); continue; }
    if (line.includes("|") && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] || "")) { const rows = []; const cells = (row) => row.split("|").map((cell) => cell.trim()).filter(Boolean); const header = cells(line); i += 2; while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(cells(lines[i++])); html.push(`<table><thead><tr>${header.map((cell) => `<th>${inline(cell, file)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell, file)}</td>`).join("")}</tr>`).join("")}</tbody></table>`); continue; }
    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4})\s|^```|^\s*(?:[-+*]|\d+\.)\s+|^>/.test(lines[i])) paragraph.push(lines[i++].trim());
    if (paragraph.length) {
      html.push(`<p>${inline(paragraph.join(" "), file)}</p>`);
    } else {
      // Always consume an unrecognized Markdown line so malformed or empty list
      // items cannot leave the parser in an infinite loop.
      html.push(`<p>${inline(lines[i].trim(), file)}</p>`);
      i += 1;
    }
  }
  return { html: html.join("\n"), toc };
}

function sidebar(current) {
  return groups.map(([group, entries]) => `<section class="nav-group"><h2>${escape(group)}</h2>${entries.map(([, slug, label]) => `<a${slug === current ? ' class="active" aria-current="page"' : ""} href="${route(slug)}">${escape(label)}</a>`).join("")}</section>`).join("");
}
function page(doc, rendered, index) {
  const previous = documents[index - 1]; const next = documents[index + 1];
  const toc = `<aside class="docs-toc" aria-label="En esta pagina"><h2>En esta pagina</h2>${rendered.toc.map((item) => `<a class="level-${item.level}" href="#${item.id}">${escape(item.title)}</a>`).join("") || "<span>Documento breve</span>"}</aside>`;
  return `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#102235"><meta name="description" content="${escape(doc.label)} - Documentacion SmartTense"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/docs/docs.css"><title>${escape(doc.label)} | SmartTense Docs</title><script src="/docs/docs.js" defer></script></head><body><a class="skip-link" href="#main-content">Saltar al contenido</a><header class="docs-header"><button class="mobile-menu" type="button" data-menu-toggle aria-expanded="false" aria-controls="docs-sidebar">Menu</button><a class="docs-brand" href="/docs/"><img src="/assets/smarttense-mark.svg" alt=""><span>SmartTense Docs</span></a><div class="docs-search"><input data-search type="search" aria-label="Buscar documentacion" placeholder="Buscar documentacion..."><div class="search-results" data-search-results hidden></div></div><div class="docs-actions"><button class="docs-button" type="button" data-theme-toggle>Tema oscuro</button><a class="back-app" href="/" target="_self">← Volver a la aplicacion</a></div></header><div class="docs-layout"><nav class="docs-sidebar" id="docs-sidebar" data-sidebar aria-label="Documentacion"><a class="back-app mobile-back" href="/" target="_self">← Volver a la aplicacion</a>${sidebar(doc.slug)}</nav><main class="docs-main" id="main-content"><article class="docs-article"><p class="page-meta">${escape(doc.group)}</p>${rendered.html}<nav class="page-nav" aria-label="Anterior y siguiente">${previous ? `<a href="${route(previous.slug)}"><span>Anterior</span>${escape(previous.label)}</a>` : "<span></span>"}${next ? `<a href="${route(next.slug)}"><span>Siguiente</span>${escape(next.label)}</a>` : ""}</nav></article></main>${toc}</div></body></html>`;
}

fs.mkdirSync(output, { recursive: true });
const sourceImages = path.join(root, "docs", "images");
if (fs.existsSync(sourceImages)) fs.cpSync(sourceImages, path.join(output, "images"), { recursive: true });
fs.copyFileSync(path.join(root, "docs-site", "theme.css"), path.join(output, "docs.css"));
fs.copyFileSync(path.join(root, "docs-site", "theme.js"), path.join(output, "docs.js"));
const search = [];
documents.forEach((doc, index) => {
  const file = path.join(root, doc.source); if (!fs.existsSync(file)) throw new Error(`Missing documentation source: ${doc.source}`);
  const source = fs.readFileSync(file, "utf8"); const rendered = markdown(source, file); const destination = doc.slug ? path.join(output, doc.slug, "index.html") : path.join(output, "index.html");
  fs.mkdirSync(path.dirname(destination), { recursive: true }); const html = page(doc, rendered, index); if (html.includes("/docs/docs/")) throw new Error(`Duplicate docs route: ${doc.source}`); fs.writeFileSync(destination, html, "utf8");
  search.push({ title: doc.label, group: doc.group, url: route(doc.slug), text: plain(source).slice(0, 2400) });
});
if (broken.length) throw new Error(`Broken local Markdown links:\n${broken.join("\n")}`);
fs.writeFileSync(path.join(output, "search-index.json"), `${JSON.stringify(search, null, 2)}\n`, "utf8");
console.log(`Documentation site built: ${documents.length} pages, 0 broken local Markdown links.`);
