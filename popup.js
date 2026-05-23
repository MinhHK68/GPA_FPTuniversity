/**
 * FAP GPA Analyzer Pro — Popup Controller
 *
 * Key rules enforced here AND in content.js:
 *   ✔ Only TERM > 0
 *   ✔ Only STATUS === "Passed"
 *   ✔ GPA = Σ(grade × credit) / Σ(credit)
 *   ✔ Scale 4 = Scale10 × 0.4
 */

'use strict';

/* ── State ─────────────────────────────────────── */
let ALL       = [];     // all qualifying courses
let VIEW      = [];     // courses for current filter
let scale     = 10;     // 10 or 4
let mode      = 'all';  // 'all' | 'one'
let activeSem = null;
let simOver   = {};     // { code → overrideGrade }

/* ── GPA maths ─────────────────────────────────── */
const gpa10 = (courses, ov = {}) => {
  let sw = 0, sc = 0;
  for (const c of courses) {
    const g = ov[c.code] !== undefined ? ov[c.code] : c.grade;
    sw += g * c.credit;
    sc += c.credit;
  }
  return sc ? sw / sc : 0;
};

const toScale4 = (g10) => +(g10 * 0.4).toFixed(3);

const gpaDisplay = (courses, ov = {}) => {
  const g = gpa10(courses, ov);
  return scale === 10 ? g : toScale4(g);
};

const rankInfo = (g) => {
  if (scale === 10) {
    if (g >= 9)   return { label: 'Xuất Sắc', key: 'xuat-sac', next: null };
    if (g >= 8)   return { label: 'Giỏi',     key: 'gioi',     next: { label: 'Xuất Sắc', thr: 9 } };
    if (g >= 7)   return { label: 'Khá',       key: 'kha',      next: { label: 'Giỏi',     thr: 8 } };
    if (g >= 5)   return { label: 'Trung Bình',key: 'tb',       next: { label: 'Khá',       thr: 7 } };
    return              { label: 'Yếu',        key: 'yeu',      next: { label: 'Trung Bình',thr: 5 } };
  } else {
    if (g >= 3.6) return { label: 'Xuất Sắc', key: 'xuat-sac', next: null };
    if (g >= 3.2) return { label: 'Giỏi',     key: 'gioi',     next: { label: 'Xuất Sắc', thr: 3.6 } };
    if (g >= 2.5) return { label: 'Khá',       key: 'kha',      next: { label: 'Giỏi',     thr: 3.2 } };
    if (g >= 2.0) return { label: 'Trung Bình',key: 'tb',       next: { label: 'Khá',       thr: 2.5 } };
    return              { label: 'Yếu',        key: 'yeu',      next: { label: 'Trung Bình',thr: 2.0 } };
  }
};

const rankBadgeClass = (key) => ({
  'xuat-sac': 'mb-xs', 'gioi': 'mb-g', 'kha': 'mb-kh', 'tb': 'mb-tb', 'yeu': 'mb-yeu'
})[key] || '';

/* ── Unique ordered semesters ──────────────────────
   Preserves the chronological order from the transcript
   table (rows appear top-to-bottom by ascending TERM).
   ─────────────────────────────────────────────────── */
const getSemesters = () => {
  const seen = new Set();
  const out  = [];
  for (const c of ALL) {
    if (!seen.has(c.semester)) {
      seen.add(c.semester);
      out.push(c.semester);
    }
  }
  return out;
};

/* ── Active course set ─────────────────────────── */
const getView = () =>
  mode === 'all' ? ALL : ALL.filter(c => c.semester === activeSem);

/* ── Render: Hero ──────────────────────────────── */
function renderHero() {
  const g = gpaDisplay(VIEW);
  const max = scale === 10 ? '10.0' : '4.0';
  const r = rankInfo(g);

  document.getElementById('heroGpa').textContent  = g.toFixed(2);
  document.getElementById('heroMax').textContent  = `/ ${max}`;
  document.getElementById('heroBgText').textContent = r.label.charAt(0).toUpperCase();

  const badge = document.getElementById('heroBadge');
  badge.textContent = r.label;
  badge.className   = `rank-badge rank-${r.key}`;

  const hint = document.getElementById('heroHint');
  if (r.next) {
    const gap = (r.next.thr - g).toFixed(2);
    hint.innerHTML = `Need <strong>+${gap}</strong> for <strong>${r.next.label}</strong>`;
  } else {
    hint.innerHTML = '🏆 Top rank achieved!';
  }
}

/* ── Render: Stats ─────────────────────────────── */
function renderStats() {
  const sems = [...new Set(VIEW.map(c => c.semester))];

  // ── Best Sem: find semester with highest GPA ──────────────────────
  // Keep full label to avoid ambiguity across years (Fall2024 vs Fall2025).
  // Display as short form: "Fall24", "Spring25", etc. to fit the pill.
  let bestSem = '—', bestG = -1;
  sems.forEach(s => {
    const g = gpa10(ALL.filter(c => c.semester === s));
    if (g > bestG) { bestG = g; bestSem = s; }
  });

  // Shorten "Fall2024" → "Fall24", "Spring2025" → "Spr25" etc.
  const shortSem = (label) => {
    // Match season word + 4-digit year, e.g. "Fall2024", "Spring2025", "Summer2024"
    const m = label.match(/^([A-Za-z]+)(\d{4})$/);
    if (!m) return label.slice(0, 7); // fallback: trim long unknown formats
    const season = m[1].length > 4 ? m[1].slice(0, 3) : m[1]; // "Summer"→"Sum", "Spring"→"Spr", "Fall"→"Fall"
    const year   = m[2].slice(2);                               // "2024" → "24"
    return season + year;                                        // e.g. "Fall24", "Spr25", "Sum24"
  };

  // ── Semesters pill: different meaning per mode ────────────────────
  // All Semesters → count of distinct semesters in VIEW
  // One Semester  → the TERM value of the selected semester (read from data, never hardcoded)
  let semestersPillValue;
  if (mode === 'all') {
    semestersPillValue = sems.length;
  } else {
    // Find the TERM for the active semester directly from the parsed course data.
    // All courses in the same semester share the same term value.
    const match = ALL.find(c => c.semester === activeSem);
    semestersPillValue = match ? match.term : '—';
  }

  // Also update the pill label text to match what is being shown
  const semLabel = document.querySelector('#statSemesters + .ps-lbl, .pill-stat .ps-lbl');
  // Update the label of the 3rd pill depending on mode
  const pillStats = document.querySelectorAll('.pill-stat');
  if (pillStats[2]) {
    pillStats[2].querySelector('.ps-lbl').textContent = mode === 'one' ? 'Term' : 'Semesters';
  }

  document.getElementById('statSubjects').textContent   = VIEW.length;
  document.getElementById('statCredits').textContent    = VIEW.reduce((s, c) => s + c.credit, 0);
  document.getElementById('statSemesters').textContent  = semestersPillValue;
  document.getElementById('statBest').textContent       = bestSem === '—' ? '—' : shortSem(bestSem);
}

/* ── Render: Suggestions ───────────────────────── */
function renderSuggestions() {
  const ranked = [...VIEW]
    .filter(c => c.grade < 10)
    .map(c => ({ ...c, impact: c.credit * (10 - c.grade) }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);

  const el = document.getElementById('suggestList');
  el.innerHTML = '';

  if (!ranked.length) {
    el.innerHTML = '<p style="color:var(--ink-3);text-align:center;padding:20px">🎉 Nothing to improve — perfect scores!</p>';
    return;
  }

  ranked.forEach((c, i) => {
    const n = i + 1;
    const impactLabel = n === 1 ? '🔥 High' : n === 2 ? '⚡ Med' : '✨ Low';
    const potentialGain = (
      gpa10(VIEW.map(x => x.code === c.code ? { ...x, grade: 10 } : x)) -
      gpa10(VIEW)
    ).toFixed(3);

    const div = document.createElement('div');
    div.className = `suggest-item si-${n}`;
    div.innerHTML = `
      <div class="si-num">${n}</div>
      <div class="si-body">
        <div class="si-code">${c.code}</div>
        <div class="si-name">${c.name}</div>
        <div class="si-meta">
          <span>📊 Grade: ${c.grade.toFixed(1)}</span>
          <span>🎓 Credit: ${c.credit}</span>
          <span>📈 Max gain: +${potentialGain}</span>
        </div>
      </div>
      <span class="si-impact">${impactLabel}</span>
    `;
    el.appendChild(div);
  });
}

/* ── Render: Simulator ─────────────────────────── */
function buildSimulator() {
  simOver = {};
  const list = document.getElementById('simList');
  list.innerHTML = '';

  VIEW.slice(0, 15).forEach(c => {
    const row = document.createElement('div');
    row.className = 'sim-row';
    row.innerHTML = `
      <span class="sim-code">${c.code}</span>
      <span class="sim-name" title="${c.name}">${c.name}</span>
      <input class="sim-input" type="number" min="0" max="10" step="0.1"
             value="${c.grade.toFixed(1)}"
             data-code="${c.code}"
             data-orig="${c.grade}"/>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll('.sim-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const v    = parseFloat(inp.value);
      const orig = parseFloat(inp.dataset.orig);
      if (!isNaN(v) && v >= 0 && v <= 10) {
        simOver[inp.dataset.code] = v;
        inp.classList.toggle('changed', Math.abs(v - orig) > 0.01);
      } else {
        delete simOver[inp.dataset.code];
        inp.classList.remove('changed');
      }
      updateSimResult();
    });
  });

  updateSimResult();
  document.getElementById('simResult').style.display = 'block';
}

function updateSimResult() {
  const orig = gpaDisplay(VIEW);
  const sim  = gpaDisplay(VIEW, simOver);
  const diff = sim - orig;

  document.getElementById('srCurrent').textContent = orig.toFixed(3);
  document.getElementById('srNew').textContent     = sim.toFixed(3);

  const diffEl = document.getElementById('srDiff');
  if (Math.abs(diff) < 0.0005) {
    diffEl.textContent = '±0.000';
    diffEl.className = 'sr-num sr-zero';
  } else if (diff > 0) {
    diffEl.textContent = `+${diff.toFixed(3)}`;
    diffEl.className = 'sr-num sr-pos';
  } else {
    diffEl.textContent = diff.toFixed(3);
    diffEl.className = 'sr-num sr-neg';
  }
}

/* ── Export helpers ────────────────────────────── */
function dlFile(content, name, mime) {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content], { type: mime })),
    download: name
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

function showExpMsg(msg) {
  const el = document.getElementById('expMsg');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3000);
}

function doExportCSV() {
  const rows = [['Semester','Term','Code','Subject','Credit','Grade','GPA4','Rank']];
  for (const c of VIEW) {
    const r = rankInfo(c.grade);
    rows.push([c.semester, c.term, c.code, c.name, c.credit, c.grade.toFixed(1), (c.grade * 0.4).toFixed(2), r.label]);
  }
  const g  = gpa10(VIEW);
  rows.push([]);
  rows.push(['Overall GPA (×10)', g.toFixed(3)]);
  rows.push(['Overall GPA (×4)',  toScale4(g).toFixed(3)]);
  rows.push(['Rank', rankInfo(g).label]);

  dlFile(rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n'),
         'fpt-gpa-report.csv', 'text/csv');
  showExpMsg('✅ CSV exported!');
}

function doExportJSON() {
  const g   = gpa10(VIEW);
  const sems = getSemesters().map(s => {
    const sc = ALL.filter(c => c.semester === s);
    const sg = gpa10(sc);
    return { semester: s, gpa10: +sg.toFixed(3), gpa4: +toScale4(sg).toFixed(3), rank: rankInfo(sg).label, courses: sc.length };
  });
  const payload = {
    exportedAt: new Date().toISOString(),
    note: 'Only TERM > 0 and STATUS=Passed included',
    summary: { gpa10: +g.toFixed(3), gpa4: +toScale4(g).toFixed(3), rank: rankInfo(g).label, totalSubjects: VIEW.length, totalCredits: VIEW.reduce((s,c)=>s+c.credit,0) },
    semesters: sems,
    courses: VIEW.map(c => ({ ...c, gpa4: +(c.grade*0.4).toFixed(2), rank: rankInfo(c.grade).label }))
  };
  dlFile(JSON.stringify(payload, null, 2), 'fpt-gpa-report.json', 'application/json');
  showExpMsg('✅ JSON exported!');
}

function doExportHTML() {
  const g   = gpa10(VIEW);
  const g4  = toScale4(g);
  const r   = rankInfo(g);
  const sems = getSemesters();

  const semRows = sems.map(s => {
    const sc  = ALL.filter(c => c.semester === s);
    const sg  = gpa10(sc);
    const rr  = rankInfo(sg);
    return `<tr><td>${s}</td><td>${sg.toFixed(2)}</td><td>${toScale4(sg).toFixed(2)}</td><td>${rr.label}</td><td>${sc.length}</td><td>${sc.reduce((a,c)=>a+c.credit,0)}</td></tr>`;
  }).join('');

  const courseRows = VIEW.map(c => {
    const rr = rankInfo(c.grade);
    return `<tr><td>${c.semester}</td><td>${c.term}</td><td><code>${c.code}</code></td><td>${c.name}</td><td>${c.credit}</td><td>${c.grade.toFixed(1)}</td><td>${(c.grade*0.4).toFixed(2)}</td><td>${rr.label}</td></tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>GPA Report — FAP GPA Analyzer Pro</title>
<style>
  body{font-family:'Segoe UI',sans-serif;background:#faf8f4;color:#1a1714;margin:0;padding:24px}
  h1{font-size:22px;margin:0 0 4px}
  .sub{color:#8a8278;font-size:13px;margin-bottom:24px}
  .cards{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px}
  .card{background:#fff;border-radius:12px;padding:18px 22px;min-width:130px;box-shadow:0 2px 10px rgba(0,0,0,.07)}
  .cn{font-size:32px;font-weight:800;color:#1a8a7a}
  .cl{font-size:11px;color:#8a8278;margin-top:4px}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.07);margin-bottom:24px}
  th{background:#1a1714;color:#fff;padding:10px 12px;text-align:left;font-size:11px}
  td{padding:8px 12px;border-bottom:1px solid #f3f0ea;font-size:12px}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#faf8f4}
  code{font-family:monospace;background:#f3f0ea;padding:2px 6px;border-radius:4px;font-size:11px}
  h2{font-size:15px;margin:0 0 10px}
  .note{color:#8a8278;font-size:11px;margin-bottom:24px}
  .foot{text-align:center;color:#8a8278;font-size:10px;margin-top:32px}
</style></head><body>
<h1>📊 GPA Analysis Report</h1>
<div class="sub">FPT University · FAP Transcript · Generated ${new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'})}</div>
<div class="note">⚠️ Only subjects with TERM &gt; 0 and STATUS = Passed are included.</div>
<div class="cards">
  <div class="card"><div class="cn">${g.toFixed(2)}</div><div class="cl">GPA (Scale 10)</div></div>
  <div class="card"><div class="cn">${g4.toFixed(2)}</div><div class="cl">GPA (Scale 4)</div></div>
  <div class="card"><div class="cn">${r.label}</div><div class="cl">Academic Rank</div></div>
  <div class="card"><div class="cn">${VIEW.length}</div><div class="cl">Subjects Passed</div></div>
</div>
<h2>Semester Summary</h2>
<table><thead><tr><th>Semester</th><th>GPA ×10</th><th>GPA ×4</th><th>Rank</th><th>Subjects</th><th>Credits</th></tr></thead><tbody>${semRows}</tbody></table>
<h2>Full Course List</h2>
<table><thead><tr><th>Semester</th><th>Term</th><th>Code</th><th>Subject</th><th>Credits</th><th>Grade</th><th>GPA4</th><th>Rank</th></tr></thead><tbody>${courseRows}</tbody></table>
<div class="foot">FAP GPA Analyzer Pro · Not an official document</div>
</body></html>`;

  dlFile(html, 'fpt-gpa-report.html', 'text/html');
  showExpMsg('✅ HTML report exported!');
}

/* ── Full re-render ────────────────────────────── */
function renderAll() {
  VIEW = getView();
  renderHero();
  renderStats();
  renderSuggestions();
  buildSimulator();
}

/* ── No hardcoded demo data ─────────────────────────
   All course data must come from the FAP transcript
   table via the content script.  If no real data is
   available the empty-state screen is shown instead.
   ─────────────────────────────────────────────────── */

/* ── Init ──────────────────────────────────────── */
async function init(forceRefresh) {
  const els = {
    loading: document.getElementById('stateLoading'),
    empty:   document.getElementById('stateEmpty'),
    dash:    document.getElementById('dashboard'),
  };

  Object.values(els).forEach(e => e.style.display = 'none');
  els.loading.style.display = 'flex';

  // On explicit Refresh: wipe the background cache so the live scrape is forced.
  if (forceRefresh) {
    await new Promise(res => {
      chrome.runtime.sendMessage({ type: 'CLEAR' }, () => { void chrome.runtime.lastError; res(); });
    });
  }

  let rawData = null;

  try {
    rawData = await new Promise((res, rej) => {
      chrome.runtime.sendMessage({ type: 'LOAD' }, r => {
        if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
        else res(r);
      });
    });
  } catch (e) {
    console.warn('[FPT GPA] Could not reach background worker:', e);
  }

  els.loading.style.display = 'none';

  // Apply all filter rules here as a safety net even though content.js already filters.
  // This ensures that if any stale/corrupt data slips through the cache it is rejected.
  const courses = (rawData && rawData.ok && rawData.data)
    ? rawData.data.filter(c =>
        c.term > 0 &&                         // TERM > 0 only
        c.status === 'Passed' &&              // Passed only
        typeof c.grade  === 'number' &&       // must have numeric grade
        typeof c.credit === 'number' &&       // must have numeric credit
        c.credit > 0 &&                       // credit must be positive
        c.code                                // subject code must not be blank
      )
    : [];

  if (!courses.length) {
    els.empty.style.display = 'flex';
    return;
  }

  ALL = courses;
  els.dash.style.display = 'flex';

  // Populate semester dropdown -- order preserved from transcript table (top to bottom).
  const semSel = document.getElementById('selSemester');
  semSel.innerHTML = '';
  getSemesters().forEach(s => {
    const o = document.createElement('option');
    o.value = o.textContent = s;
    semSel.appendChild(o);
  });
  activeSem = getSemesters()[0];

  renderAll();
}

/* ── Event wiring ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  init(false);

  // Refresh: bust cache and re-scrape live from the transcript page
  document.getElementById('btnRefresh').addEventListener('click', () => {
    const btn = document.getElementById('btnRefresh');
    btn.classList.add('spin');
    setTimeout(() => btn.classList.remove('spin'), 900);
    init(true);   // forceRefresh = true wipes cache before scraping
  });

  // Mode
  document.getElementById('selMode').addEventListener('change', e => {
    mode = e.target.value;
    document.getElementById('grpSemester').style.display = mode === 'one' ? 'flex' : 'none';
    renderAll();
  });

  // Semester
  document.getElementById('selSemester').addEventListener('change', e => {
    activeSem = e.target.value;
    renderAll();
  });

  // Scale toggle
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      scale = +btn.dataset.scale;
      renderAll();
    });
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`pane-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // Simulator reset
  document.getElementById('simReset').addEventListener('click', buildSimulator);

  // Exports
  document.getElementById('expCsv').addEventListener('click',  doExportCSV);
  document.getElementById('expJson').addEventListener('click', doExportJSON);
  document.getElementById('expHtml').addEventListener('click', doExportHTML);
});
