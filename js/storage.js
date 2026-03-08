import { defaultPlan } from "./defaultPlan.js";
import { deepClone, normalizePlan } from "./plan.js";

const STORAGE_KEY = "gym-menu-tracker-v4";
const LEGACY_KEYS = ["gym-menu-tracker-v3", "gym-menu-tracker-v2", "gym-tracker-v1"];

export function getDefaultState() {
  const basePlan = deepClone(defaultPlan);
  return {
    plan: normalizePlan(basePlan, basePlan),
    logs: [],
    pendingSync: [],
    settings: {
      syncUrl: "",
      lastSyncedAt: null
    }
  };
}

function migrateLegacyProgramShape(rawObj) {
  if (!Array.isArray(rawObj.program)) return null;

  return {
    globalRules: [],
    progressionRules: [],
    benchmarks: [],
    days: [
      {
        name: "Imported Program",
        exercises: rawObj.program.map((entry, idx) => ({
          id: entry.id || `import-${idx + 1}`,
          name: entry.name || `Exercise ${idx + 1}`,
          target: entry.target || "",
          prescribed: Number.isFinite(Number(entry.currentWeight)) ? `${entry.currentWeight} kg` : "",
          currentWeight: Number.isFinite(Number(entry.currentWeight)) ? Number(entry.currentWeight) : 0
        }))
      }
    ]
  };
}

export function migrateState(rawObj) {
  if (!rawObj || typeof rawObj !== "object") return null;

  let inputPlan = null;

  if (rawObj.plan && Array.isArray(rawObj.plan.days)) {
    inputPlan = rawObj.plan;
  } else {
    inputPlan = migrateLegacyProgramShape(rawObj);
  }

  if (!inputPlan) return null;

  const current = getDefaultState();
  return {
    plan: normalizePlan(inputPlan, inputPlan),
    logs: Array.isArray(rawObj.logs) ? rawObj.logs : [],
    pendingSync: Array.isArray(rawObj.pendingSync) ? rawObj.pendingSync : [],
    settings: {
      syncUrl: rawObj.settings?.syncUrl || current.settings.syncUrl,
      lastSyncedAt: rawObj.settings?.lastSyncedAt || current.settings.lastSyncedAt
    }
  };
}

export function loadState() {
  const currentRaw = localStorage.getItem(STORAGE_KEY);
  if (currentRaw) {
    try {
      const migrated = migrateState(JSON.parse(currentRaw));
      if (migrated) return migrated;
    } catch (_) {
      return getDefaultState();
    }
  }

  for (const key of LEGACY_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const migrated = migrateState(JSON.parse(raw));
      if (migrated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch (_) {
      // Ignore malformed legacy entries and keep scanning.
    }
  }

  return getDefaultState();
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gym-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importStateFromFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const migrated = migrateState(parsed);
  if (!migrated) {
    throw new Error("Unsupported backup format.");
  }
  return migrated;
}
