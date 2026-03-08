export const defaultPlan = {
  title: "Training Tracker",
  globalRules: [
    "RPE 6-7 (2-3 reps in reserve)",
    "2-3 sec controlled eccentrics",
    "Add load slowly",
    "Never grind reps"
  ],
  progressionRules: [
    "Main lifts: progress one variable at a time (+2.5 kg every 1-2 weeks OR +1 rep per set).",
    "Pull-Up strength day: when 5x4 clean reps, add +2.5 kg weighted.",
    "Pull-Up volume day: start 18-20 total reps, add +2-3 weekly to 30 reps.",
    "RDL: add +2.5 kg weekly if form is clean (short target 60x5, 6-month target 80-90x5).",
    "DB Bench: 15 kg x 3x6 toward 20 kg in ~8-10 weeks, longer term 22-24 kg.",
    "Shoulder Press: add +1-2 kg every 2-3 weeks toward 18-20 kg."
  ],
  benchmarks: [
    "Pull-Ups: 12 reps",
    "Weighted Pull-Up: +10 kg for 3",
    "RDL: 90 kg for 5",
    "DB Bench: 24 kg DBs",
    "Shoulder Press: 20 kg DBs"
  ],
  days: [
    {
      id: "day1",
      name: "Day 1 - Lower + Pull Strength",
      exercises: [
        { id: "rdl_d1", name: "Romanian Deadlift", target: "3 x 5", prescribed: "45 kg", currentWeight: 45 },
        { id: "pullup_strength", name: "Pull-Ups (Strength Focus)", target: "5 x 3", prescribed: "Bodyweight 65 kg", currentWeight: 65 },
        { id: "chest_row", name: "Chest-Supported Row", target: "3 x 8 (pause at top)", prescribed: "12 kg DBs", currentWeight: 12 },
        { id: "knee_raise", name: "Hanging Knee Raise", target: "3 x 8-10", prescribed: "Bodyweight", currentWeight: 0 }
      ]
    },
    {
      id: "day2",
      name: "Day 2 - Push + Upper Back",
      exercises: [
        { id: "db_bench", name: "DB Bench Press", target: "3 x 6", prescribed: "15 kg DBs", currentWeight: 15 },
        { id: "db_shoulder", name: "Seated DB Shoulder Press", target: "3 x 6", prescribed: "10-12 kg DBs", currentWeight: 10 },
        { id: "face_pull", name: "Face Pull", target: "3 x 12-15", prescribed: "6.8-10 kg", currentWeight: 6.8 },
        { id: "cable_lateral", name: "Cable Lateral Raise", target: "2-3 x 12", prescribed: "Light-moderate", currentWeight: 0 },
        { id: "pallof", name: "Pallof Press", target: "2 x 10 / side", prescribed: "8-12 kg", currentWeight: 8 }
      ]
    },
    {
      id: "day3",
      name: "Day 3 - Pull Volume + Core",
      exercises: [
        { id: "pullup_volume", name: "Pull-Ups (Volume)", target: "18-20 total reps (sets as needed)", prescribed: "Bodyweight 65 kg", currentWeight: 65 },
        { id: "lat_pd", name: "Lat Pulldown (Neutral Grip)", target: "3 x 8-10", prescribed: "35 kg", currentWeight: 35 },
        { id: "seated_row", name: "Seated Cable Row", target: "3 x 8-10", prescribed: "35-40 kg", currentWeight: 35 },
        { id: "leg_raise", name: "Hanging Leg Raise", target: "3 x 8-10", prescribed: "Bodyweight", currentWeight: 0 }
      ]
    },
    {
      id: "day4",
      name: "Day 4 - Posterior + Shoulder Stability",
      exercises: [
        { id: "rdl_d4", name: "Romanian Deadlift (Light)", target: "3 x 8", prescribed: "40 kg", currentWeight: 40 },
        { id: "leg_press", name: "Leg Press", target: "3 x 8-10", prescribed: "80-100 kg", currentWeight: 80 },
        { id: "incline_db", name: "Incline DB Press", target: "3 x 8", prescribed: "12-14 kg DBs", currentWeight: 12 },
        { id: "rear_delt", name: "Rear Delt Fly (Machine/Cable)", target: "3 x 12", prescribed: "Moderate", currentWeight: 0 },
        { id: "dead_hang", name: "Dead Hang", target: "2 x 30-40 sec", prescribed: "Bodyweight", currentWeight: 0 }
      ]
    }
  ]
};
