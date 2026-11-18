const root = document.documentElement;
const system = window.matchMedia("(prefers-color-scheme: dark)");
const button = document.querySelector(".theme-toggle");
const key = "sensitivity-analysis-lab:theme";
let saved;
try {
  saved = localStorage.getItem(key);
} catch {
  // The control still works for this page if browser storage is restricted.
}

function show() {
  const theme = saved ?? (system.matches ? "dark" : "light");
  root.dataset.theme = theme;
  button.textContent = theme === "dark" ? "Light theme" : "Dark theme";
}

system.addEventListener("change", show);
button.addEventListener("click", () => {
  saved = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(key, saved);
  } catch {
    // A blocked storage write need not prevent the theme change.
  }
  show();
});
show();
button.hidden = false;
