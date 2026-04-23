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
      id: "day1_pull_strength",
      name: "Day 1 - Pull Strength",
      exercises: [
        { id: "pullup_weighted", name: "Pull-ups (weighted)", target: "20-30 total reps", prescribed: "+5 kg", currentWeight: 5 },
        { id: "cable_lateral_raise", name: "Cable lateral raise", target: "3 x 12-15", prescribed: "", currentWeight: 0 },
        { id: "cable_rear_delt_fly", name: "Cable rear delt fly", target: "3 x 12-15", prescribed: "", currentWeight: 0 },
        { id: "seated_cable_row", name: "Seated Cable Row", target: "3 x 8-10", prescribed: "", currentWeight: 0 },
        { id: "straight_arm_pulldown", name: "Straight-arm pulldown", target: "3 x 12-15", prescribed: "", currentWeight: 0 }
      ]
    },
    {
      id: "day2_push_strength",
      name: "Day 2 - Push Strength",
      exercises: [
        { id: "db_bench", name: "DB Bench Press", target: "4 x 6-8", prescribed: "22.5 kg DBs", currentWeight: 22.5 },
        { id: "incline_db_bench", name: "Incline DB Bench", target: "3 x 8-10", prescribed: "", currentWeight: 0 },
        { id: "triceps_pushdown", name: "Triceps pushdown", target: "3 x 10-12", prescribed: "", currentWeight: 0 },
        { id: "light_cable_row", name: "Light cable row", target: "3 x 12", prescribed: "", currentWeight: 0 }
      ]
    },
    {
      id: "day3_pull_endurance",
      name: "Day 3 - Pull Endurance",
      exercises: [
        { id: "pullup_bodyweight", name: "Pull-ups (bodyweight)", target: "60-80 total reps", prescribed: "bodyweight", currentWeight: 0 },
        { id: "cable_lateral_raise_d3", name: "Cable lateral raise", target: "3 x 15", prescribed: "", currentWeight: 0 },
        { id: "cable_rear_delt_fly_d3", name: "Cable rear delt fly", target: "3 x 15", prescribed: "", currentWeight: 0 },
        { id: "db_bench_light", name: "DB Bench (light)", target: "3 x 10-12", prescribed: "", currentWeight: 0 }
      ]
    },
    {
      id: "day4_rest",
      name: "Day 4 - Rest / Active Recovery",
      exercises: []
    },
    {
      id: "day5_pull_volume",
      name: "Day 5 - Pull Volume",
      exercises: [
        { id: "pullup_volume", name: "Pull-ups", target: "40-55 total reps", prescribed: "", currentWeight: 0 },
        { id: "seated_cable_row_d5", name: "Seated Cable Row", target: "3 x 10-12", prescribed: "", currentWeight: 0 },
        { id: "straight_arm_pulldown_d5", name: "Straight-arm pulldown", target: "3 x 15", prescribed: "", currentWeight: 0 }
      ]
    },
    {
      id: "day6_push_endurance",
      name: "Day 6 - Push + Endurance",
      exercises: [
        { id: "db_bench_d6", name: "DB Bench Press", target: "4 x 8-10", prescribed: "", currentWeight: 0 },
        { id: "incline_db_bench_d6", name: "Incline DB Bench", target: "3 x 10-12", prescribed: "", currentWeight: 0 },
        { id: "cable_lateral_raise_d6", name: "Cable lateral raise", target: "3 x 15", prescribed: "", currentWeight: 0 },
        { id: "cable_rear_delt_fly_d6", name: "Cable rear delt fly", target: "3 x 15", prescribed: "", currentWeight: 0 },
        { id: "triceps_pushdown_d6", name: "Triceps pushdown", target: "3 x 12-15", prescribed: "", currentWeight: 0 }
      ]
    }
  ]
};
