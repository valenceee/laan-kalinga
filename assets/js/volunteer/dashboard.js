// placeholder
const VOLUNTEER = {
  name: 'Maria Muna',
  id: 'vol1',
};

const TODAY = '2026-06-14';

const VOLUNTEER_VISITS = [
  {
    id: 1,
    date: '2026-06-14',
    time: '10:00 AM',
    seniorName: 'Juan Dela Cruz',
    serviceType: 'Blood Pressure Check',
    address: '123 Sampaguita St., Brgy. Pag-asa',
    status: 'pending',
  },
  {
    id: 2,
    date: '2026-06-15',
    time: '2:00 PM',
    seniorName: 'Maria Santos',
    serviceType: 'Wellness Visit',
    address: '456 Mabini St., Brgy. Pag-asa',
    status: 'pending',
  },
  {
    id: 3,
    date: '2026-06-17',
    time: '9:00 AM',
    seniorName: 'Pedro Reyes',
    serviceType: 'Medicine Pick-up',
    address: '789 Rizal Ave., Brgy. Pag-asa',
    status: 'pending',
  },
];

const FLAGGED_VISITS = [
  {
    id: 1,
    date: 'June 10, 2026',
    seniorName: 'Rosa Mendoza',
    flagReason: 'Requires Doctor / Medical Attention',
    flagStatus: 'unresolved',
  },
];

// state (state = copies the ...XXX and puts it in the variable let. ganyan sa lahat so the js can load it)
let visits = [...VOLUNTEER_VISITS];

// helpers: badge, status select
function buildBadge(status) {
  const span = document.createElement('span');
  span.className = `badge badge--${status}`;
  span.textContent = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  return span;
}

function buildStatusSelect(visitId, currentStatus) {
  const select = document.createElement('select');
  select.className = 'visit-status-select';
  select.dataset.id = visitId;
  select.setAttribute('aria-label', 'Update visit status');

  const options = [
    { value: 'pending',        label: 'Pending' },
    { value: 'completed',      label: 'Completed' },
    { value: 'senior-absent',  label: 'Senior Absent' },
    { value: 'cancelled',      label: 'Cancelled' },
  ];

  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    if (o.value === currentStatus) opt.selected = true;
    select.appendChild(opt);
  });

  return select;
}

function goToVisitLog(id) {
  window.location.href = `visit-log.html?id=${id}`;
}

// render table today and upcoming
function renderToday() {
  const todays = visits.filter(v => v.date === TODAY);
  const tbody = document.getElementById('today-tbody');
  const table = document.getElementById('today-table');
  const empty = document.getElementById('today-empty');

  tbody.innerHTML = '';

  if (todays.length === 0) {
    table.hidden = true;
    empty.hidden = false;
    return;
  }

  table.hidden = false;
  empty.hidden = true;

  todays.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${v.time}</td>
      <td>${v.seniorName}</td>
      <td>${v.serviceType}</td>
      <td>${v.address}</td>
      <td></td>
      <td>
        <button class="btn-view-log" data-id="${v.id}">View & Log Visit</button>
      </td>
    `;
    tr.cells[4].appendChild(buildStatusSelect(v.id, v.status));
    tbody.appendChild(tr);
  });
}

function renderUpcoming() {
  const upcoming = visits.filter(v => v.date > TODAY);
  const tbody = document.getElementById('upcoming-tbody');
  const table = document.getElementById('upcoming-table');
  const empty = document.getElementById('upcoming-empty');

  tbody.innerHTML = '';

  if (upcoming.length === 0) {
    table.hidden = true;
    empty.hidden = false;
    return;
  }

  table.hidden = false;
  empty.hidden = true;

  upcoming.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${v.date}</td>
      <td>${v.time}</td>
      <td>${v.seniorName}</td>
      <td>${v.serviceType}</td>
      <td>${v.address}</td>
      <td>
        <button class="btn-view-log" data-id="${v.id}">View Details</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// render flagged
function renderFlagged() {
  const unresolved = FLAGGED_VISITS.filter(f => f.flagStatus === 'unresolved');
  const tbody = document.getElementById('flagged-tbody');
  const table = document.getElementById('flagged-table');
  const empty = document.getElementById('flagged-empty');

  tbody.innerHTML = '';

  if (unresolved.length === 0) {
    table.hidden = true;
    empty.hidden = false;
    return;
  }

  table.hidden = false;
  empty.hidden = true;

  unresolved.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.date}</td>
      <td>${f.seniorName}</td>
      <td>${f.flagReason}</td>
      <td></td>
    `;
    tr.cells[3].appendChild(buildBadge(f.flagStatus));
    tbody.appendChild(tr);
  });
}

// events
document.addEventListener('click', e => {
  if (e.target.matches('.btn-view-log')) {
    goToVisitLog(Number(e.target.dataset.id));
  }
});

document.addEventListener('change', e => {
  if (!e.target.matches('.visit-status-select')) return;
  const id = Number(e.target.dataset.id);
  const newStatus = e.target.value;
  visits = visits.map(v => v.id === id ? { ...v, status: newStatus } : v);
  // TODO: POST /api/visits/status
});

// init
document.getElementById('welcome-msg').textContent = `Welcome back, ${VOLUNTEER.name}!`;
renderToday();
renderUpcoming();
renderFlagged();