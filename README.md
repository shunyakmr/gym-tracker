# Training Tracker

Mobile-first strength tracker with a dark neon gym theme, designed to run as a static site on GitHub Pages.

Live website: https://shunyakmr.github.io/gym-tracker/

## File structure (modular)

- `index.html`: UI shell + Tailwind theme.
- `js/app.js`: app wiring, rendering, event handlers.
- `js/defaultPlan.js`: preloaded minimal sample workout.
- `js/plan.js`: plan normalization/helpers (robust to menu changes).
- `js/storage.js`: local persistence + migration + export.
- `dashboard.html` + `js/dashboard.js`: consistency calendar, streaks, and progress graph.

## How to use (daily)

1. Open the app on your phone.
2. Use the slider toggle in the top-right to switch light/dark mode.
3. In `Quick Log`, choose:
   - `Day`
   - `Exercise`
   - `Weight`, `Reps`, `Sets`
4. Tap `Save Entry`.
5. Check exercise cards for current working weight and recent logs.
6. Open `Dashboard` for consistency + streak + graph view.

## How to customize your plan

1. Open `Menu Editor (JSON)`.
2. Edit plan JSON and keep at least:
   - optional top-level `title` (app title)
   - top-level `days` array
   - each day has `name` and `exercises`
   - each exercise has `name` (ID optional)
3. Tap `Save Program JSON`.

The app auto-normalizes IDs, uses whatever day list you provide, and carries current weights forward where possible.

## Dashboard graph behavior

- `Pull-Ups` graph is shown only if your menu includes a pull-up exercise.
- `DB Bench Press` graph is shown only if your menu includes a DB/dumbbell bench exercise.
- If those activities are not in your plan, those graph cards are hidden automatically.

## Build a plan with AI chat (easy mode)

1. Open your favorite AI chat tool.
2. Ask it to output JSON in the exact format below.
3. Copy the JSON output.
4. Paste into `Menu Editor (JSON)` in this app.
5. Tap `Save Program JSON`.

Example prompt you can paste into AI chat:

```text
Create a gym plan JSON for this tracker app.
Return only valid JSON (no markdown, no commentary).
Use this exact schema:
{
  "title": "string",
  "globalRules": ["string"],
  "progressionRules": ["string"],
  "benchmarks": ["string"],
  "days": [
    {
      "name": "string",
      "exercises": [
        {
          "name": "string",
          "target": "string",
          "prescribed": "string",
          "currentWeight": 0
        }
      ]
    }
  ]
}
Make [N] training days named [DAY NAMES], and include [GOALS/EQUIPMENT/EXPERIENCE].
```

Minimal valid JSON example:

```json
{
  "title": "My Training Plan",
  "days": [
    {
      "name": "Upper Body",
      "exercises": [
        { "name": "Bench Press", "target": "3 x 5", "prescribed": "40 kg", "currentWeight": 40 }
      ]
    },
    {
      "name": "Lower Body",
      "exercises": [
        { "name": "Squat", "target": "3 x 5", "prescribed": "50 kg", "currentWeight": 50 }
      ]
    }
  ]
}
```

## Backups

- Data is stored locally in your browser (`localStorage`).
- Use `Export Backup JSON` once in a while.
- `Reset All Data` clears everything after confirmation.

## Development

- This project is a static site. Open `index.html` directly, or serve locally:
  - `python3 -m http.server 8080`
  - visit `http://localhost:8080`

## Contributing

- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution workflow.
- See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.

## Security

- See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

- MIT License. See [LICENSE](LICENSE).
