// data
const VISIT_LOGS = [
  {
    id: 1,
    date: '2026-06-10',
    seniorName: 'Juan Dela Cruz',
    barangay: 'Bagong Pag-Asa',
    service: 'General Checkup',
    assigned: 'Ana Garcia, Nurse Maria',
    outcome: 'Completed',
  },
  {
    id: 2,
    date: '2026-06-11',
    seniorName: 'Maria Santos',
    barangay: 'Batasan Hills',
    service: 'Blood Pressure Check',
    assigned: 'Luis Torres',
    outcome: 'No-show',
  },
  {
    id: 3,
    date: '2026-06-14',
    seniorName: 'Pedro Reyes',
    barangay: 'Commonwealth',
    service: 'Wellness Visit',
    assigned: 'Ana Garcia, Nurse Reyes',
    outcome: 'Completed',
  },
];

const FLAGGED_CASES = [
  {
    id: 1,
    seniorName: 'Rosa Mendoza',
    barangay: 'Batasan Hills',
    flagType: 'philsys-pending',
    flaggedBy: 'Staff Reyes',
    dateFlagged: '2026-06-01',
    status: 'pending',
  },
  {
    id: 2,
    seniorName: 'Pedro Reyes',
    barangay: 'Commonwealth',
    flagType: 'medical-concern',
    flaggedBy: 'Volunteer Ana Garcia',
    dateFlagged: '2026-06-14',
    status: 'pending',
  },
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
  completed: 24,
  cancelled: 3,
  seniors: 87,
  seniorsWithVisit: 61,
  flaggedPending: 2,
  flaggedResolved: 10,
};

const BARANGAY_DATA = [
  { barangay: 'Bagong Pag-Asa', seniors: 12, visits: 10, flagged: 1 },
  { barangay: 'Batasan Hills',  seniors: 18, visits: 14, flagged: 2 },
  { barangay: 'Commonwealth',   seniors: 15, visits: 11, flagged: 1 },
];

const qcBarangays = [
  'Alicia', 'Amihan', 'Apolonio Samson', 'Aurora', 'Baesa', 'Bagbag',
  'Bagong Buhay', 'Bagong Pag-Asa', 'Bagong Silangan', 'Bagong Silang',
  'Bagumbayan', 'Bagumbuhay', 'Bahay Toro', 'Balingasa', 'Balintawak',
  'Batasan Hills', 'Bayanihan', 'Blue Ridge A', 'Blue Ridge B',
  'Botocan', 'Bungad', 'Camp Aguinaldo', 'Capri', 'Central',
  'Claro', 'Commonwealth', 'Culiat', 'Damar', 'Damayan',
  'Damayan Lagi', 'Dangwa', 'Del Monte', 'Dioquino Zobel',
  'Don Manuel', 'Doña Aurora', 'Doña Imelda', 'Doña Josefa',
  'Duyan-Duyan', 'E. Rodriguez', 'East Kamias', 'Escopa I',
  'Escopa II', 'Escopa III', 'Escopa IV', 'Fairview', 'Greater Lagro',
  'Gulod', 'Holy Spirit', 'Horseshoe', 'Immaculate Concepcion',
  'Kaligayahan', 'Kalusugan', 'Kamuning', 'Katipunan', 'Kaunlaran',
  'Kristong Hari', 'Krus na Ligas', 'Laging Handa', 'Libis',
  'Lourdes', 'Loyola Heights', 'Lucban', 'Luzviminda',
  'Maharlika', 'Malaya', 'Mangga', 'Manresa', 'Mariana',
  'Mariblo', 'Marilag', 'Masagana', 'Masambong', 'Matandang Balara',
  'Milagrosa', 'Model', 'Nagkaisang Nayon', 'Nayong Kanluran',
  'New Era', 'North Fairview', 'Novaliches Proper', 'Obrero',
  'Old Capitol Site', 'Paang Bundok', 'Pag-Ibig sa Nayon',
  'Paligsahan', 'Paltok', 'Pansol', 'Paraiso', 'Pasong Putik Proper',
  'Pasong Tamo', 'Payatas', 'Phil-Am', 'Pinagkaisahan', 'Pinyahan',
  'Pitogo', 'Plaridel', 'Poblacion', 'Project 6', 'Pugad Lawin',
  'Quezon City Proper', 'Quirino 2-A', 'Quirino 2-B', 'Quirino 2-C',
  'Quirino 3-A', 'Ramon Magsaysay', 'Roxas', 'Sacred Heart',
  'Saint Ignatius', 'Saint Peter', 'Salvacion', 'San Agustin',
  'San Antonio', 'San Bartolome', 'San Isidro', 'San Isidro Labrador',
  'San Jose', 'San Martin de Porres', 'San Roque', 'San Vicente',
  'Sangandaan', 'Santa Cruz', 'Santa Lucia', 'Santa Monica',
  'Santa Teresita', 'Santo Cristo', 'Santo Niño', 'Santol',
  'Sauyo', 'Siena', 'Sikatuna Village', 'Silangan', 'Socorro',
  'South Triangle', 'Tagumpay', 'Talayan', 'Talipapa',
  'Tandang Sora', 'Tatalon', 'Teacher\'s Village East',
  'Teacher\'s Village West', 'Ugong Norte', 'Unang Sigaw',
  'UP Campus', 'UP Village', 'Vasra', 'Veterans Village',
  'Villa Maria Clara', 'West Kamias', 'West Triangle', 'White Plains'
];

// state
let events = [...EVENTS];
let flaggedCases = [...FLAGGED_CASES];
let pendingConfirmAction = null;
let activeDateFrom = null;
let activeDateTo = null;
let activeBarangay = '';
let editingEventId = null;
let actingFlagId = null;
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();
let calSelectedDate = null;

// offline banner
const bannerOffline = document.getElementById('banner-offline');
window.addEventListener('offline', () => { bannerOffline.hidden = false; });
window.addEventListener('online',  () => { bannerOffline.hidden = true; });
if (!navigator.onLine) bannerOffline.hidden = false;

// logout
document.getElementById('logout-link').addEventListener('click', e => {
  e.preventDefault();
  window.location.href = '../public/index.html';
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

function buildBadge(text, modifier) {
  const span = document.createElement('span');
  span.className = `badge badge--${modifier}`;
  span.textContent = text;
  return span;
}

// barangay filter options
function populateBarangayFilter() {
  const select = document.getElementById('filter-barangay');
  qcBarangays.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    select.appendChild(opt);
  });
}

// filtered visit logs
function getFilteredVisits() {
  const query   = document.getElementById('search-visits').value.toLowerCase();
  const service = document.getElementById('filter-service').value;

  return VISIT_LOGS.filter(v => {
    const matchesSearch   = v.seniorName.toLowerCase().includes(query) || v.assigned.toLowerCase().includes(query);
    const matchesService  = service ? v.service === service : true;
    const matchesBarangay = activeBarangay ? v.barangay === activeBarangay : true;
    const matchesFrom     = activeDateFrom ? v.date >= activeDateFrom : true;
    const matchesTo       = activeDateTo   ? v.date <= activeDateTo   : true;
    return matchesSearch && matchesService && matchesBarangay && matchesFrom && matchesTo;
  });
}

// render stats
function renderStats() {
  const coverage = STATS.seniors
    ? Math.round((STATS.seniorsWithVisit / STATS.seniors) * 100) + '%'
    : '0%';
  document.getElementById('stat-completed').textContent       = STATS.completed;
  document.getElementById('stat-cancelled').textContent       = STATS.cancelled;
  document.getElementById('stat-seniors').textContent         = STATS.seniors;
  document.getElementById('stat-coverage').textContent        = coverage;
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
      <td>${v.barangay}</td>
      <td>${v.service}</td>
      <td>${v.assigned}</td>
      <td></td>
    `;
    const key = v.outcome.toLowerCase().replace(/[^a-z]/g, '-');
    tr.cells[5].appendChild(buildBadge(v.outcome, key));
    tbody.appendChild(tr);
  });
}

// render volunteer performance derived from visit logs
function renderVolunteers() {
  const tbody = document.getElementById('volunteers-tbody');
  const table = document.getElementById('volunteers-table');
  const empty = document.getElementById('volunteers-empty');

  tbody.innerHTML = '';

  // aggregate per assigned name (split comma-separated)
  const map = {};
  VISIT_LOGS.forEach(v => {
    v.assigned.split(',').map(a => a.trim()).forEach(name => {
      if (!map[name]) map[name] = { assigned: 0, completed: 0, noshow: 0 };
      map[name].assigned++;
      if (v.outcome === 'Completed') map[name].completed++;
      if (v.outcome === 'No-show')   map[name].noshow++;
    });
  });

  const rows = Object.entries(map);
  if (rows.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  rows.forEach(([name, d]) => {
    const rate = d.assigned ? Math.round((d.completed / d.assigned) * 100) + '%' : '0%';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${name}</td>
      <td>${d.assigned}</td>
      <td>${d.completed}</td>
      <td>${d.noshow}</td>
      <td>${rate}</td>
    `;
    tbody.appendChild(tr);
  });
}

// render barangay breakdown
function renderBarangay() {
  const tbody = document.getElementById('barangay-tbody');
  const table = document.getElementById('barangay-table');
  const empty = document.getElementById('barangay-empty');

  tbody.innerHTML = '';

  const data = activeBarangay
    ? BARANGAY_DATA.filter(b => b.barangay === activeBarangay)
    : BARANGAY_DATA;

  if (data.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  data.forEach(b => {
    const coverage = b.seniors ? Math.round((b.visits / b.seniors) * 100) + '%' : '0%';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.barangay}</td>
      <td>${b.seniors}</td>
      <td>${b.visits}</td>
      <td>${b.flagged}</td>
      <td>${coverage}</td>
    `;
    tbody.appendChild(tr);
  });
}

// render flagged cases
function renderFlagged() {
  const tbody = document.getElementById('flagged-tbody');
  const table = document.getElementById('flagged-table');
  const empty = document.getElementById('flagged-empty');

  tbody.innerHTML = '';

  const data = activeBarangay
    ? flaggedCases.filter(f => f.barangay === activeBarangay)
    : flaggedCases;

  if (data.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  data.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.seniorName}</td>
      <td>${f.barangay}</td>
      <td>${f.flagType.replace(/-/g, ' ')}</td>
      <td>${f.flaggedBy}</td>
      <td>${formatDate(f.dateFlagged)}</td>
      <td></td>
      <td>
        <button class="btn-flag-action btn-secondary" data-id="${f.id}">Update</button>
      </td>
    `;
    tr.cells[5].appendChild(buildBadge(f.status, f.status));
    tbody.appendChild(tr);
  });
}

// render events
function renderEvents() {
  const tbody = document.getElementById('events-tbody');
  const table = document.getElementById('events-table');
  const empty = document.getElementById('events-empty');

  tbody.innerHTML = '';

  if (events.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  events.forEach(ev => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(ev.date)}</td>
      <td>${ev.name}</td>
      <td>${ev.location}</td>
      <td>${ev.target}</td>
      <td>
        <button class="btn-edit-event btn-secondary" data-id="${ev.id}">Edit</button>
        <button class="btn-delete-event btn-secondary" data-id="${ev.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// event modal
function clearEventModal() {
  ['event-date', 'event-name', 'event-location', 'event-target'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['error-event-date', 'error-event-name', 'error-event-location', 'error-event-target'].forEach(id => {
    document.getElementById(id).hidden = true;
  });
}

function openAddEventModal() {
  editingEventId = null;
  clearEventModal();
  document.getElementById('event-modal-title').textContent = 'Add Event';
  document.getElementById('event-modal').hidden = false;
  document.getElementById('event-date').focus();
}

function openEditEventModal(id) {
  const ev = events.find(e => e.id === id);
  if (!ev) return;
  editingEventId = id;
  clearEventModal();
  document.getElementById('event-modal-title').textContent = 'Edit Event';
  document.getElementById('event-date').value     = ev.date;
  document.getElementById('event-name').value     = ev.name;
  document.getElementById('event-location').value = ev.location;
  document.getElementById('event-target').value   = ev.target;
  document.getElementById('event-modal').hidden = false;
  document.getElementById('event-date').focus();
}

function closeEventModal() {
  document.getElementById('event-modal').hidden = true;
  editingEventId = null;
}

function saveEvent() {
  const fields = [
    ['event-date',     'error-event-date',     v => !!v],
    ['event-name',     'error-event-name',     v => !!v],
    ['event-location', 'error-event-location', v => !!v],
    ['event-target',   'error-event-target',   v => !!v],
  ];

  let valid = true;
  fields.forEach(([fieldId, errorId, check]) => {
    const el = document.getElementById(fieldId);
    const ok = check(el.value.trim());
    document.getElementById(errorId).hidden = ok;
    if (!ok) { el.classList.add('field--invalid'); valid = false; }
    else el.classList.remove('field--invalid');
  });
  if (!valid) return;

  const data = {
    date:     document.getElementById('event-date').value,
    name:     document.getElementById('event-name').value.trim(),
    location: document.getElementById('event-location').value.trim(),
    target:   document.getElementById('event-target').value.trim(),
  };

  if (editingEventId) {
    events = events.map(e => e.id === editingEventId ? { ...e, ...data } : e);
    showToast('Event updated.');
    // TODO: PUT /api/events/:id
  } else {
    const newId = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
    events.push({ id: newId, ...data });
    showToast('Event added.');
    // TODO: POST /api/events
  }

  closeEventModal();
  renderEvents();
  renderCalendar();
}

document.getElementById('event-save-btn').addEventListener('click', saveEvent);
document.getElementById('event-cancel-btn').addEventListener('click', closeEventModal);
document.getElementById('btn-add-event').addEventListener('click', openAddEventModal);

// flag action modal
function openFlagActionModal(id) {
  const f = flaggedCases.find(x => x.id === id);
  if (!f) return;
  actingFlagId = id;
  document.getElementById('flag-action-senior-name').textContent = f.seniorName;
  document.getElementById('flag-action-status').value = '';
  document.getElementById('flag-action-notes').value  = '';
  document.getElementById('error-flag-action-status').hidden = true;
  document.getElementById('error-flag-action-notes').hidden  = true;
  document.getElementById('flag-action-modal').hidden = false;
  document.getElementById('flag-action-status').focus();
}

function closeFlagActionModal() {
  document.getElementById('flag-action-modal').hidden = true;
  actingFlagId = null;
}

function saveFlagAction() {
  const status = document.getElementById('flag-action-status').value;
  const notes  = document.getElementById('flag-action-notes').value.trim();
  let valid = true;

  document.getElementById('error-flag-action-status').hidden = !!status;
  document.getElementById('error-flag-action-notes').hidden  = !!notes;
  if (!status || !notes) valid = false;
  if (!valid) return;

  flaggedCases = flaggedCases.map(f =>
    f.id === actingFlagId ? { ...f, status } : f
  );
  closeFlagActionModal();
  renderFlagged();
  showToast('Flagged case updated.');
  // TODO: PATCH /api/flagged/:id
}

document.getElementById('flag-action-save-btn').addEventListener('click', saveFlagAction);
document.getElementById('flag-action-cancel-btn').addEventListener('click', closeFlagActionModal);

// event delegation for table buttons
document.addEventListener('click', e => {
  if (e.target.matches('.btn-edit-event'))
    openEditEventModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-delete-event')) {
    const id = Number(e.target.dataset.id);
    const ev = events.find(x => x.id === id);
    openConfirmModal(`Delete "${ev.name}"?`, () => {
      events = events.filter(x => x.id !== id);
      renderEvents();
      renderCalendar();
      showToast('Event deleted.');
      // TODO: DELETE /api/events/:id
    });
  }
  if (e.target.matches('.btn-flag-action'))
    openFlagActionModal(Number(e.target.dataset.id));
});

// export csv
function exportCSV(rows, filename) {
  if (!rows.length) { showToast('No data to export.'); return; }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const a = document.createElement('a');
  a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  a.download = filename;
  a.click();
  showToast(`${filename} downloaded.`);
}

function exportVisits() {
  const rows = getFilteredVisits().map(v => ({
    Date: formatDate(v.date),
    'Senior Name': v.seniorName,
    Barangay: v.barangay,
    Service: v.service,
    'Assigned To': v.assigned,
    Outcome: v.outcome,
  }));
  openConfirmModal('Download visit logs as CSV?', () => exportCSV(rows, 'visit-logs.csv'));
}

function exportVolunteers() {
  const map = {};
  VISIT_LOGS.forEach(v => {
    v.assigned.split(',').map(a => a.trim()).forEach(name => {
      if (!map[name]) map[name] = { assigned: 0, completed: 0, noshow: 0 };
      map[name].assigned++;
      if (v.outcome === 'Completed') map[name].completed++;
      if (v.outcome === 'No-show')   map[name].noshow++;
    });
  });
  const rows = Object.entries(map).map(([name, d]) => ({
    'Volunteer / Staff': name,
    'Visits Assigned': d.assigned,
    Completed: d.completed,
    'No-shows': d.noshow,
    'Completion Rate': d.assigned ? Math.round((d.completed / d.assigned) * 100) + '%' : '0%',
  }));
  openConfirmModal('Download volunteer performance as CSV?', () => exportCSV(rows, 'volunteer-performance.csv'));
}

function exportBarangay() {
  const rows = BARANGAY_DATA.map(b => ({
    Barangay: b.barangay,
    'Active Seniors': b.seniors,
    Visits: b.visits,
    'Flagged Cases': b.flagged,
    'Coverage Rate': b.seniors ? Math.round((b.visits / b.seniors) * 100) + '%' : '0%',
  }));
  openConfirmModal('Download barangay breakdown as CSV?', () => exportCSV(rows, 'barangay-breakdown.csv'));
}

function exportFlagged() {
  const rows = flaggedCases.map(f => ({
    'Senior Name': f.seniorName,
    Barangay: f.barangay,
    'Flag Type': f.flagType.replace(/-/g, ' '),
    'Flagged By': f.flaggedBy,
    'Date Flagged': formatDate(f.dateFlagged),
    Status: f.status,
  }));
  openConfirmModal('Download flagged cases as CSV?', () => exportCSV(rows, 'flagged-cases.csv'));
}

document.getElementById('btn-export-visits').addEventListener('click', exportVisits);
document.getElementById('btn-export-volunteers').addEventListener('click', exportVolunteers);
document.getElementById('btn-export-barangay').addEventListener('click', exportBarangay);
document.getElementById('btn-export-flagged').addEventListener('click', exportFlagged);

// date and barangay filters
function applyFilter() {
  activeDateFrom  = document.getElementById('filter-date-from').value || null;
  activeDateTo    = document.getElementById('filter-date-to').value   || null;
  activeBarangay  = document.getElementById('filter-barangay').value;
  render();
}

function resetFilter() {
  document.getElementById('filter-date-from').value = '';
  document.getElementById('filter-date-to').value   = '';
  document.getElementById('filter-barangay').value  = '';
  activeDateFrom = null;
  activeDateTo   = null;
  activeBarangay = '';
  render();
}

document.getElementById('btn-apply-filter').addEventListener('click', applyFilter);
document.getElementById('btn-reset-filter').addEventListener('click', resetFilter);
document.getElementById('search-visits').addEventListener('input', renderVisits);
document.getElementById('filter-service').addEventListener('change', renderVisits);
document.getElementById('btn-retry-load').addEventListener('click', render);

// calendar
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCalData(dateStr) {
  return {
    visits: VISIT_LOGS.filter(v => v.date === dateStr),
    events: events.filter(e => e.date === dateStr),
  };
}

function renderCalendar() {
  const grid    = document.getElementById('cal-grid');
  const heading = document.getElementById('cal-heading');
  grid.innerHTML = '';

  heading.textContent = new Date(calYear, calMonth, 1)
    .toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

  WEEKDAYS.forEach(d => {
    const cell = document.createElement('div');
    cell.className = 'cal__weekday';
    cell.textContent = d;
    grid.appendChild(cell);
  });

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr    = new Date().toISOString().slice(0, 10);

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

// render all
function render() {
  renderStats();
  renderVisits();
  renderVolunteers();
  renderBarangay();
  renderFlagged();
  renderEvents();
  renderCalendar();
}

// init
populateBarangayFilter();
render();