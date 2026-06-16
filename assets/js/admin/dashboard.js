// data
const DASHBOARD_DATA = {
  stats: {
    seniors:      87,
    staff:        42,
    volunteers:  128,
    appointments: 12,
    flagged:       4,
  },
  alerts: [
    { id: 1, type: 'flagged',     message: '2 flagged cases have been unresolved for over 3 days.' },
    { id: 2, type: 'appointment', message: '3 approved appointments have no volunteer assigned past their preferred date.' },
  ],
  recentActivity: [
    { id: 1, user: 'Kier Justine Baldomero', action: 'New Registration',   date: '2026-06-15', status: 'active'    },
    { id: 2, user: 'Katherine Salvacion',    action: 'Appointment Booked', date: '2026-06-15', status: 'pending'   },
    { id: 3, user: 'Carmen Rianna',          action: 'Profile Updated',    date: '2026-06-14', status: 'active'    },
    { id: 4, user: 'Jayson Mendoza',         action: 'Visit Completed',    date: '2026-06-14', status: 'completed' },
  ],
  upcomingEvents: [
    { id: 1, date: '2026-07-01', name: 'Free Flu Vaccination Drive', location: 'Municipal Health Center', target: 'All Seniors' },
    { id: 2, date: '2026-07-15', name: 'Senior Wellness & Zumba',    location: 'Barangay Plaza',          target: 'All Seniors' },
  ],
};

// state
let dismissedAlerts = new Set();
let pendingConfirmAction = null;

// offline banner
const bannerOffline = document.getElementById('banner-offline');
window.addEventListener('offline', () => { bannerOffline.hidden = false; });
window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
if (!navigator.onLine) bannerOffline.hidden = false;

// logout
document.getElementById('logout-link').addEventListener('click', (e) => {
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

function buildBadge(status) {
  const span = document.createElement('span');
  span.className = `badge badge--${status}`;
  span.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  return span;
}


// render stats
function renderStats(stats) {
  document.getElementById('stat-seniors').textContent      = stats.seniors;
  document.getElementById('stat-staff').textContent        = stats.staff;
  document.getElementById('stat-volunteers').textContent   = stats.volunteers;
  document.getElementById('stat-appointments').textContent = stats.appointments;
  document.getElementById('stat-flagged').textContent      = stats.flagged;
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


// render recent activity
function renderActivity(activity) {
  const tbody = document.getElementById('activity-tbody');
  const table = document.getElementById('activity-table');
  const empty = document.getElementById('activity-empty');

  tbody.innerHTML = '';

  if (activity.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  activity.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.user}</td>
      <td>${a.action}</td>
      <td>${formatDate(a.date)}</td>
      <td></td>
    `;
    tr.cells[3].appendChild(buildBadge(a.status));
    tbody.appendChild(tr);
  });
}

function render() {
  renderStats(DASHBOARD_DATA.stats);
  renderAlerts(DASHBOARD_DATA.alerts);
  renderActivity(DASHBOARD_DATA.recentActivity);
}


// announcement modal
function openAnnouncementModal() {
  document.getElementById('announcement-subject').value = '';
  document.getElementById('announcement-body').value    = '';
  document.getElementById('error-announcement-subject').hidden = true;
  document.getElementById('error-announcement-body').hidden    = true;
  document.getElementById('announcement-modal').hidden = false;
  document.getElementById('announcement-subject').focus();
}

function closeAnnouncementModal() {
  document.getElementById('announcement-modal').hidden = true;
}

function sendAnnouncement() {
  const subject = document.getElementById('announcement-subject').value.trim();
  const body    = document.getElementById('announcement-body').value.trim();
  let valid = true;

  document.getElementById('error-announcement-subject').hidden = !!subject;
  document.getElementById('error-announcement-body').hidden    = !!body;
  if (!subject) valid = false;
  if (!body)    valid = false;
  if (!valid) return;

  const audience = document.getElementById('announcement-audience');
  const audienceLabel = audience.options[audience.selectedIndex].text;

  openConfirmModal(`Send "${subject}" to ${audienceLabel}?`, () => {
    closeAnnouncementModal();
    showToast('Announcement sent.');
    // TODO: POST /api/announcements
  });
}


// event listeners
document.getElementById('btn-retry-load').addEventListener('click', render);

document.getElementById('btn-add-senior').addEventListener('click', () => {
  window.location.href = 'seniors.html?action=add';
});
document.getElementById('btn-add-account').addEventListener('click', () => {
  window.location.href = 'accounts.html?action=add';
});

document.addEventListener('click', e => {
  if (e.target.matches('.btn-dismiss-alert')) {
    const id = Number(e.target.dataset.id);
    dismissedAlerts.add(id);
    renderAlerts(DASHBOARD_DATA.alerts);
  }
});


// init
render();