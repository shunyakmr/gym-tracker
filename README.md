# Gym Menu Tracker

Mobile-first strength tracker with a dark neon gym theme, designed to run as a static site on GitHub Pages.

## File structure (modular)

- `index.html`: UI shell + Tailwind theme.
- `js/app.js`: app wiring, rendering, event handlers.
- `js/defaultPlan.js`: your preloaded 4-day plan.
- `js/plan.js`: plan normalization/helpers (robust to menu changes).
- `js/storage.js`: local persistence + migration + export/import.
- `js/sync.js`: pending-queue sync to webhook (Google Sheets).

## How to use (daily)

1. Open the app on your phone.
2. In `Quick Log`, choose:
   - `Day`
   - `Exercise`
   - `Weight`, `Reps`, `Sets`
3. Tap `Save Entry`.
4. Check each exercise card to see:
   - current working weight
   - recent logs history
5. Use `Sync Pending` if cloud sync is configured.

## How to edit your menu safely

1. Open `Menu Editor (JSON)`.
2. Edit plan JSON and keep at least:
   - top-level `days` array
   - each day has `name` and `exercises`
   - each exercise has `name` (ID optional)
3. Tap `Save Program JSON`.

The app auto-normalizes IDs and carries current weights forward where possible.

## Data durability

- Local data always saves in browser `localStorage`.
- Use `Export Backup JSON` regularly.
- Use `Import Backup JSON` to restore on another device/browser.
- Optional cloud sync sends each log to Google Sheets; unsent logs stay in `Pending sync` and retry later.

## Publish on GitHub Pages

1. Push this folder to a GitHub repo.
2. GitHub -> `Settings` -> `Pages`.
3. Set:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or default), `/ (root)`
4. Open the Pages URL on your phone.

## Recommended alternative: Notion sync (via Make.com webhook)

Direct browser-to-Notion API is not recommended because it requires exposing your Notion secret.  
Use a webhook relay (Make.com), then write to Notion server-side in that scenario.

1. Create a Notion database with columns:
   - `Logged At` (date)
   - `Day` (text)
   - `Exercise` (title or text)
   - `Weight` (number)
   - `Reps` (number)
   - `Sets` (number)
2. In Make.com, create a new scenario:
   - Trigger: `Webhooks > Custom webhook`
   - Action: `Notion > Create a database item`
3. Map webhook JSON fields from app payload:
   - `log.createdAt`
   - `log.dayName`
   - `log.exerciseName`
   - `log.weight`
   - `log.reps`
   - `log.sets`
4. Turn scenario on and copy the webhook URL.
5. In this app:
   - `Data & Sync` -> paste URL in `Sync Webhook URL`
   - click `Save Sync URL`
   - click `Sync Pending`

If Make/Notion is temporarily unavailable, logs remain queued in `Pending sync` and retry later.
