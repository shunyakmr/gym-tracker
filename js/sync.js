export function enqueueSync(state, payload) {
  state.pendingSync.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    payload
  });
}

export async function syncPending(state) {
  const url = String(state.settings.syncUrl || "").trim();
  if (!url) return { synced: 0, attempted: 0, skipped: true };

  let synced = 0;
  let attempted = 0;
  let usedFallback = false;

  while (state.pendingSync.length > 0) {
    attempted += 1;
    const item = state.pendingSync[0];
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload)
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      state.pendingSync.shift();
      synced += 1;
    } catch (_) {
      try {
        // Google Apps Script web apps can reject CORS preflight for JSON.
        // Fallback uses a simple request that browsers allow in no-cors mode.
        await fetch(url, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(item.payload)
        });
        state.pendingSync.shift();
        synced += 1;
        usedFallback = true;
      } catch (_) {
        break;
      }
    }
  }

  if (synced > 0) {
    state.settings.lastSyncedAt = new Date().toISOString();
  }

  return { synced, attempted, skipped: false, usedFallback };
}
