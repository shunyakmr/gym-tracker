const THEME_KEY = "gym-tracker-theme";

function readThemeValue() {
  try {
    const local = window.localStorage?.getItem(THEME_KEY);
    if (local) return local;
  } catch (_) {
    // Ignore localStorage access failures.
  }
  try {
    return window.sessionStorage?.getItem(THEME_KEY);
  } catch (_) {
    return null;
  }
}

function writeThemeValue(theme) {
  let wrote = false;
  try {
    window.localStorage?.setItem(THEME_KEY, theme);
    wrote = true;
  } catch (_) {
    // Ignore localStorage access failures.
  }
  try {
    window.sessionStorage?.setItem(THEME_KEY, theme);
    wrote = true;
  } catch (_) {
    // Ignore sessionStorage access failures.
  }
  return wrote;
}

function resolveTheme() {
  const saved = readThemeValue();
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
  writeThemeValue(finalTheme);
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
