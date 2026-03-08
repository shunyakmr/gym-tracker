# Gym Menu Tracker

Mobile-first strength tracker with a dark neon gym theme, designed to run as a static site on GitHub Pages.

## File structure (modular)

- `index.html`: UI shell + Tailwind theme.
- `js/app.js`: app wiring, rendering, event handlers.
- `js/defaultPlan.js`: your preloaded 4-day plan.
- `js/plan.js`: plan normalization/helpers (robust to menu changes).
- `js/storage.js`: local persistence + migration + export.

## How to use (daily)

1. Open the app on your phone.
2. In `Quick Log`, choose:
   - `Day`
   - `Exercise`
   - `Weight`, `Reps`, `Sets`
3. Tap `Save Entry`.
4. Check exercise cards for current working weight and recent logs.

## How to edit your menu safely

1. Open `Menu Editor (JSON)`.
2. Edit plan JSON and keep at least:
   - top-level `days` array
   - each day has `name` and `exercises`
   - each exercise has `name` (ID optional)
3. Tap `Save Program JSON`.

The app auto-normalizes IDs and carries current weights forward where possible.

## Backups

- Data is stored locally in your browser (`localStorage`).
- Use `Export Backup JSON` once in a while.
- `Reset All Data` clears everything after confirmation.

## Publish on GitHub Pages

1. Push this folder to a GitHub repo.
2. GitHub -> `Settings` -> `Pages`.
3. Set:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or default), `/ (root)`
4. Open the Pages URL on your phone.
