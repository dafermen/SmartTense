const root = document.documentElement;
const themeButton = document.querySelector("[data-theme-toggle]");
const menuButton = document.querySelector("[data-menu-toggle]");
const sidebar = document.querySelector("[data-sidebar]");
const searchInput = document.querySelector("[data-search]");
const searchResults = document.querySelector("[data-search-results]");

function applyTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("smarttense-docs-theme", theme);
  if (themeButton) themeButton.textContent = theme === "dark" ? "Tema claro" : "Tema oscuro";
}
const storedTheme = localStorage.getItem("smarttense-docs-theme");
applyTheme(storedTheme === "light" || storedTheme === "dark" ? storedTheme : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeButton?.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));
menuButton?.addEventListener("click", () => {
  const open = sidebar?.classList.toggle("is-open") || false;
  menuButton.setAttribute("aria-expanded", String(open));
});
sidebar?.addEventListener("click", (event) => {
  if (event.target.closest("a") && matchMedia("(max-width: 900px)").matches) {
    sidebar.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
let searchIndex = [];
fetch("/docs/search-index.json").then((response) => response.ok ? response.json() : []).then((entries) => { searchIndex = entries; }).catch(() => {});
function renderSearch(query) {
  const normalized = query.trim().toLocaleLowerCase("es");
  if (!searchResults || normalized.length < 2) {
    if (searchResults) { searchResults.hidden = true; searchResults.innerHTML = ""; }
    return;
  }
  const matches = searchIndex.filter((entry) => `${entry.title} ${entry.group} ${entry.text}`.toLocaleLowerCase("es").includes(normalized)).slice(0, 8);
  searchResults.innerHTML = matches.length ? matches.map((entry) => `<a href="${escapeHtml(entry.url)}"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.group)}</span></a>`).join("") : "<p>No se encontraron documentos.</p>";
  searchResults.hidden = false;
}
searchInput?.addEventListener("input", (event) => renderSearch(event.target.value));
searchInput?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { event.currentTarget.value = ""; renderSearch(""); event.currentTarget.blur(); }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.ctrlKey && !event.metaKey && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || "")) {
    event.preventDefault(); searchInput?.focus();
  }
});
