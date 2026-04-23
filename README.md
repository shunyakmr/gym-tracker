# Training Tracker

Mobile-first dark-themed gym tracker. Log lifts with multi-group reps/sets, follow a weekly plan, and track pull-up and DB bench progress on a calendar + chart dashboard.

Live: https://shunyakmr.github.io/gym-tracker/

## Usage

- **Quick Log**: pick Day, Exercise, Weight, then one or more `Reps x Sets` rows. Tap `+ Add reps/sets` for extra groups. Picking a day also filters the Program View below.
- **Program View**: current weight per exercise, with recent logs.
- **Dashboard**: monthly workout count, last gym day, scrollable consistency calendar, pull-up reps chart (dot size = body + added kg), DB bench weight chart.
- **Menu Editor (JSON)**: edit your plan directly. `Reset To Original Plan` loads the default.
- **Backup**: export/import JSON. Data lives in `localStorage`.

## Files

- `index.html`, `js/app.js` — tracker UI
- `dashboard.html`, `js/dashboard.js` — stats + charts
- `js/defaultPlan.js` — default weekly plan
- `js/plan.js`, `js/storage.js` — normalization + persistence
- `references/` — sample backup used by the dashboard

## Develop

Static site. Run locally:

```
python3 -m http.server 8080
```

Visit `http://localhost:8080`.

## License

MIT. See [LICENSE](LICENSE).
