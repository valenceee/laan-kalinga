// plcholder
const VISITS_DB = [
  {
    id: 1,
    date: '2026-06-14',
    time: '10:00 AM',
    serviceType: 'Blood Pressure Check',
    seniorId: 101,
  },
  {
    id: 2,
    date: '2026-06-15',
    time: '2:00 PM',
    serviceType: 'Wellness Visit',
    seniorId: 102,
  },
];

const SENIORS_DB = [
  {
    id: 101,
    name: 'Juan Dela Cruz',
    address: '123 Sampaguita St., Brgy. Pag-asa, Quezon City',
    emergencyContact: 'Maria Dela Cruz — 0917 111 2222',
    conditions: 'Hypertension, Type 2 Diabetes',
    mobility: 'Cane / Baston',
    instructions: 'Needs help organizing daily medication and reading labels.',
  },
  {
    id: 102,
    name: 'Maria Santos',
    address: '456 Mabini St., Brgy. Pag-asa, Quezon City',
    emergencyContact: 'Jose Santos — 0920 333 4444',
    conditions: 'Arthritis',
    mobility: 'None',
    instructions: 'Speaks Bisaya, needs translation assistance.',
  },
];

// FIX: Added missing offline/online network listener boilerplate
const bannerOffline = document.getElementById('banner-offline');
if (bannerOffline) {
  window.addEventListener('offline', () => { bannerOffline.hidden = false; });
  window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
  if (!navigator.onLine) bannerOffline.hidden = false;
}

// FIX: Added missing logout listener boilerplate pointing to login.php
const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
  logoutLink.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '../public/login.php';
  });
}

// read url param (for example: laankalinga.com/something/id=3?)
function getVisitId() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  return isNaN(id) ? null : id;
}

// load visit and senior
function loadVisit() {
  const id = getVisitId();
  const visit = VISITS_DB.find(v => v.id === id);

  if (!visit) {
    document.getElementById('visit-summary-empty').hidden = false;
    document.getElementById('profile-empty').hidden = false;
    document.getElementById('log-outcome').hidden = true;
    return;
  }

  // populate visit summary 
  document.getElementById('summary-senior').textContent =
    SENIORS_DB.find(s => s.id === visit.seniorId)?.name || '—';
  document.getElementById('summary-service').textContent = visit.serviceType;
  document.getElementById('summary-date').textContent = visit.date;
  document.getElementById('summary-time').textContent = visit.time;
  document.getElementById('visit-summary-strip').hidden = false;

  // populate senior profile
  const senior = SENIORS_DB.find(s => s.id === visit.seniorId);
  if (!senior) {
    document.getElementById('profile-empty').hidden = false;
    return;
  }

  document.getElementById('profile-name').textContent        = senior.name;
  document.getElementById('profile-address').textContent     = senior.address;
  document.getElementById('profile-emergency').textContent   = senior.emergencyContact;
  document.getElementById('profile-conditions').textContent  = senior.conditions;
  document.getElementById('profile-mobility').textContent    = senior.mobility;
  document.getElementById('profile-instructions').textContent = senior.instructions;
  document.getElementById('profile-wrap').hidden = false;
}

// char counter
const notesEl = document.getElementById('visit-notes');
const charCount = document.getElementById('char-count');
const charWarning = document.getElementById('char-warning');

notesEl.addEventListener('input', () => {
  const len = notesEl.value.trim().length;
  charCount.textContent = len;
  charWarning.hidden = len >= 20;
  if (len >= 20) clearError('visit-notes', 'error-visit-notes');
});

// flags
const flagCheckbox = document.getElementById('raise-flag');
const flagDetails  = document.getElementById('flag-details');
const flagReason   = document.getElementById('flag-reason');
const flagOtherGroup = document.getElementById('flag-other-group');
const flagOther    = document.getElementById('flag-other');

flagCheckbox.addEventListener('change', () => {
  flagDetails.hidden = !flagCheckbox.checked;
  flagReason.required = flagCheckbox.checked;
  if (!flagCheckbox.checked) {
    flagReason.value = '';
    flagOther.value = '';
    flagOtherGroup.hidden = true;
    clearError('flag-reason', 'error-flag-reason');
    clearError('flag-other', 'error-flag-other');
  }
});

flagReason.addEventListener('change', () => {
  const isOther = flagReason.value === 'other';
  flagOtherGroup.hidden = !isOther;
  flagOther.required = isOther;
  if (!isOther) {
    flagOther.value = '';
    clearError('flag-other', 'error-flag-other');
  }
});

// validation helpers
function showError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);
  if (!field || !errorEl) return;
  field.classList.add('field--invalid');
  if (message) errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);
  if (!field || !errorEl) return;
  field.classList.remove('field--invalid');
  errorEl.hidden = true;
}

function validateDate() {
  const dateEl = document.getElementById('visit-date');
  if (!dateEl.value) {
    showError('visit-date', 'error-visit-date', 'Please enter the date of the visit.');
    return false;
  }
  const chosen = new Date(dateEl.value + 'T00:00:00');
  const today  = new Date(); today.setHours(0, 0, 0, 0);

  if (chosen > today) {
    showError('visit-date', 'error-visit-date', 'Date cannot be in the future.');
    return false;
  }
  clearError('visit-date', 'error-visit-date');
  return true;
}

function validateNotes() {
  const len = notesEl.value.trim().length;
  if (len < 20) {
    showError('visit-notes', 'error-visit-notes');
    return false;
  }
  clearError('visit-notes', 'error-visit-notes');
  return true;
}

function validateFlag() {
  if (!flagCheckbox.checked) return true;
  let valid = true;

  if (!flagReason.value) {
    showError('flag-reason', 'error-flag-reason');
    valid = false;
  } else {
    clearError('flag-reason', 'error-flag-reason');
  }

  if (flagReason.value === 'other' && !flagOther.value.trim()) {
    showError('flag-other', 'error-flag-other');
    valid = false;
  } else {
    clearError('flag-other', 'error-flag-other');
  }

  return valid;
}

// blurs
document.getElementById('visit-date').addEventListener('blur', validateDate);
document.getElementById('visit-date').addEventListener('input', () => {
  if (document.getElementById('visit-date').value) validateDate();
});

// unsave changes
let hasUnsavedChanges = false;
document.getElementById('form-visit-log').addEventListener('input', () => {
  hasUnsavedChanges = true;
});

window.addEventListener('beforeunload', e => {
  if (!hasUnsavedChanges) return;
  e.preventDefault();
  e.returnValue = '';
});

// submit
document.getElementById('form-visit-log').addEventListener('submit', e => {
  e.preventDefault();

  const dateOk  = validateDate();
  const notesOk = validateNotes();
  const flagOk  = validateFlag();

  if (!dateOk || !notesOk || !flagOk) return;

  // no double submission
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  hasUnsavedChanges = false;

  // FIX: Form is now actually submitted instead of just alerting
  e.target.submit();
});

document.getElementById('form-visit-log').addEventListener('reset', () => {
  hasUnsavedChanges = false;
});

// init
loadVisit();