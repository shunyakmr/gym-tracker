import { loadState } from "./storage.js";

const state = loadState();
const logs = Array.isArray(state.logs) ? state.logs : [];

const el = {
  currentStreak: document.getElementById("currentStreak"),
  longestStreak: document.getElementById("longestStreak"),
  monthDays: document.getElementById("monthDays"),
  lastGymDay: document.getElementById("lastGymDay"),
  calendarMonth: document.getElementById("calendarMonth"),
  calendarGrid: document.getElementById("calendarGrid"),
  progressChart: document.getElementById("progressChart")
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

function getCurrentStreak(daySet) {
  if (daySet.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = toLocalDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterday);

  let cursor = null;
  if (daySet.has(todayKey)) {
    cursor = today;
  } else if (daySet.has(yesterdayKey)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (true) {
    const key = toLocalDateKey(cursor);
    if (!daySet.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getLongestStreak(daySet) {
  if (daySet.size === 0) return 0;

  const dates = Array.from(daySet)
    .map(fromDateKey)
    .sort((a, b) => a - b);

  let longest = 1;
  let run = 1;

  for (let i = 1; i < dates.length; i += 1) {
    const prev = new Date(dates[i - 1]);
    prev.setDate(prev.getDate() + 1);

    if (
      prev.getFullYear() === dates[i].getFullYear()
      && prev.getMonth() === dates[i].getMonth()
      && prev.getDate() === dates[i].getDate()
    ) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  return longest;
}

function renderStats(daySet) {
  const sortedKeys = Array.from(daySet).sort();
  const lastKey = sortedKeys.length ? sortedKeys[sortedKeys.length - 1] : null;

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-`;
  const monthCount = sortedKeys.filter((k) => k.startsWith(monthPrefix)).length;

  el.currentStreak.textContent = `${getCurrentStreak(daySet)} days`;
  el.longestStreak.textContent = `${getLongestStreak(daySet)} days`;
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

function buildDailySeries(items, daysBack = 60) {
  const dailyTotal = new Map();
  const dailyPullups = new Map();

  for (const entry of items) {
    const key = toLocalDateKey(entry.createdAt);
    const reps = Number(entry.reps) || 0;
    const sets = Number(entry.sets) || 0;
    const totalReps = reps * sets;

    dailyTotal.set(key, (dailyTotal.get(key) || 0) + totalReps);

    const name = String(entry.exerciseName || "").toLowerCase();
    const isPullup = name.includes("pull-up") || name.includes("pull up") || name.includes("pullup");
    if (isPullup) {
      dailyPullups.set(key, (dailyPullups.get(key) || 0) + totalReps);
    }
  }

  const labels = [];
  const totals = [];
  const pullups = [];

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (daysBack - 1));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = toLocalDateKey(d);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    totals.push(dailyTotal.get(key) || 0);
    pullups.push(dailyPullups.get(key) || 0);
  }

  return { labels, totals, pullups };
}

function renderChart(items) {
  const { labels, totals, pullups } = buildDailySeries(items, 60);
  // Chart.js is loaded from CDN in dashboard.html.
  // eslint-disable-next-line no-undef
  new Chart(el.progressChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Reps / Day",
          data: totals,
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34,211,238,0.16)",
          borderWidth: 2,
          tension: 0.25,
          pointRadius: 0,
          fill: true
        },
        {
          label: "Pull-Up Reps / Day",
          data: pullups,
          borderColor: "#a3e635",
          backgroundColor: "rgba(163,230,53,0.12)",
          borderWidth: 2,
          tension: 0.25,
          pointRadius: 0,
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

function init() {
  const daySet = buildWorkoutDaySet(logs);
  renderStats(daySet);
  renderCalendar(daySet);
  renderChart(logs);
}

init();
