export const defaultPlan = {
  title: "Sample Workout",
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
    "Squat: 3 x 8 at 60 kg",
    "DB Bench Press: 3 x 8 at 20 kg DBs",
    "Lat Pulldown: 3 x 10 at 40 kg"
  ],
  days: [
    {
      id: "sample_day_a",
      name: "Day A - Full Body",
      exercises: [
        { id: "sample_squat", name: "Back Squat", target: "3 x 8", prescribed: "40 kg", currentWeight: 40 },
        { id: "sample_db_bench", name: "DB Bench Press", target: "3 x 8", prescribed: "12 kg DBs", currentWeight: 12 },
        { id: "sample_lat_pd", name: "Lat Pulldown", target: "3 x 10", prescribed: "30 kg", currentWeight: 30 }
      ]
    },
    {
      id: "sample_day_b",
      name: "Day B - Full Body",
      exercises: [
        { id: "sample_rdl", name: "Romanian Deadlift", target: "3 x 8", prescribed: "35 kg", currentWeight: 35 },
        { id: "sample_ohp", name: "Overhead Press", target: "3 x 8", prescribed: "20 kg", currentWeight: 20 },
        { id: "sample_row", name: "Seated Cable Row", target: "3 x 10", prescribed: "30 kg", currentWeight: 30 }
      ]
    }
  ]
};
