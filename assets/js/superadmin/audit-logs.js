// severity
const SEVERITY_MAP = {
  'login':                      'info',
  'logout':                     'info',
  'account-created':            'info',
  'password-reset':             'warning',
  'account-suspended':          'warning',
  'appointment-force-approved': 'warning',
  'appointment-force-rejected': 'warning',
  'senior-flagged':             'warning',
  'senior-unflagged':           'info',
  'senior-deactivated':         'warning',
  'volunteer-assigned':         'info',
  'announcement-sent':          'info',
  'account-deleted':            'critical',
  'settings-changed':           'critical',
};

// data
const AUDIT_LOGS = [
  {
    id: 1,
    timestamp: '2026-06-15 09:12:44',
    userId: 'SA-001',
    userName: 'Master Administrator',
    role: 'super-admin',
    action: 'settings-changed',
    target: 'Enabled Maintenance Mode',
    ip: '192.168.1.100',
  },
  {
    id: 2,
    timestamp: '2026-06-15 08:45:10',
    userId: 'AD-012',
    userName: 'System Operator',
    role: 'standard-admin',
    action: 'appointment-force-rejected',
    target: 'Booking ID: BK-1055 — Senior: Juan Dela Cruz',
    ip: '192.168.1.104',
  },
  {
    id: 3,
    timestamp: '2026-06-14 16:30:05',
    userId: 'AD-012',
    userName: 'System Operator',
    role: 'standard-admin',
    action: 'senior-flagged',
    target: 'Senior ID: SR-003 (Pedro Reyes) — Medical Concern',
    ip: '192.168.1.104',
  },
  {
    id: 4,
    timestamp: '2026-06-14 14:20:33',
    userId: 'SA-001',
    userName: 'Master Administrator',
    role: 'super-admin',
    action: 'account-deleted',
    target: 'Account ID: AD-010 (Inactive Admin)',
    ip: '192.168.1.100',
  },
  {
    id: 5,
    timestamp: '2026-06-14 11:05:18',
    userId: 'AD-013',
    userName: 'Barangay Officer',
    role: 'standard-admin',
    action: 'volunteer-assigned',
    target: 'Booking ID: BK-1050 — Volunteer: Ana Garcia',
    ip: '192.168.1.110',
  },
  {
    id: 6,
    timestamp: '2026-06-13 10:00:00',
    userId: 'SA-001',
    userName: 'Master Administrator',
    role: 'super-admin',
    action: 'account-created',
    target: 'Account ID: AD-014 (Standard Admin)',
    ip: '192.168.1.100',
  },
  {
    id: 7,
    timestamp: '2026-06-13 08:55:42',
    userId: 'AD-012',
    userName: 'System Operator',
    role: 'standard-admin',
    action: 'login',
    target: 'Successful authentication',
    ip: '192.168.1.104',
  },
  {
    id: 8,
    timestamp: '2026-06-12 17:01:09',
    userId: 'AD-012',
    userName: 'System Operator',
    role: 'standard-admin',
    action: 'logout',
    target: 'Session ended',
    ip: '192.168.1.104',
  },
  {
    id: 9,
    timestamp: '2026-06-12 14:30:15',
    userId: 'AD-012',
    userName: 'System Operator',
    role: 'standard-admin',
    action: 'appointment-force-approved',
    target: 'Booking ID: BK-1052 — Senior: Maria Santos',
    ip: '192.168.1.104',
  },
  {
    id: 10,
    timestamp: '2026-06-11 13:45:00',
    userId: 'SA-001',
    userName: 'Master Administrator',
    role: 'super-admin',
    action: 'announcement-sent',
    target: 'Audience: All Users — Subject: July Vaccination Drive',
    ip: '192.168.1.100',
  },
  {
    id: 11,
    timestamp: '2026-06-11 09:20:55',
    userId: 'AD-013',
    userName: 'Barangay Officer',
    role: 'standard-admin',
    action: 'account-suspended',
    target: 'Account ID: VOL-022 (Luis Torres) — Reason: No-show x3',
    ip: '192.168.1.110',
  },
  {
    id: 12,
    timestamp: '2026-06-10 15:10:30',
    userId: 'SA-001',
    userName: 'Master Administrator',
    role: 'super-admin',
    action: 'password-reset',
    target: 'Account ID: AD-012 (System Operator)',
    ip: '192.168.1.100',
  },
];

const PAGE_SIZE = 10;

// state
let currentPage = 1;
let activeDateFrom = '';
let activeDateTo   = '';
let pendingConfirmAction = null;

// helpers
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3000);
}

function buildBadge(value) {
  const span = document.createElement('span');
  span.className = `badge badge--${value}`;
  span.textContent = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
  return span;
}

function addDt(dl, term, detail) {
  const dt = document.createElement('dt');
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = detail || '—';
  dl.appendChild(dt);
  dl.appendChild(dd);
}

function formatActionLabel(action) {
  return action.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// filter
function getFiltered() {
  const query    = document.getElementById('search-input').value.toLowerCase();
  const role     = document.getElementById('filter-role').value;
  const action   = document.getElementById('filter-action').value;
  const severity = document.getElementById('filter-severity').value;

  return AUDIT_LOGS.filter(log => {
    const matchesSearch   = log.userName.toLowerCase().includes(query) ||
                            log.userId.toLowerCase().includes(query);
    const matchesRole     = role     ? log.role   === role     : true;
    const matchesAction   = action   ? log.action === action   : true;
    const matchesSeverity = severity ? SEVERITY_MAP[log.action] === severity : true;

    let matchesDate = true;
    if (activeDateFrom) matchesDate = matchesDate && log.timestamp >= activeDateFrom;
    if (activeDateTo)   matchesDate = matchesDate && log.timestamp <= activeDateTo + ' 23:59:59';

    return matchesSearch && matchesRole && matchesAction && matchesSeverity && matchesDate;
  });
}

// render
function render() {
  const filtered  = getFiltered();
  const start     = (currentPage - 1) * PAGE_SIZE;
  const paged     = filtered.slice(start, start + PAGE_SIZE);
  const tbody     = document.getElementById('logs-tbody');
  const table     = document.getElementById('logs-table');
  const empty     = document.getElementById('logs-empty');
  const noResults = document.getElementById('logs-no-results');
  const pagination = document.getElementById('pagination');

  tbody.innerHTML = '';

  if (AUDIT_LOGS.length === 0) {
    table.hidden = true; empty.hidden = false; noResults.hidden = true; pagination.hidden = true;
    return;
  }
  if (filtered.length === 0) {
    table.hidden = true; empty.hidden = true; noResults.hidden = false; pagination.hidden = true;
    return;
  }

  empty.hidden = true; noResults.hidden = true;
  table.hidden = false;

  paged.forEach(log => {
    const severity = SEVERITY_MAP[log.action] || 'info';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${log.timestamp}</td>
      <td>${log.userId}<br><small>${log.userName}</small></td>
      <td></td>
      <td>${formatActionLabel(log.action)}</td>
      <td></td>
      <td>${log.target}</td>
      <td>${log.ip}</td>
      <td>
        <button class="btn-view-log btn-secondary" data-id="${log.id}">Details</button>
      </td>
    `;
    tr.cells[2].appendChild(buildBadge(log.role));
    tr.cells[4].appendChild(buildBadge(severity));
    tbody.appendChild(tr);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (totalPages > 1) {
    pagination.hidden = false;
    document.getElementById('pagination-label').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('btn-prev').disabled = currentPage === 1;
    document.getElementById('btn-next').disabled = currentPage === totalPages;
  } else {
    pagination.hidden = true;
  }
}

// data filter
document.getElementById('btn-apply-dates').addEventListener('click', () => {
  const from = document.getElementById('date-from').value;
  const to   = document.getElementById('date-to').value;
  const err  = document.getElementById('error-date-range');

  if (from && to && from > to) {
    err.hidden = false;
    return;
  }
  err.hidden = true;
  activeDateFrom = from;
  activeDateTo   = to;
  currentPage = 1;
  render();
});

document.getElementById('btn-clear-dates').addEventListener('click', () => {
  document.getElementById('date-from').value = '';
  document.getElementById('date-to').value   = '';
  document.getElementById('error-date-range').hidden = true;
  activeDateFrom = '';
  activeDateTo   = '';
  currentPage = 1;
  render();
});

// log details
function openDetailsModal(id) {
  const log = AUDIT_LOGS.find(l => l.id === id);
  if (!log) return;

  const dl = document.getElementById('details-dl');
  dl.innerHTML = '';
  addDt(dl, 'Timestamp',  log.timestamp);
  addDt(dl, 'User ID',    log.userId);
  addDt(dl, 'User Name',  log.userName);
  addDt(dl, 'Role',       log.role.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  addDt(dl, 'Action',     formatActionLabel(log.action));
  addDt(dl, 'Severity',   SEVERITY_MAP[log.action] || 'info');
  addDt(dl, 'Target',     log.target);
  addDt(dl, 'IP Address', log.ip);

  document.getElementById('details-modal').hidden = false;
  document.getElementById('details-close-btn').focus();
}

document.getElementById('details-close-btn').addEventListener('click', () => {
  document.getElementById('details-modal').hidden = true;
});

// export
document.getElementById('btn-export').addEventListener('click', () => {
  const filtered = getFiltered();
  document.getElementById('export-modal-desc').textContent =
    `${filtered.length} log ${filtered.length === 1 ? 'entry' : 'entries'} will be exported based on your current filters.`;
  document.getElementById('export-modal').hidden = false;
});

document.getElementById('export-confirm-btn').addEventListener('click', () => {
  document.getElementById('export-modal').hidden = true;
  // TODO: GET /api/audit-logs/export?filters=...
  showToast('Export started. Your file will download shortly.');
});

document.getElementById('export-cancel-btn').addEventListener('click', () => {
  document.getElementById('export-modal').hidden = true;
});

// confirm
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

// logout
const bannerOffline = document.getElementById('banner-offline');
window.addEventListener('offline', () => { bannerOffline.hidden = false; });
window.addEventListener('online',  () => { bannerOffline.hidden = true; });
if (!navigator.onLine) bannerOffline.hidden = false;

document.getElementById('logout-link').addEventListener('click', e => {
  e.preventDefault();
  window.location.href = '../public/index.html';
});

// event delegation
document.addEventListener('click', e => {
  if (e.target.matches('.btn-view-log')) openDetailsModal(Number(e.target.dataset.id));
});

document.getElementById('btn-retry-load').addEventListener('click', render);
document.getElementById('btn-prev').addEventListener('click', () => { currentPage--; render(); });
document.getElementById('btn-next').addEventListener('click', () => { currentPage++; render(); });

document.getElementById('search-input').addEventListener('input',   () => { currentPage = 1; render(); });
document.getElementById('filter-role').addEventListener('change',   () => { currentPage = 1; render(); });
document.getElementById('filter-action').addEventListener('change', () => { currentPage = 1; render(); });
document.getElementById('filter-severity').addEventListener('change', () => { currentPage = 1; render(); });

// init
render();