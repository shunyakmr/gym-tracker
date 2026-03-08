export function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

export function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "item";
}

export function normalizePlan(inputPlan, prevPlan = null) {
  if (!inputPlan || !Array.isArray(inputPlan.days)) {
    throw new Error("Program must include a 'days' array.");
  }

  const prevById = new Map();
  const prevByName = new Map();

  if (prevPlan && Array.isArray(prevPlan.days)) {
    for (const day of prevPlan.days) {
      for (const ex of (day.exercises || [])) {
        prevById.set(ex.id, ex);
        prevByName.set(`${day.name}::${String(ex.name || "").toLowerCase()}`, ex);
      }
    }
  }

  const dayIds = new Set();
  const days = inputPlan.days.map((day, dIdx) => {
    const baseDayId = day.id ? slug(day.id) : `day-${dIdx + 1}-${slug(day.name)}`;
    let dayId = baseDayId;
    let daySuffix = 2;
    while (dayIds.has(dayId)) dayId = `${baseDayId}-${daySuffix++}`;
    dayIds.add(dayId);

    const exerciseIds = new Set();
    const exercises = (Array.isArray(day.exercises) ? day.exercises : []).map((ex, eIdx) => {
      const baseExId = ex.id ? slug(ex.id) : `${dayId}-${eIdx + 1}-${slug(ex.name)}`;
      let exId = baseExId;
      let exSuffix = 2;
      while (exerciseIds.has(exId)) exId = `${baseExId}-${exSuffix++}`;
      exerciseIds.add(exId);

      const oldById = prevById.get(exId);
      const oldByName = prevByName.get(`${day.name}::${String(ex.name || "").toLowerCase()}`);
      const fallbackWeight = Number(ex.currentWeight);
      const carriedWeight = Number(oldById?.currentWeight ?? oldByName?.currentWeight);

      return {
        id: exId,
        name: ex.name || `Exercise ${eIdx + 1}`,
        target: ex.target || "",
        prescribed: ex.prescribed || "",
        currentWeight: Number.isFinite(carriedWeight)
          ? carriedWeight
          : (Number.isFinite(fallbackWeight) ? fallbackWeight : 0)
      };
    });

    return {
      id: dayId,
      name: day.name || `Day ${dIdx + 1}`,
      exercises
    };
  });

  return {
    globalRules: Array.isArray(inputPlan.globalRules) ? inputPlan.globalRules : [],
    progressionRules: Array.isArray(inputPlan.progressionRules) ? inputPlan.progressionRules : [],
    benchmarks: Array.isArray(inputPlan.benchmarks) ? inputPlan.benchmarks : [],
    days
  };
}

export function flattenExercises(plan) {
  const out = [];
  for (const day of plan.days) {
    for (const ex of day.exercises) {
      out.push({ dayId: day.id, dayName: day.name, ...ex });
    }
  }
  return out;
}
