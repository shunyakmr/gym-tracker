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

## Optional: Sync logs to Google Sheets

1. Create a Google Sheet and name first tab `Logs`.
2. Open `Extensions` -> `Apps Script`.
3. Paste:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logs");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Logs");
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "receivedAt", "event", "loggedAt",
        "dayId", "dayName", "exerciseId", "exerciseName",
        "target", "weight", "reps", "sets", "rawJson"
      ]);
    }

    var payload = JSON.parse(e.postData.contents || "{}");
    var log = payload.log || {};

    sheet.appendRow([
      new Date().toISOString(),
      payload.event || "",
      payload.loggedAt || "",
      log.dayId || "",
      log.dayName || "",
      log.exerciseId || "",
      log.exerciseName || "",
      log.target || "",
      log.weight || "",
      log.reps || "",
      log.sets || "",
      JSON.stringify(payload)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Deploy as web app: `Deploy` -> `New deployment` -> `Web app`.
5. Set:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Copy the Web App URL.
7. In app -> `Data & Sync` -> paste URL -> `Save Sync URL`.
8. Save logs normally; app auto-queues and syncs, and `Sync Pending` forces retry.

## If sync still fails

1. Confirm the Apps Script deployment is the **Web app URL** ending with `/exec` (not editor URL).
2. In deployment settings, keep:
   - Execute as: `Me`
   - Access: `Anyone`
3. After script edits, create a **new deployment version** and update URL in app.
4. Check sheet tab is exactly named `Logs`.
5. Retry `Sync Pending`.

The app now includes a browser-safe fallback mode for Google Apps Script CORS behavior; pending entries should clear once requests are accepted.
