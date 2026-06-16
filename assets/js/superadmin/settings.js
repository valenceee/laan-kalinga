// placeholder data
// replace with fetch() when PHP is ready
const SETTINGS_DATA = {
  siteName:       'LaanKalinga',
  maxBookings:    200,
  maintenanceOn:  false,
  lastBackup:     '2026-06-14 02:00:00',
  notifications: {
    appointmentReminder: true,
    flaggedAlert:        true,
    newRegistration:     false,
    unresolvedFlags:     true,
  },
};

// state
let maintenanceOn = SETTINGS_DATA.maintenanceOn;
let pendingConfirmAction = null;
let pendingExportType = null;

// offline
const bannerOffline = document.getElementById('banner-offline');
window.addEventListener('offline', () => { bannerOffline.hidden = false; });
window.addEventListener('online',  () => { bannerOffline.hidden = true; });
if (!navigator.onLine) bannerOffline.hidden = false;

// logout
document.getElementById('logout-link').addEventListener('click', e => {
  e.preventDefault();
  window.location.href = '../public/login.html';
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

// load saved settings into form
function loadSettings() {
  document.getElementById('site-name').value    = SETTINGS_DATA.siteName;
  document.getElementById('max-bookings').value = SETTINGS_DATA.maxBookings;
  document.getElementById('last-backup-date').textContent = SETTINGS_DATA.lastBackup;

  document.getElementById('notif-appointment-reminder').checked = SETTINGS_DATA.notifications.appointmentReminder;
  document.getElementById('notif-flagged-alert').checked        = SETTINGS_DATA.notifications.flaggedAlert;
  document.getElementById('notif-new-registration').checked     = SETTINGS_DATA.notifications.newRegistration;
  document.getElementById('notif-unresolved-flags').checked     = SETTINGS_DATA.notifications.unresolvedFlags;

  syncMaintenanceUI();
}

// sync maintenance UI state
function syncMaintenanceUI() {
  document.getElementById('maintenance-status-text').textContent = maintenanceOn ? 'On' : 'Off';
  document.getElementById('btn-toggle-maintenance').textContent  = maintenanceOn
    ? 'Disable Maintenance Mode'
    : 'Enable Maintenance Mode';
  document.getElementById('banner-maintenance').hidden = !maintenanceOn;
}

// platform settings save
document.getElementById('btn-save-platform').addEventListener('click', () => {
  const siteName   = document.getElementById('site-name').value.trim();
  const maxBookings = parseInt(document.getElementById('max-bookings').value, 10);
  let valid = true;

  document.getElementById('error-site-name').hidden = !!siteName;
  if (!siteName) { document.getElementById('site-name').classList.add('field--invalid'); valid = false; }
  else document.getElementById('site-name').classList.remove('field--invalid');

  const maxOk = !isNaN(maxBookings) && maxBookings >= 10;
  document.getElementById('error-max-bookings').hidden = maxOk;
  if (!maxOk) { document.getElementById('max-bookings').classList.add('field--invalid'); valid = false; }
  else document.getElementById('max-bookings').classList.remove('field--invalid');

  if (!valid) return;

  openConfirmModal('Save platform settings? This will be logged in the audit trail.', () => {
    SETTINGS_DATA.siteName    = siteName;
    SETTINGS_DATA.maxBookings = maxBookings;
    showToast('Platform settings saved.');
    // TODO: POST /api/settings/platform
  });
});

// maintenance modal
function openMaintenanceModal() {
  document.getElementById('maintenance-modal-desc').textContent = maintenanceOn
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
  syncMaintenanceUI();
  closeMaintenanceModal();
  showToast(`Maintenance mode ${maintenanceOn ? 'enabled' : 'disabled'}.`);
  // TODO: POST /api/system/maintenance
}

document.getElementById('btn-toggle-maintenance').addEventListener('click', openMaintenanceModal);
document.getElementById('maintenance-confirm-btn').addEventListener('click', confirmMaintenance);
document.getElementById('maintenance-cancel-btn').addEventListener('click', closeMaintenanceModal);

// database backup
document.getElementById('btn-backup').addEventListener('click', () => {
  openConfirmModal('Generate a manual database backup now?', () => {
    showToast('Backup started. This may take a moment.');
    // TODO: POST /api/database/backup
  });
});

// restore from backup
document.getElementById('btn-restore').addEventListener('click', () => {
  const group = document.getElementById('restore-upload-group');
  group.hidden = !group.hidden;
  if (!group.hidden) document.getElementById('restore-file').focus();
});

document.getElementById('btn-restore-cancel').addEventListener('click', () => {
  document.getElementById('restore-upload-group').hidden = true;
  document.getElementById('restore-file').value = '';
  document.getElementById('error-restore-file').hidden = true;
});

document.getElementById('btn-restore-confirm').addEventListener('click', () => {
  const file = document.getElementById('restore-file');
  document.getElementById('error-restore-file').hidden = !!file.files.length;
  if (!file.files.length) return;

  openConfirmModal('Restore from this backup? This will overwrite current data and cannot be undone.', () => {
    document.getElementById('restore-upload-group').hidden = true;
    showToast('Restore started. Do not close the browser.');
    // TODO: POST /api/database/restore
  });
});

// clear cache
document.getElementById('btn-clear-cache').addEventListener('click', () => {
  openConfirmModal('Clear the application cache? Users may experience a brief slowdown.', () => {
    showToast('Cache cleared.');
    // TODO: POST /api/system/clear-cache
  });
});

// export
function openExportModal(type) {
  pendingExportType = type;
  const label = type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  document.getElementById('export-modal-desc').textContent =
    `All ${label} records will be exported as a CSV file.`;
  document.getElementById('export-modal').hidden = false;
}

document.getElementById('export-confirm-btn').addEventListener('click', () => {
  document.getElementById('export-modal').hidden = true;
  showToast(`Exporting ${pendingExportType}. Your file will download shortly.`);
  pendingExportType = null;
  // TODO: GET /api/export/:type
});

document.getElementById('export-cancel-btn').addEventListener('click', () => {
  document.getElementById('export-modal').hidden = true;
  pendingExportType = null;
});

document.querySelectorAll('.btn-export').forEach(btn => {
  btn.addEventListener('click', () => openExportModal(btn.dataset.type));
});

// notification settings save
document.getElementById('btn-save-notifications').addEventListener('click', () => {
  openConfirmModal('Save notification settings?', () => {
    SETTINGS_DATA.notifications.appointmentReminder = document.getElementById('notif-appointment-reminder').checked;
    SETTINGS_DATA.notifications.flaggedAlert        = document.getElementById('notif-flagged-alert').checked;
    SETTINGS_DATA.notifications.newRegistration     = document.getElementById('notif-new-registration').checked;
    SETTINGS_DATA.notifications.unresolvedFlags     = document.getElementById('notif-unresolved-flags').checked;
    showToast('Notification settings saved.');
    // TODO: POST /api/settings/notifications
  });
});

// retry
document.getElementById('btn-retry-load').addEventListener('click', loadSettings);

// init
loadSettings();