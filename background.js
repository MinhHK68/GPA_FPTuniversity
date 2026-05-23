/**
 * FPT GPA Dashboard - Background Service Worker
 *
 * LOAD  -> always tries a live scrape from the content script first.
 *          Falls back to most recent cached scrape only if content
 *          script is unreachable (user on a different tab).
 * SAVE  -> content script pushes scraped data here.
 * CLEAR -> wipe all cache (called on Refresh).
 */

const cache = new Map(); // tabId -> { data, ts }

chrome.runtime.onMessage.addListener((msg, sender, respond) => {

  /* SAVE: content script pushes freshly scraped data */
  if (msg.type === 'SAVE') {
    if (sender && sender.tab && sender.tab.id !== undefined) {
      cache.set(sender.tab.id, { data: msg.data, ts: Date.now() });
    }
    respond({ ok: true });
    return true;
  }

  /* LOAD: popup requests current transcript data */
  if (msg.type === 'LOAD') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) { respond({ ok: false, err: 'No active tab' }); return; }

      // Always attempt a live scrape -- never serve stale cache as primary.
      chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE' }, (r) => {
        if (!chrome.runtime.lastError && r && r.ok && r.data && r.data.length > 0) {
          cache.set(tab.id, { data: r.data, ts: Date.now() });
          respond({ ok: true, data: r.data });
          return;
        }
        // Content script unreachable: return freshest cached entry.
        let best = null;
        for (const entry of cache.values()) {
          if (!best || entry.ts > best.ts) best = entry;
        }
        if (best && best.data && best.data.length > 0) {
          respond({ ok: true, data: best.data });
        } else {
          respond({ ok: false, err: 'Open the FAP transcript page first.' });
        }
      });
    });
    return true;
  }

  /* CLEAR: wipe all cache */
  if (msg.type === 'CLEAR') {
    cache.clear();
    respond({ ok: true });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((id) => cache.delete(id));
