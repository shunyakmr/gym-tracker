import { loadState } from "./storage.js";
import { initThemeToggle } from "./theme.js";

const state = loadState();
const logs = Array.isArray(state.logs) ? state.logs : [];

const el = {
  monthDays: document.getElementById("monthDays"),
  lastGymDay: document.getElementById("lastGymDay"),
  dashboardTitle: document.getElementById("dashboardTitle"),
  themeToggle: document.getElementById("themeToggle"),
  calendarMonth: document.getElementById("calendarMonth"),
  calendarGrid: document.getElementById("calendarGrid"),
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

function renderCalendar(daySet) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  el.calendarMonth.textContent = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Convert JS week day (Sun=0) to Mon=0 index.
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

function buildPullupSeries(items, daysBack = 60) {
  const dailyPullups = new Map();

  for (const entry of items) {
    const name = String(entry.exerciseName || "").toLowerCase();
    const isPullup = name.includes("pull-up") || name.includes("pull up") || name.includes("pullup");
    if (!isPullup) continue;

    const key = toLocalDateKey(entry.createdAt);
    const reps = Number(entry.reps) || 0;
    const sets = Number(entry.sets) || 0;
    const totalReps = reps * sets;

    dailyPullups.set(key, (dailyPullups.get(key) || 0) + totalReps);
  }

  const labels = [];
  const pullups = [];

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (daysBack - 1));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = toLocalDateKey(d);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    pullups.push(dailyPullups.has(key) ? dailyPullups.get(key) : null);
  }

  return { labels, pullups };
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

function renderChart(items) {
  const { labels, pullups } = buildPullupSeries(items, 60);
  // Chart.js is loaded from CDN in dashboard.html.
  // eslint-disable-next-line no-undef
  new Chart(el.progressChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Pull-Ups Total Reps / Day",
          data: pullups,
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34,211,238,0.16)",
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
      plugins: {
        legend: {
          labels: { color: "#d4d4d8" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#71717a", maxTicksLimit: 10 },
          grid: { color: "rgba(113,113,122,0.15)" }
        },
        y: {
          ticks: { color: "#71717a" },
          grid: { color: "rgba(113,113,122,0.15)" }
        }
      }
    }
  });
}

function renderBenchChart(items) {
  const { labels, weights } = buildBenchWeightSeries(items, 60);
  // Chart.js is loaded from CDN in dashboard.html.
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
          spanGaps: false,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#d4d4d8" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#71717a", maxTicksLimit: 10 },
          grid: { color: "rgba(113,113,122,0.15)" }
        },
        y: {
          ticks: { color: "#71717a" },
          grid: { color: "rgba(113,113,122,0.15)" }
        }
      }
    }
  });
}

function menuHasPullups(plan) {
  for (const day of (plan.days || [])) {
    for (const ex of (day.exercises || [])) {
      const id = String(ex.id || "").toLowerCase();
      const name = String(ex.name || "").toLowerCase();
      if (id.includes("pullup") || id.includes("pull-up") || name.includes("pullup") || name.includes("pull-up") || name.includes("pull up")) {
        return true;
      }
    }
  }
  return false;
}

function menuHasDbBench(plan) {
  for (const day of (plan.days || [])) {
    for (const ex of (day.exercises || [])) {
      const id = String(ex.id || "").toLowerCase();
      const name = String(ex.name || "").toLowerCase();
      if (id === "db_bench" || name.includes("db bench") || name.includes("dumbbell bench")) {
        return true;
      }
    }
  }
  return false;
}

function init() {
  initThemeToggle(el.themeToggle);
  const baseTitle = String(state.plan?.title || "Training Tracker");
  if (el.dashboardTitle) {
    el.dashboardTitle.textContent = `${baseTitle} Dashboard`;
  }
  document.title = `${baseTitle} Dashboard`;
  const daySet = buildWorkoutDaySet(logs);
  renderStats(daySet);
  renderCalendar(daySet);

  if (menuHasPullups(state.plan)) {
    renderChart(logs);
  } else if (el.pullupSection) {
    el.pullupSection.remove();
  }

  if (menuHasDbBench(state.plan)) {
    renderBenchChart(logs);
  } else if (el.benchSection) {
    el.benchSection.remove();
  }
}

init();
