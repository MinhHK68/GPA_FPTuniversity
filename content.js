/**
 * FPT GPA Dashboard - Content Script
 * Runs on: https://fap.fpt.edu.vn/Grade/StudentTranscript.aspx
 *
 * Real column layout of StudentTranscript.aspx (0-based):
 *   0  NO
 *   1  TERM
 *   2  SEMESTER
 *   3  SUBJECT CODE
 *   4  PREREQUISITE
 *   5  REPLACED SUBJECT
 *   6  SUBJECT NAME
 *   7  CREDIT
 *   8  GRADE
 *   9  STATUS
 *
 * FILTER RULES (all must be true to include a row):
 *   - TERM  > 0          (exclude English-prep TERM <= 0, and TERM 0 non-GPA subjects)
 *   - STATUS == "Passed" (exclude "Studying", "Failed", blank, etc.)
 *   - GRADE  is a number (exclude rows without a grade yet)
 *   - CREDIT is a number > 0
 *   - SUBJECT CODE is not empty
 *
 * Semester names are read DIRECTLY from the SEMESTER column.
 * They are NEVER generated or inferred from term numbers.
 */

(function () {
  'use strict';

  const txt = (el) => (el ? el.textContent.trim() : '');
  const num = (s)  => { const n = parseFloat(String(s).replace(',', '.')); return isNaN(n) ? null : n; };

  /* ------------------------------------------------------------------
   * findTable()
   * Locate the transcript <table> and return:
   *   { tbl, colIdx }  where colIdx maps field names to column numbers.
   * Uses exact-then-partial matching so short keys like "TERM" never
   * accidentally match "SEMESTER".
   * ------------------------------------------------------------------ */
  function findTable() {
    for (const tbl of document.querySelectorAll('table')) {
      // Prefer <thead> header row; fall back to the first <tr> in the table.
      const hdrRow = tbl.querySelector('thead tr') || tbl.querySelector('tr');
      if (!hdrRow) continue;

      const cells   = Array.from(hdrRow.querySelectorAll('th, td'));
      const headers = cells.map(c => txt(c).toUpperCase().replace(/\s+/g, ' ').trim());

      // Must contain both TERM and GRADE columns to be the right table.
      if (!headers.includes('TERM'))  continue;
      if (!headers.includes('GRADE')) continue;

      // Build colIdx using the full header text as key (exact match).
      const colIdx = {};
      headers.forEach((h, i) => {
        if (!(h in colIdx)) colIdx[h] = i;
      });

      return { tbl, colIdx };
    }
    return null;
  }

  /* ------------------------------------------------------------------
   * resolve(colIdx, ...keys)
   * Return the first column index whose header EXACTLY matches one of
   * the given keys, or -1 if none found.
   * Exact match prevents "TERM" from hitting "SEMESTER" etc.
   * ------------------------------------------------------------------ */
  function resolve(colIdx, ...keys) {
    for (const k of keys) {
      if (k in colIdx) return colIdx[k];
    }
    return -1;
  }

  /* ------------------------------------------------------------------
   * scrape()
   * Parse every <tbody tr> in the transcript table and return an array
   * of qualifying course objects.
   * ------------------------------------------------------------------ */
  function scrape() {
    const courses = [];

    const found = findTable();
    if (!found) {
      console.warn('[FPT GPA] Transcript table not found on this page.');
      return courses;
    }

    const { tbl, colIdx } = found;

    // Resolve column indices by EXACT header name.
    // Fallback aliases listed as additional args handle minor label variations.
    const iTerm     = resolve(colIdx, 'TERM');
    const iSemester = resolve(colIdx, 'SEMESTER');
    const iCode     = resolve(colIdx, 'SUBJECT CODE', 'CODE');
    const iName     = resolve(colIdx, 'SUBJECT NAME', 'NAME');
    const iCredit   = resolve(colIdx, 'CREDIT', 'CREDITS');
    const iGrade    = resolve(colIdx, 'GRADE');
    const iStatus   = resolve(colIdx, 'STATUS');

    console.debug('[FPT GPA] Resolved columns:', { iTerm, iSemester, iCode, iName, iCredit, iGrade, iStatus });

    // Abort if any critical column could not be found.
    if ([iTerm, iSemester, iCode, iCredit, iGrade, iStatus].includes(-1)) {
      console.error('[FPT GPA] One or more required columns not found in table.', colIdx);
      return courses;
    }

    const maxIdx = Math.max(iTerm, iSemester, iCode, iName, iCredit, iGrade, iStatus);

    // Use tbody rows exclusively to skip the header row.
    // If the table has no <tbody> (some ASP.NET tables render flat), fall back
    // to all <tr> elements whose first child is a <td> (not a <th>).
    let bodyRows = Array.from(tbl.querySelectorAll('tbody tr'));
    if (bodyRows.length === 0) {
      bodyRows = Array.from(tbl.querySelectorAll('tr')).filter(r => r.querySelector('td'));
    }

    for (const row of bodyRows) {
      const cells = row.querySelectorAll('td');

      // Row must have enough cells to reach the last required column.
      if (cells.length <= maxIdx) continue;

      const term     = num(txt(cells[iTerm]));
      const semester = txt(cells[iSemester]);   // always read directly from DOM
      const code     = txt(cells[iCode]);
      const name     = iName >= 0 ? txt(cells[iName]) : '';
      const credit   = num(txt(cells[iCredit]));
      const grade    = num(txt(cells[iGrade]));
      const status   = txt(cells[iStatus]).toLowerCase().trim();

      // RULE 1: Ignore TERM <= 0  (English prep -5..-1, and non-GPA subjects at 0)
      if (term === null || term <= 0) continue;

      // RULE 2: Only "Passed" status contributes to GPA.
      //         "Studying", "Failed", "Exempt", blank, etc. are all excluded.
      if (status !== 'passed') continue;

      // RULE 3: Must have a real numeric grade.
      if (grade === null) continue;

      // RULE 4: Must have a positive credit value.
      if (credit === null || credit <= 0) continue;

      // RULE 5: Subject code must not be blank (skip subtotal / blank rows).
      if (!code) continue;

      courses.push({ term, semester, code, name, credit, grade, status: 'Passed' });
    }

    console.info(
      '[FPT GPA] Scraped', courses.length, 'qualifying courses across',
      new Set(courses.map(c => c.semester)).size, 'semesters.'
    );
    return courses;
  }

  /* ------------------------------------------------------------------
   * saveToBackground(data)
   * Push scraped data to the service worker cache.
   * ------------------------------------------------------------------ */
  function saveToBackground(data) {
    chrome.runtime.sendMessage({ type: 'SAVE', data }, () => {
      // Ignore errors (background may not be ready yet on very first load).
      void chrome.runtime.lastError;
    });
  }

  /* ------------------------------------------------------------------
   * Message listener: popup/background asks for a fresh scrape.
   * ------------------------------------------------------------------ */
  chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
    if (msg.type !== 'SCRAPE') return;
    const data = scrape();
    saveToBackground(data);
    respond({ ok: true, data });
    return true;
  });

  /* ------------------------------------------------------------------
   * Auto-scrape on page load.
   * FAP pages sometimes use ASP.NET UpdatePanel partial postbacks, so
   * the table might not be fully populated at document_idle.
   * We attempt immediately and then retry once after 2 s.
   * ------------------------------------------------------------------ */
  (function autoScrape() {
    const data = scrape();
    if (data.length > 0) {
      saveToBackground(data);
    } else {
      // Retry after the page has had a chance to finish any async rendering.
      setTimeout(() => {
        const retryData = scrape();
        if (retryData.length > 0) saveToBackground(retryData);
      }, 2000);
    }
  })();

})();
