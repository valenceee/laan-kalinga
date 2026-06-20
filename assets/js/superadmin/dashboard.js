// data
const DASHBOARD_DATA = {
  stats: {
    today:   45,
    week:    312,
    month:   1204,
    users:   2543,
    admins:  6,
    flagged: 4,
  },
  alerts: [
    { id: 1, type: 'critical', message: '2 admins have not logged in for over 30 days.' },
    { id: 2, type: 'warning',  message: '4 flagged senior cases are unresolved system-wide.' },
    { id: 3, type: 'warning',  message: '3 appointments have been pending for over 7 days with no action.' },
  ],
  recentLogs: [
    { id: 1,  timestamp: '2026-06-15 09:12:44', userId: 'SA-001', userName: 'Master Administrator', action: 'settings-changed',           severity: 'critical', target: 'Enabled Maintenance Mode' },
    { id: 4,  timestamp: '2026-06-14 14:20:33', userId: 'SA-001', userName: 'Master Administrator', action: 'account-deleted',            severity: 'critical', target: 'Account ID: AD-010' },
    { id: 11, timestamp: '2026-06-11 09:20:55', userId: 'AD-013', userName: 'Barangay Officer',     action: 'account-suspended',          severity: 'warning',  target: 'Account ID: VOL-022 (Luis Torres)' },
    { id: 12, timestamp: '2026-06-10 15:10:30', userId: 'SA-001', userName: 'Master Administrator', action: 'password-reset',             severity: 'warning',  target: 'Account ID: AD-012' },
    { id: 2,  timestamp: '2026-06-15 08:45:10', userId: 'AD-012', userName: 'System Operator',      action: 'appointment-force-rejected', severity: 'warning',  target: 'Booking ID: BK-1055' },
  ],
};

// state
let maintenanceOn = false;
let dismissedAlerts = new Set();
let pendingConfirmAction = null;

// offline banner
const bannerOffline = document.getElementById('banner-offline');
window.addEventListener('offline', () => { bannerOffline.hidden = false; });
window.addEventListener('online',  () => { bannerOffline.hidden = true; });
if (!navigator.onLine) bannerOffline.hidden = false;

// logout
document.getElementById('logout-link').addEventListener('click', e => {
  e.preventDefault();
  // FIX: Directed to the updated login.php file
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
function buildBadge(value) {
  const span = document.createElement('span');
  span.className = `badge badge--${value}`;
  span.textContent = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
  return span;
}

function formatActionLabel(action) {
  return action.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// render stats
function renderStats(stats) {
  document.getElementById('stat-today').textContent   = stats.today.toLocaleString();
  document.getElementById('stat-week').textContent    = stats.week.toLocaleString();
  document.getElementById('stat-month').textContent   = stats.month.toLocaleString();
  document.getElementById('stat-users').textContent   = stats.users.toLocaleString();
  document.getElementById('stat-admins').textContent  = stats.admins;
  document.getElementById('stat-flagged').textContent = stats.flagged;
}

// render alerts
function renderAlerts(alerts) {
  const list  = document.getElementById('alerts-list');
  const empty = document.getElementById('alerts-empty');
  list.innerHTML = '';

  const visible = alerts.filter(a => !dismissedAlerts.has(a.id));

  if (visible.length === 0) {
    list.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  list.hidden = false;

  visible.forEach(a => {
    const li = document.createElement('li');
    li.className = `alert-item alert-item--${a.type}`;
    li.innerHTML = `
      <span>${a.message}</span>
      <button type="button" class="btn-dismiss-alert btn-secondary" data-id="${a.id}" aria-label="Dismiss alert">Dismiss</button>
    `;
    list.appendChild(li);
  });
}

// render recent critical logs
function renderLogs(logs) {
  const tbody = document.getElementById('logs-tbody');
  const table = document.getElementById('logs-table');
  const empty = document.getElementById('logs-empty');

  tbody.innerHTML = '';

  if (logs.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  logs.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${log.timestamp}</td>
      <td>${log.userId}<br><small>${log.userName}</small></td>
      <td>${formatActionLabel(log.action)}</td>
      <td></td>
      <td>${log.target}</td>
    `;
    tr.cells[3].appendChild(buildBadge(log.severity));
    tbody.appendChild(tr);
  });
}

function render() {
  renderStats(DASHBOARD_DATA.stats);
  renderAlerts(DASHBOARD_DATA.alerts);
  renderLogs(DASHBOARD_DATA.recentLogs);
}

// force cancel modal
function openForceCancelModal() {
  document.getElementById('booking-id').value    = '';
  document.getElementById('cancel-reason').value = '';
  document.getElementById('error-booking-id').hidden    = true;
  document.getElementById('error-cancel-reason').hidden = true;
  document.getElementById('force-cancel-modal').hidden  = false;
  document.getElementById('booking-id').focus();
}

function closeForceCancelModal() {
  document.getElementById('force-cancel-modal').hidden = true;
}

function confirmForceCancel() {
  const bookingId = document.getElementById('booking-id').value.trim();
  const reason    = document.getElementById('cancel-reason').value.trim();
  let valid = true;

  document.getElementById('error-booking-id').hidden    = !!bookingId;
  document.getElementById('error-cancel-reason').hidden = !!reason;
  if (!bookingId || !reason) valid = false;
  if (!valid) return;

  openConfirmModal(`Force cancel booking "${bookingId}"? This cannot be undone.`, () => {
    closeForceCancelModal();
    showToast(`Booking ${bookingId} force cancelled.`);
    // TODO: POST /api/appointments/force-cancel
  });
}

document.getElementById('btn-force-cancel').addEventListener('click', openForceCancelModal);
document.getElementById('force-cancel-confirm-btn').addEventListener('click', confirmForceCancel);
document.getElementById('force-cancel-close-btn').addEventListener('click', closeForceCancelModal);

// maintenance mode modal
function openMaintenanceModal() {
  const desc = document.getElementById('maintenance-modal-desc');
  desc.textContent = maintenanceOn
    ? 'Maintenance mode is currently ON. Turning it off will restore access for all users.'
    : 'Turning maintenance mode ON will restrict access to super admins only.';
  document.getElementById('maintenance-reason').value = '';
  document.getElementById('error-maintenance-reason').hidden = true;
  document.getElementById('maintenance-modal').hidden = false;
  document.getElementById('maintenance-reason').focus();
}

function closeMaintenanceModal() {
  document.getElementById('maintenance-modal').hidden = true;
}

function confirmMaintenance() {
  const reason = document.getElementById('maintenance-reason').value.trim();
  document.getElementById('error-maintenance-reason').hidden = !!reason;
  if (!reason) return;

  maintenanceOn = !maintenanceOn;
  document.getElementById('banner-maintenance').hidden = !maintenanceOn;
  document.getElementById('btn-toggle-maintenance').textContent = maintenanceOn
    ? 'Disable Maintenance Mode'
    : 'Toggle Maintenance Mode';

  closeMaintenanceModal();
  showToast(`Maintenance mode ${maintenanceOn ? 'enabled' : 'disabled'}.`);
  // TODO: POST /api/system/maintenance
}

document.getElementById('btn-toggle-maintenance').addEventListener('click', openMaintenanceModal);
document.getElementById('maintenance-confirm-btn').addEventListener('click', confirmMaintenance);
document.getElementById('maintenance-cancel-btn').addEventListener('click', closeMaintenanceModal);

// alert dismiss
document.addEventListener('click', e => {
  if (e.target.matches('.btn-dismiss-alert')) {
    dismissedAlerts.add(Number(e.target.dataset.id));
    renderAlerts(DASHBOARD_DATA.alerts);
  }
});

// retry
document.getElementById('btn-retry-load').addEventListener('click', render);

// init
render();