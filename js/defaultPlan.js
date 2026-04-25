export const defaultPlan = {
  title: "Weekly Training Plan",
  globalRules: [
    "Warm up for 5-10 minutes before lifting.",
    "Keep 1-2 reps in reserve on each set.",
    "Focus on clean form before adding weight."
  ],
  progressionRules: [
    "When all sets feel solid, increase weight by 2.5 kg next session.",
    "If weight increase is too hard, keep weight and add 1 rep per set."
  ],
  benchmarks: [
    "Pull-ups: 20-30 weighted reps (+5kg)",
    "DB Bench Press: 4 x 6-8 at 22.5 kg DBs"
  ],
  days: [
    {
      id: "day1-pull-strength",
      name: "Day 1 - Pull Strength",
      exercises: [
        { id: "pullup-weighted", name: "Pull-ups (weighted)", target: "20-30 total reps", prescribed: "+5 kg", currentWeight: 5 },
        { id: "cable-lateral-raise", name: "Cable lateral raise", target: "3 x 12-15", prescribed: "", currentWeight: 4.5 },
        { id: "cable-rear-delt-fly", name: "Cable rear delt fly", target: "3 x 12-15", prescribed: "", currentWeight: 6.8 },
        { id: "seated-cable-row", name: "Seated Cable Row", target: "3 x 8-10", prescribed: "", currentWeight: 43 },
        { id: "straight-arm-pulldown", name: "Straight-arm pulldown", target: "3 x 12-15", prescribed: "", currentWeight: 18 }
      ]
    },
    {
      id: "day2-push-strength",
      name: "Day 2 - Push Strength",
      exercises: [
        { id: "db-bench", name: "DB Bench Press", target: "4 x 6-8", prescribed: "22.5 kg DBs", currentWeight: 20 },
        { id: "incline-db-bench", name: "Incline DB Bench", target: "3 x 8-10", prescribed: "", currentWeight: 0 },
        { id: "triceps-pushdown", name: "Triceps pushdown", target: "3 x 10-12", prescribed: "", currentWeight: 0 },
        { id: "light-cable-row", name: "Light cable row", target: "3 x 12", prescribed: "", currentWeight: 0 }
      ]
    },
    {
      id: "day3-pull-endurance",
      name: "Day 3 - Pull Endurance",
      exercises: [
        { id: "pullup-bodyweight", name: "Pull-ups (bodyweight)", target: "60-80 total reps", prescribed: "bodyweight", currentWeight: 0 },
        { id: "cable-lateral-raise-d3", name: "Cable lateral raise", target: "3 x 15", prescribed: "", currentWeight: 0 },
        { id: "cable-rear-delt-fly-d3", name: "Cable rear delt fly", target: "3 x 15", prescribed: "", currentWeight: 0 },
        { id: "db-bench-light", name: "DB Bench (light)", target: "3 x 10-12", prescribed: "", currentWeight: 0 }
      ]
    },
    {
      id: "day4-rest",
      name: "Day 4 - Rest / Active Recovery",
      exercises: []
    },
    {
      id: "day5-pull-volume",
      name: "Day 5 - Pull Volume",
      exercises: [
        { id: "pullup-volume", name: "Pull-ups", target: "40-55 total reps", prescribed: "", currentWeight: 65 },
        { id: "seated-cable-row-d5", name: "Seated Cable Row", target: "3 x 10-12", prescribed: "", currentWeight: 0 },
        { id: "straight-arm-pulldown-d5", name: "Straight-arm pulldown", target: "3 x 15", prescribed: "", currentWeight: 0 }
      ]
    },
    {
      id: "day6-push-endurance",
      name: "Day 6 - Push + Endurance",
      exercises: [
        { id: "db-bench-d6", name: "DB Bench Press", target: "4 x 8-10", prescribed: "", currentWeight: 0 },
        { id: "incline-db-bench-d6", name: "Incline DB Bench", target: "3 x 10-12", prescribed: "", currentWeight: 0 },
        { id: "cable-lateral-raise-d6", name: "Cable lateral raise", target: "3 x 15", prescribed: "", currentWeight: 0 },
        { id: "cable-rear-delt-fly-d6", name: "Cable rear delt fly", target: "3 x 15", prescribed: "", currentWeight: 0 },
        { id: "triceps-pushdown-d6", name: "Triceps pushdown", target: "3 x 12-15", prescribed: "", currentWeight: 0 }
      ]
    }
  ]
};
