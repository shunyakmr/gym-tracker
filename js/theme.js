const THEME_KEY = "gym-tracker-theme";

function resolveTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateToggleState(button, theme) {
  if (!button) return;
  const isLight = theme === "light";
  button.classList.toggle("is-light", isLight);
  button.setAttribute("aria-pressed", String(isLight));
  button.setAttribute("title", isLight ? "Switch to dark mode" : "Switch to light mode");
}

export function applyTheme(theme) {
  const finalTheme = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", finalTheme);
  localStorage.setItem(THEME_KEY, finalTheme);
}

export function initThemeToggle(button) {
  const startingTheme = resolveTheme();
  applyTheme(startingTheme);
  updateToggleState(button, startingTheme);

  if (!button) return;
  button.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    updateToggleState(button, next);
  });
}
