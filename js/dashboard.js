import { loadState } from "./storage.js";
import { initThemeToggle } from "./theme.js";

const REFERENCE_BACKUP_URL = "./references/gym-tracker-backup-2026-04-23.json";
const PULLUP_BASELINE_KG = 65;

const el = {
  monthDays: document.getElementById("monthDays"),
  lastGymDay: document.getElementById("lastGymDay"),
  dashboardTitle: document.getElementById("dashboardTitle"),
  themeToggle: document.getElementById("themeToggle"),
  calendarMonth: document.getElementById("calendarMonth"),
  calendarGrid: document.getElementById("calendarGrid"),
  calPrev: document.getElementById("calPrev"),
  calNext: document.getElementById("calNext"),
  pullupSection: document.getElementById("pullupSection"),
  benchSection: document.getElementById("benchSection"),
  progressChart: document.getElementById("progressChart"),
  benchChart: document.getElementById("benchChart")
};

function toLocalDateKey(iso) {
  const d = iso instanceof Date ? iso : new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatPrettyDate(key) {
  return fromDateKey(key).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function buildWorkoutDaySet(items) {
  return new Set(items.map((l) => toLocalDateKey(l.createdAt)));
}

function renderStats(daySet) {
  const sortedKeys = Array.from(daySet).sort();
  const lastKey = sortedKeys.length ? sortedKeys[sortedKeys.length - 1] : null;

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-`;
  const monthCount = sortedKeys.filter((k) => k.startsWith(monthPrefix)).length;

  el.monthDays.textContent = `${monthCount} days`;
  el.lastGymDay.textContent = lastKey ? formatPrettyDate(lastKey) : "No logs yet";
}

let calendarCursor = new Date();
calendarCursor.setDate(1);

function renderCalendar(daySet) {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  el.calendarMonth.textContent = calendarCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push('<div class="day-cell rounded-lg border border-zinc-800 bg-zinc-950/60"></div>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const active = daySet.has(key);
    cells.push(`
      <div class="day-cell rounded-lg border ${active ? "border-cyan-400 bg-cyan-400/20" : "border-zinc-800 bg-zinc-950/60"} p-2">
        <div class="text-xs ${active ? "text-cyan-200" : "text-zinc-500"}">${day}</div>
      </div>
    `);
  }

  el.calendarGrid.innerHTML = cells.join("");
}

function shiftCalendar(delta, daySet) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + delta, 1);
  renderCalendar(daySet);
}

function pullupAddedKg(weight) {
  const w = Number(weight);
  if (!Number.isFinite(w)) return 0;
  if (w >= PULLUP_BASELINE_KG) return Math.max(0, w - PULLUP_BASELINE_KG);
  return Math.max(0, w);
}

function buildPullupSeries(items, daysBack = 60) {
  const dailyPullups = new Map();
  const dailyMaxAdded = new Map();

  for (const entry of items) {
    const name = String(entry.exerciseName || "").toLowerCase();
    const isPullup = name.includes("pull-up") || name.includes("pull up") || name.includes("pullup");
    if (!isPullup) continue;

    const key = toLocalDateKey(entry.createdAt);
    let totalReps = Number(entry.totalReps);
    if (!Number.isFinite(totalReps)) {
      if (Array.isArray(entry.groups) && entry.groups.length) {
        totalReps = entry.groups.reduce((sum, g) => sum + (Number(g.reps) || 0) * (Number(g.sets) || 0), 0);
      } else {
        totalReps = (Number(entry.reps) || 0) * (Number(entry.sets) || 0);
      }
    }

    dailyPullups.set(key, (dailyPullups.get(key) || 0) + totalReps);

    const added = pullupAddedKg(entry.weight);
    const prev = dailyMaxAdded.get(key);
    dailyMaxAdded.set(key, prev === undefined ? added : Math.max(prev, added));
  }

  const labels = [];
  const pullups = [];
  const radii = [];
  const totalWeights = [];

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (daysBack - 1));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = toLocalDateKey(d);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    const hasData = dailyPullups.has(key);
    pullups.push(hasData ? dailyPullups.get(key) : null);

    const added = dailyMaxAdded.get(key) || 0;
    totalWeights.push(hasData ? PULLUP_BASELINE_KG + added : null);
    radii.push(hasData ? 3 + added * 0.6 : 0);
  }

  return { labels, pullups, radii, totalWeights };
}

function buildBenchWeightSeries(items, daysBack = 60) {
  const dailyBenchWeight = new Map();

  for (const entry of items) {
    const name = String(entry.exerciseName || "").toLowerCase();
    const id = String(entry.exerciseId || "").toLowerCase();
    const isDbBench = id === "db_bench" || name.includes("db bench press");
    if (!isDbBench) continue;

    const key = toLocalDateKey(entry.createdAt);
    const weight = Number(entry.weight);
    if (!Number.isFinite(weight)) continue;

    const prev = dailyBenchWeight.get(key);
    dailyBenchWeight.set(key, prev === undefined ? weight : Math.max(prev, weight));
  }

  const labels = [];
  const weights = [];

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (daysBack - 1));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = toLocalDateKey(d);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    weights.push(dailyBenchWeight.has(key) ? dailyBenchWeight.get(key) : null);
  }

  return { labels, weights };
}

function renderPullupChart(items) {
  const { labels, pullups, radii, totalWeights } = buildPullupSeries(items, 60);
  // eslint-disable-next-line no-undef
  new Chart(el.progressChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Pull-Ups Total Reps / Day (dot size = body+added kg)",
          data: pullups,
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34,211,238,0.16)",
          borderWidth: 2,
          tension: 0.25,
          pointRadius: radii,
          pointHoverRadius: radii.map((r) => (r ? r + 2 : 0)),
          spanGaps: true,
          fill: true,
          totalWeights
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#d4d4d8" } },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => {
              const w = ctx.dataset.totalWeights?.[ctx.dataIndex];
              return Number.isFinite(w) ? `Weight: ${w} kg` : "";
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: "#71717a", maxTicksLimit: 10 }, grid: { color: "rgba(113,113,122,0.15)" } },
        y: { ticks: { color: "#71717a" }, grid: { color: "rgba(113,113,122,0.15)" } }
      }
    }
  });
}

function renderBenchChart(items) {
  const { labels, weights } = buildBenchWeightSeries(items, 60);
  // eslint-disable-next-line no-undef
  new Chart(el.benchChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "DB Bench Weight (kg)",
          data: weights,
          borderColor: "#a3e635",
          backgroundColor: "rgba(163,230,53,0.16)",
          borderWidth: 2,
          tension: 0.25,
          pointRadius: 2,
          spanGaps: true,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#d4d4d8" } } },
      scales: {
        x: { ticks: { color: "#71717a", maxTicksLimit: 10 }, grid: { color: "rgba(113,113,122,0.15)" } },
        y: { ticks: { color: "#71717a" }, grid: { color: "rgba(113,113,122,0.15)" } }
      }
    }
  });
}

function hasAnyPullupLog(items) {
  return items.some((e) => {
    const n = String(e.exerciseName || "").toLowerCase();
    return n.includes("pull-up") || n.includes("pull up") || n.includes("pullup");
  });
}

function hasAnyDbBenchLog(items) {
  return items.some((e) => {
    const n = String(e.exerciseName || "").toLowerCase();
    const id = String(e.exerciseId || "").toLowerCase();
    return id === "db_bench" || n.includes("db bench press");
  });
}

async function loadReferenceLogs() {
  try {
    const res = await fetch(REFERENCE_BACKUP_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.logs) ? data.logs : null;
  } catch (_) {
    return null;
  }
}

async function init() {
  initThemeToggle(el.themeToggle);

  const state = loadState();
  const referenceLogs = await loadReferenceLogs();
  const logs = referenceLogs || (Array.isArray(state.logs) ? state.logs : []);

  const baseTitle = String(state.plan?.title || "Training Tracker");
  if (el.dashboardTitle) el.dashboardTitle.textContent = `${baseTitle} Dashboard`;
  document.title = `${baseTitle} Dashboard`;

  const daySet = buildWorkoutDaySet(logs);
  renderStats(daySet);
  renderCalendar(daySet);

  el.calPrev?.addEventListener("click", () => shiftCalendar(-1, daySet));
  el.calNext?.addEventListener("click", () => shiftCalendar(1, daySet));

  if (hasAnyPullupLog(logs)) {
    renderPullupChart(logs);
  } else if (el.pullupSection) {
    el.pullupSection.remove();
  }

  if (hasAnyDbBenchLog(logs)) {
    renderBenchChart(logs);
  } else if (el.benchSection) {
    el.benchSection.remove();
  }
}

init();
