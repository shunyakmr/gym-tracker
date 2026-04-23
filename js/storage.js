import { defaultPlan } from "./defaultPlan.js";
import { deepClone, normalizePlan } from "./plan.js";

const STORAGE_KEY = "gym-menu-tracker-v4";
const LEGACY_KEYS = ["gym-menu-tracker-v3", "gym-menu-tracker-v2", "gym-tracker-v1"];
const inMemoryStore = new Map();

function getWindowStorage(kind) {
  try {
    if (typeof window === "undefined" || !window[kind]) return null;
    const storage = window[kind];
    const probeKey = "__gym_tracker_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch (_) {
    return null;
  }
}

function getStorageBackends() {
  const backends = [];
  const local = getWindowStorage("localStorage");
  const session = getWindowStorage("sessionStorage");
  if (local) backends.push(local);
  if (session) backends.push(session);
  return backends;
}

function readFromBackends(key) {
  for (const backend of getStorageBackends()) {
    try {
      const value = backend.getItem(key);
      if (value !== null) return value;
    } catch (_) {
      // Ignore backend read failures and continue.
    }
  }
  return inMemoryStore.has(key) ? inMemoryStore.get(key) : null;
}

function writeToBackends(key, value) {
  let wrote = false;
  for (const backend of getStorageBackends()) {
    try {
      backend.setItem(key, value);
      wrote = true;
    } catch (_) {
      // Ignore backend write failures and continue.
    }
  }
  if (!wrote) {
    inMemoryStore.set(key, value);
    return true;
  }
  inMemoryStore.delete(key);
  return true;
}

function removeFromBackends(key) {
  for (const backend of getStorageBackends()) {
    try {
      backend.removeItem(key);
    } catch (_) {
      // Ignore backend remove failures and continue.
    }
  }
  inMemoryStore.delete(key);
}

export function getDefaultState() {
  const basePlan = deepClone(defaultPlan);
  return {
    plan: normalizePlan(basePlan, basePlan),
    logs: [],
    appliedMigrations: []
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
    logs: Array.isArray(rawObj.logs) ? rawObj.logs : current.logs,
    appliedMigrations: Array.isArray(rawObj.appliedMigrations) ? rawObj.appliedMigrations : []
  };
}

export function loadState() {
  const currentRaw = readFromBackends(STORAGE_KEY);
  if (currentRaw) {
    try {
      const migrated = migrateState(JSON.parse(currentRaw));
      if (migrated) return migrated;
    } catch (_) {
      return getDefaultState();
    }
  }

  for (const key of LEGACY_KEYS) {
    const raw = readFromBackends(key);
    if (!raw) continue;
    try {
      const migrated = migrateState(JSON.parse(raw));
      if (migrated) {
        writeToBackends(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch (_) {
      // Ignore malformed legacy entries and keep scanning.
    }
  }

  return getDefaultState();
}

export function saveState(state) {
  writeToBackends(STORAGE_KEY, JSON.stringify(state));
}

export function clearAllStoredData() {
  removeFromBackends(STORAGE_KEY);
  for (const key of LEGACY_KEYS) {
    removeFromBackends(key);
  }
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
