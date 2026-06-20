// data
const VISIT_LOGS = [
  {
    id: 1,
    date: '2026-06-10',
    seniorName: 'Juan Dela Cruz',
    service: 'General Checkup',
    assigned: 'Ana Garcia, Nurse Maria',
    outcome: 'Completed',
  },
  {
    id: 2,
    date: '2026-06-11',
    seniorName: 'Maria Santos',
    service: 'Blood Pressure Check',
    assigned: 'Luis Torres',
    outcome: 'No-show',
  },
  {
    id: 3,
    date: '2026-06-14',
    seniorName: 'Pedro Reyes',
    service: 'Wellness Visit',
    assigned: 'Ana Garcia, Nurse Reyes',
    outcome: 'Completed',
  },
];

const FLAGGED_SUMMARY = [
  { type: 'Resolved',             count: 5  },
  { type: 'Referred to Medical',  count: 3  },
  { type: 'Referred to Admin',    count: 2  },
  { type: 'Pending Review',       count: 2  },
];

const EVENTS = [
  {
    id: 1,
    date: '2026-07-01',
    name: 'Free Flu Vaccination Drive',
    location: 'Municipal Health Center',
    target: 'All Seniors',
  },
  {
    id: 2,
    date: '2026-07-15',
    name: 'Senior Wellness & Zumba',
    location: 'Barangay Plaza',
    target: 'All Seniors',
  },
];

const STATS = {
  completed:       24,
  cancelled:        3,
  seniors:         87,
  flaggedPending:   2,
  flaggedResolved: 10,
};

// state
let pendingConfirmAction = null;
let activeDateFrom = null;
let activeDateTo   = null;

// offline banner
const bannerOffline = document.getElementById('banner-offline');
window.addEventListener('offline', () => { bannerOffline.hidden = false; });
window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
if (!navigator.onLine) bannerOffline.hidden = false;

// logout
document.getElementById('logout-link').addEventListener('click', (e) => {
  e.preventDefault();
  // FIX: Corrected logout routing
  window.location.href = '../public/login.php';
});


// toast
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3000);
}

// confirm modal
function openConfirmModal(message, onConfirm) {
  document.getElementById('confirm-modal-message').textContent = message;
  pendingConfirmAction = onConfirm;
  document.getElementById('confirm-modal').hidden = false;
  document.getElementById('confirm-modal-yes').focus();
}

function closeConfirmModal() {
  pendingConfirmAction = null;
  document.getElementById('confirm-modal').hidden = true;
}

document.getElementById('confirm-modal-yes').addEventListener('click', () => {
  if (pendingConfirmAction) pendingConfirmAction();
  closeConfirmModal();
});
document.getElementById('confirm-modal-no').addEventListener('click', closeConfirmModal);


// helpers
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: '2-digit' });
}

function buildOutcomeBadge(outcome) {
  const span = document.createElement('span');
  const key = outcome.toLowerCase().replace(/[^a-z]/g, '-');
  span.className = `badge badge--${key}`;
  span.textContent = outcome;
  return span;
}

function getFilteredVisits() {
  const query   = document.getElementById('search-visits').value.toLowerCase();
  const service = document.getElementById('filter-service').value;

  return VISIT_LOGS.filter(v => {
    const matchesSearch  = v.seniorName.toLowerCase().includes(query) ||
                           v.assigned.toLowerCase().includes(query);
    const matchesService = service ? v.service === service : true;
    const matchesFrom    = activeDateFrom ? v.date >= activeDateFrom : true;
    const matchesTo      = activeDateTo   ? v.date <= activeDateTo   : true;

    return matchesSearch && matchesService && matchesFrom && matchesTo;
  });
}

// render stats
function renderStats() {
  document.getElementById('stat-completed').textContent      = STATS.completed;
  document.getElementById('stat-cancelled').textContent      = STATS.cancelled;
  document.getElementById('stat-seniors').textContent        = STATS.seniors;
  document.getElementById('stat-flagged-pending').textContent  = STATS.flaggedPending;
  document.getElementById('stat-flagged-resolved').textContent = STATS.flaggedResolved;
}

// render visit logs
function renderVisits() {
  const all      = VISIT_LOGS;
  const filtered = getFilteredVisits();
  const tbody    = document.getElementById('visits-tbody');
  const table    = document.getElementById('visits-table');
  const empty    = document.getElementById('visits-empty');
  const noRes    = document.getElementById('visits-no-results');

  tbody.innerHTML = '';

  if (all.length === 0) {
    table.hidden = true; empty.hidden = false; noRes.hidden = true;
    return;
  }
  empty.hidden = true;

  if (filtered.length === 0) {
    table.hidden = true; noRes.hidden = false;
    return;
  }
  noRes.hidden = true;
  table.hidden = false;

  filtered.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(v.date)}</td>
      <td>${v.seniorName}</td>
      <td>${v.service}</td>
      <td>${v.assigned}</td>
      <td></td>
    `;
    tr.cells[4].appendChild(buildOutcomeBadge(v.outcome));
    tbody.appendChild(tr);
  });
}

// render flagged summary
function renderFlaggedSummary() {
  const tbody = document.getElementById('flagged-summary-tbody');
  const table = document.getElementById('flagged-summary-table');
  const empty = document.getElementById('flagged-summary-empty');

  tbody.innerHTML = '';

  if (FLAGGED_SUMMARY.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  FLAGGED_SUMMARY.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.type}</td><td>${row.count}</td>`;
    tbody.appendChild(tr);
  });
}

// render events (read-only)
function renderEvents() {
  const tbody = document.getElementById('events-tbody');
  const table = document.getElementById('events-table');
  const empty = document.getElementById('events-empty');

  tbody.innerHTML = '';

  if (EVENTS.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  EVENTS.forEach(ev => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(ev.date)}</td>
      <td>${ev.name}</td>
      <td>${ev.location}</td>
      <td>${ev.target}</td>
    `;
    tbody.appendChild(tr);
  });
}


function render() {
  renderStats();
  renderVisits();
  renderFlaggedSummary();
  renderEvents();
  renderCalendar();
}


// export CSV
function exportCSV(rows, filename) {
  if (!rows.length) { showToast('No data to export.'); return; }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new URL(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
  const a = document.createElement('a');
  a.href = blob;
  a.download = filename;
  a.click();

  showToast(`${filename} downloaded.`);
}

function exportVisits() {
  const rows = getFilteredVisits().map(v => ({
    Date: formatDate(v.date),
    'Senior Name': v.seniorName,
    Service: v.service,
    'Assigned To': v.assigned,
    Outcome: v.outcome,
  }));
  openConfirmModal('Download visit logs as CSV?', () => exportCSV(rows, 'visit-logs.csv'));
}

function exportFlagged() {
  const rows = FLAGGED_SUMMARY.map(r => ({
    'Resolution Type': r.type,
    Count: r.count,
  }));
  openConfirmModal('Download flagged cases summary as CSV?', () => exportCSV(rows, 'flagged-summary.csv'));
}

// date filter
function applyFilter() {
  activeDateFrom = document.getElementById('filter-date-from').value || null;
  activeDateTo   = document.getElementById('filter-date-to').value   || null;
  renderVisits();
}

function resetFilter() {
  document.getElementById('filter-date-from').value = '';
  document.getElementById('filter-date-to').value   = '';
  activeDateFrom = null;
  activeDateTo   = null;
  renderVisits();
}

// event listeners
document.getElementById('btn-apply-filter').addEventListener('click', applyFilter);
document.getElementById('btn-reset-filter').addEventListener('click', resetFilter);
document.getElementById('btn-export-visits').addEventListener('click', exportVisits);
document.getElementById('btn-export-flagged').addEventListener('click', exportFlagged);
document.getElementById('btn-retry-load').addEventListener('click', render);
document.getElementById('search-visits').addEventListener('input', renderVisits);
document.getElementById('filter-service').addEventListener('change', renderVisits);

// calendar
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed
let calSelectedDate = null;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCalData(dateStr) {
  // dateStr: 'YYYY-MM-DD'
  return {
    visits: VISIT_LOGS.filter(v => v.date === dateStr),
    events: EVENTS.filter(e => e.date === dateStr),
  };
}

function renderCalendar() {
  const grid    = document.getElementById('cal-grid');
  const heading = document.getElementById('cal-heading');
  grid.innerHTML = '';

  const label = new Date(calYear, calMonth, 1)
    .toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  heading.textContent = label;

  // weekday headers
  WEEKDAYS.forEach(d => {
    const cell = document.createElement('div');
    cell.className = 'cal__weekday';
    cell.textContent = d;
    grid.appendChild(cell);
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  // empty leading cells
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal__day cal__day--empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const mm      = String(calMonth + 1).padStart(2, '0');
    const dd      = String(d).padStart(2, '0');
    const dateStr = `${calYear}-${mm}-${dd}`;
    const data    = getCalData(dateStr);

    const cell = document.createElement('div');
    cell.className = 'cal__day';
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', dateStr);
    cell.dataset.date = dateStr;

    if (dateStr === todayStr)        cell.classList.add('cal__day--today');
    if (dateStr === calSelectedDate) cell.classList.add('cal__day--selected');

    const num = document.createElement('span');
    num.textContent = d;
    cell.appendChild(num);

    if (data.visits.length || data.events.length) {
      const dots = document.createElement('div');
      dots.className = 'cal__dots';
      if (data.visits.length) {
        const dot = document.createElement('span');
        dot.className = 'cal__dot cal__dot--visit';
        dot.title = `${data.visits.length} visit(s)`;
        dots.appendChild(dot);
      }
      if (data.events.length) {
        const dot = document.createElement('span');
        dot.className = 'cal__dot cal__dot--event';
        dot.title = `${data.events.length} event(s)`;
        dots.appendChild(dot);
      }
      cell.appendChild(dots);
    }

    cell.addEventListener('click', () => selectCalDate(dateStr));
    cell.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCalDate(dateStr); }
    });
    grid.appendChild(cell);
  }
}

function selectCalDate(dateStr) {
  calSelectedDate = dateStr;
  renderCalendar();
  renderCalDetail(dateStr);
}

function renderCalDetail(dateStr) {
  const detail  = document.getElementById('cal-detail');
  const heading = document.getElementById('cal-detail-date');
  const body    = document.getElementById('cal-detail-body');
  const data    = getCalData(dateStr);

  heading.textContent = formatDate(dateStr);
  body.innerHTML = '';

  if (!data.visits.length && !data.events.length) {
    body.innerHTML = '<p>No visits or events on this day.</p>';
    detail.hidden = false;
    return;
  }

  if (data.visits.length) {
    const label = document.createElement('p');
    label.className = 'detail-type';
    label.textContent = 'Visits';
    body.appendChild(label);
    data.visits.forEach(v => {
      const p = document.createElement('p');
      p.textContent = `${v.seniorName} — ${v.service} (${v.outcome})`;
      body.appendChild(p);
    });
  }

  if (data.events.length) {
    const label = document.createElement('p');
    label.className = 'detail-type';
    label.textContent = 'Events';
    body.appendChild(label);
    data.events.forEach(ev => {
      const p = document.createElement('p');
      p.textContent = `${ev.name} @ ${ev.location}`;
      body.appendChild(p);
    });
  }

  detail.hidden = false;
}

document.getElementById('cal-prev').addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});

document.getElementById('cal-next').addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

document.getElementById('cal-detail-close').addEventListener('click', () => {
  calSelectedDate = null;
  document.getElementById('cal-detail').hidden = true;
  renderCalendar();
});

// init
render();