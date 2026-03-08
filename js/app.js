import { normalizePlan } from "./plan.js";
import { loadState, saveState, getDefaultState, exportState, importStateFromFile, clearAllStoredData } from "./storage.js";
import { enqueueSync, syncPending } from "./sync.js";

let state = loadState();
let activeDayTab = "all";

function applyOneOffPlanMigrations() {
  let changed = false;
  for (const day of state.plan.days || []) {
    const before = (day.exercises || []).length;
    day.exercises = (day.exercises || []).filter(
      (ex) => ex.id !== "calf_raise" && ex.id !== "calf_iso"
    );
    if (day.exercises.length !== before) {
      changed = true;
    }
  }
  if (changed) {
    saveState(state);
  }
}

const el = {
  daySelect: document.getElementById("daySelect"),
  exerciseSelect: document.getElementById("exerciseSelect"),
  weightInput: document.getElementById("weightInput"),
  repsInput: document.getElementById("repsInput"),
  setsInput: document.getElementById("setsInput"),
  dayTabs: document.getElementById("dayTabs"),
  exerciseList: document.getElementById("exerciseList"),
  globalRules: document.getElementById("globalRules"),
  progressionRules: document.getElementById("progressionRules"),
  benchmarks: document.getElementById("benchmarks"),
  programInput: document.getElementById("programInput"),
  syncUrlInput: document.getElementById("syncUrlInput"),
  syncStatus: document.getElementById("syncStatus"),
  saveLogBtn: document.getElementById("saveLogBtn"),
  syncNowBtn: document.getElementById("syncNowBtn"),
  saveProgramBtn: document.getElementById("saveProgramBtn"),
  resetProgramBtn: document.getElementById("resetProgramBtn"),
  saveSyncBtn: document.getElementById("saveSyncBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importInput: document.getElementById("importInput"),
  resetAllBtn: document.getElementById("resetAllBtn")
};

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function findDay(dayId) {
  return state.plan.days.find((d) => d.id === dayId) || null;
}

function findExercise(dayId, exId) {
  const day = findDay(dayId);
  if (!day) return null;
  return day.exercises.find((e) => e.id === exId) || null;
}

function logsForExercise(day, ex) {
  return state.logs
    .filter((l) => {
      if (l.dayId === day.id && l.exerciseId === ex.id) return true;
      return String(l.dayName || "").toLowerCase() === day.name.toLowerCase()
        && String(l.exerciseName || "").toLowerCase() === ex.name.toLowerCase();
    })
    .slice(-4)
    .reverse();
}

function renderList(target, entries) {
  target.innerHTML = (entries || []).map((x) => `<li class="text-zinc-300">${x}</li>`).join("");
}

function renderDaySelect() {
  el.daySelect.innerHTML = state.plan.days
    .map((d) => `<option value="${d.id}">${d.name}</option>`)
    .join("");
}

function renderExerciseSelect() {
  const selectedDay = findDay(el.daySelect.value) || state.plan.days[0];
  if (!selectedDay) {
    el.exerciseSelect.innerHTML = "";
    return;
  }
  el.exerciseSelect.innerHTML = selectedDay.exercises
    .map((e) => `<option value="${e.id}">${e.name}</option>`)
    .join("");
  setWeightHint();
}

function renderDayTabs() {
  const tabs = [{ id: "all", name: "All Days" }, ...state.plan.days];
  el.dayTabs.innerHTML = tabs
    .map((t) => {
      const active = activeDayTab === t.id;
      return `<button data-tab="${t.id}" class="px-3 py-1.5 rounded-full border text-xs md:text-sm ${active ? "bg-cyan-400 text-black border-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.6)]" : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-cyan-500"}">${t.name}</button>`;
    })
    .join("");

  el.dayTabs.querySelectorAll("button[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeDayTab = button.dataset.tab;
      renderDayTabs();
      renderExerciseCards();
    });
  });
}

function renderExerciseCards() {
  const days = activeDayTab === "all"
    ? state.plan.days
    : state.plan.days.filter((d) => d.id === activeDayTab);

  el.exerciseList.innerHTML = "";

  for (const day of days) {
    const dayCard = document.createElement("section");
    dayCard.className = "rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 mb-3";
    dayCard.innerHTML = `<h2 class="text-zinc-100 font-semibold text-lg mb-2">${day.name}</h2>`;

    for (const ex of day.exercises) {
      const logs = logsForExercise(day, ex);
      const history = logs.length
        ? logs.map((h) => `<li>${h.weight}kg x ${h.reps} reps x ${h.sets} sets - ${formatDate(h.createdAt)}</li>`).join("")
        : "<li>No history yet</li>";

      const card = document.createElement("article");
      card.className = "rounded-xl border border-zinc-700 bg-zinc-950 p-3 mb-2";
      card.innerHTML = `
        <h3 class="text-cyan-300 font-medium mb-1">${ex.name}</h3>
        <p class="text-xs text-zinc-400">Target: ${ex.target || "-"}</p>
        <p class="text-xs text-zinc-400">Start: ${ex.prescribed || "-"}</p>
        <p class="text-sm text-zinc-200 mt-1">Current weight: <span class="text-lime-300 font-semibold">${ex.currentWeight} kg</span></p>
        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mt-2">
          <div>
            <label class="text-xs text-zinc-400" for="cw_${day.id}_${ex.id}">Update current weight (kg)</label>
            <input id="cw_${day.id}_${ex.id}" type="number" min="0" step="0.5" value="${ex.currentWeight}" class="w-full mt-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 px-3 py-2">
          </div>
          <button data-day="${day.id}" data-ex="${ex.id}" class="rounded-lg px-3 py-2 bg-cyan-400 text-black font-semibold self-end hover:bg-cyan-300">Save Weight</button>
        </div>
        <div class="mt-2 text-xs text-zinc-400">Recent logs<ul class="list-disc pl-5 mt-1 text-zinc-300">${history}</ul></div>
      `;
      dayCard.appendChild(card);
    }

    el.exerciseList.appendChild(dayCard);
  }

  el.exerciseList.querySelectorAll("button[data-day][data-ex]").forEach((button) => {
    button.addEventListener("click", () => {
      const { day: dayId, ex: exId } = button.dataset;
      const input = document.getElementById(`cw_${dayId}_${exId}`);
      const weight = Number(input.value);
      if (!Number.isFinite(weight) || weight < 0) {
        alert("Enter a valid weight.");
        return;
      }
      const ex = findExercise(dayId, exId);
      if (!ex) return;
      ex.currentWeight = weight;
      saveState(state);
      renderExerciseCards();
      setWeightHint();
      renderProgramEditor();
    });
  });
}

function setWeightHint() {
  const day = findDay(el.daySelect.value);
  if (!day) return;
  const ex = day.exercises.find((item) => item.id === el.exerciseSelect.value);
  if (!ex) return;
  el.weightInput.value = ex.currentWeight;
}

function renderProgramEditor() {
  el.programInput.value = JSON.stringify(state.plan, null, 2);
}

function renderSyncStatus() {
  const pending = state.pendingSync.length;
  const lastSynced = state.settings.lastSyncedAt ? formatDate(state.settings.lastSyncedAt) : "Never";
  el.syncStatus.textContent = `Pending sync: ${pending} | Last synced: ${lastSynced}`;
}

async function saveLog() {
  const day = findDay(el.daySelect.value);
  if (!day) return alert("Pick a day.");

  const ex = day.exercises.find((item) => item.id === el.exerciseSelect.value);
  if (!ex) return alert("Pick an exercise.");

  const weight = Number(el.weightInput.value);
  const reps = Number(el.repsInput.value);
  const sets = Number(el.setsInput.value);

  if (!Number.isFinite(weight) || weight < 0 || !Number.isFinite(reps) || reps <= 0 || !Number.isFinite(sets) || sets <= 0) {
    return alert("Enter valid weight, reps and sets.");
  }

  const log = {
    createdAt: new Date().toISOString(),
    dayId: day.id,
    dayName: day.name,
    exerciseId: ex.id,
    exerciseName: ex.name,
    target: ex.target || "",
    weight,
    reps,
    sets
  };

  state.logs.push(log);
  ex.currentWeight = weight;

  enqueueSync(state, { event: "log_entry", loggedAt: log.createdAt, log });
  saveState(state);

  el.repsInput.value = "";
  el.setsInput.value = "";

  renderExerciseCards();
  renderProgramEditor();
  renderSyncStatus();

  await runSync();
}

async function runSync() {
  const result = await syncPending(state);
  saveState(state);
  renderSyncStatus();
  if (result.usedFallback) {
    console.info("Sync used no-cors fallback mode for Apps Script.");
  }
  if (!result.skipped && result.synced === 0 && state.pendingSync.length > 0) {
    const msg = result.lastError
      ? `Sync did not complete: ${result.lastError}. Entries stay in pending queue.`
      : "Sync did not complete. Entries stay in pending queue.";
    alert(msg);
  }
}

function saveProgram() {
  try {
    const parsed = JSON.parse(el.programInput.value);
    state.plan = normalizePlan(parsed, state.plan);
    saveState(state);
    activeDayTab = "all";
    renderAll();
    alert("Program updated.");
  } catch (error) {
    alert(`Invalid program JSON: ${error.message}`);
  }
}

function resetProgram() {
  if (!window.confirm("Reset to original plan and clear all logs?")) return;
  state = getDefaultState();
  activeDayTab = "all";
  saveState(state);
  renderAll();
}

function resetAllData() {
  const logsCount = Array.isArray(state.logs) ? state.logs.length : 0;
  const confirmed = window.confirm(
    `Are you sure you want to reset all app data? This will delete your plan edits, ${logsCount} logs, and pending sync queue.`
  );
  if (!confirmed) return;
  clearAllStoredData();
  state = getDefaultState();
  activeDayTab = "all";
  saveState(state);
  renderAll();
  alert("All data has been reset.");
}

function saveSyncSettings() {
  state.settings.syncUrl = el.syncUrlInput.value.trim();
  saveState(state);
  renderSyncStatus();
  alert("Sync webhook URL saved.");
}

async function importBackupFile(file) {
  try {
    state = await importStateFromFile(file);
    activeDayTab = "all";
    saveState(state);
    renderAll();
    alert("Backup imported.");
  } catch (error) {
    alert(`Import failed: ${error.message}`);
  }
}

function bindEvents() {
  el.daySelect.addEventListener("change", renderExerciseSelect);
  el.exerciseSelect.addEventListener("change", setWeightHint);

  el.saveLogBtn.addEventListener("click", saveLog);
  el.syncNowBtn.addEventListener("click", runSync);

  el.saveProgramBtn.addEventListener("click", saveProgram);
  el.resetProgramBtn.addEventListener("click", resetProgram);

  el.saveSyncBtn.addEventListener("click", saveSyncSettings);
  el.exportBtn.addEventListener("click", () => exportState(state));
  if (el.resetAllBtn) {
    el.resetAllBtn.addEventListener("click", resetAllData);
  }
  el.importInput.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    await importBackupFile(file);
    el.importInput.value = "";
  });
}

function renderAll() {
  renderList(el.globalRules, state.plan.globalRules || []);
  renderList(el.progressionRules, state.plan.progressionRules || []);
  renderList(el.benchmarks, state.plan.benchmarks || []);

  renderDaySelect();
  renderExerciseSelect();
  renderDayTabs();
  renderExerciseCards();
  renderProgramEditor();

  el.syncUrlInput.value = state.settings.syncUrl || "";
  renderSyncStatus();
}

bindEvents();
applyOneOffPlanMigrations();
renderAll();
