// placeholder
const VOLUNTEER_AVAILABILITY = {
  lastSaved: 'June 10, 2026',
  slots: {
    mon_morning: true,
    mon_afternoon: true,
    mon_evening: false,
    tue_morning: false,
    tue_afternoon: false,
    tue_evening: false,
    wed_morning: true,
    wed_afternoon: false,
    wed_evening: false,
    thu_morning: true,
    thu_afternoon: true,
    thu_evening: false,
    fri_morning: false,
    fri_afternoon: false,
    fri_evening: false,
    sat_morning: false,
    sat_afternoon: false,
    sat_evening: false,
    sun_morning: false,
    sun_afternoon: false,
    sun_evening: false,
  },
  leaves: [
    { id: 1, from: '2026-06-20', to: '2026-06-22' },
  ],
};

// state
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const SLOTS = ['morning', 'afternoon', 'evening'];
let leaves = [...VOLUNTEER_AVAILABILITY.leaves];
let nextLeaveId = leaves.length + 1;
let hasUnsavedChanges = false;

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

// init: pre checked save slots 
function loadSavedSlots() {
  const slots = VOLUNTEER_AVAILABILITY.slots;
  Object.entries(slots).forEach(([name, checked]) => {
    const el = document.getElementById(name);
    if (el) el.checked = checked;
  });

  // show last saved timestamp
  if (VOLUNTEER_AVAILABILITY.lastSaved) {
    document.getElementById('last-saved-date').textContent = VOLUNTEER_AVAILABILITY.lastSaved;
    document.getElementById('last-saved').hidden = false;
  }

  syncAllDayCheckboxes();
  syncColumnCheckboxes();
}

// current availability summary
function renderSummary() {
  const wrap = document.getElementById('availability-summary');
  const slots = VOLUNTEER_AVAILABILITY.slots;
  const DAY_LABELS = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
  const SLOT_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

  const lines = DAYS.map(day => {
    const available = SLOTS.filter(slot => slots[`${day}_${slot}`]);
    if (available.length === 0) return null;
    return `<li>${DAY_LABELS[day]}: ${available.map(s => SLOT_LABELS[s]).join(', ')}</li>`;
  }).filter(Boolean);

  if (lines.length === 0) {
    wrap.innerHTML = '<div class="empty-state"><p class="empty-state__message">No availability set yet. Fill out the form below to get started.</p></div>';
    return;
  }

  wrap.innerHTML = `<ul>${lines.join('')}</ul>`;
}

// select all: row (per all day checkbox)
function syncAllDayCheckboxes() {
  DAYS.forEach(day => {
    const allChecked = SLOTS.every(slot => {
      const el = document.getElementById(`${day}_${slot}`);
      return el && el.checked;
    });
    const allDay = document.querySelector(`.all-day[data-day="${day}"]`);
    if (allDay) allDay.checked = allChecked;
  });
}

document.querySelectorAll('.all-day').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const day = checkbox.dataset.day;
    SLOTS.forEach(slot => {
      const el = document.getElementById(`${day}_${slot}`);
      if (el) el.checked = checkbox.checked;
    });
    syncColumnCheckboxes();
    hasUnsavedChanges = true;
  });
});

// select all: column (all morning etc checkbox)
function syncColumnCheckboxes() {
  SLOTS.forEach(slot => {
    const allChecked = DAYS.every(day => {
      const el = document.getElementById(`${day}_${slot}`);
      return el && el.checked;
    });
    const colAll = document.getElementById(`all-${slot}`);
    if (colAll) colAll.checked = allChecked;
  });
}

SLOTS.forEach(slot => {
  const colAll = document.getElementById(`all-${slot}`);
  if (!colAll) return;
  colAll.addEventListener('change', () => {
    DAYS.forEach(day => {
      const el = document.getElementById(`${day}_${slot}`);
      if (el) el.checked = colAll.checked;
    });
    syncAllDayCheckboxes();
    hasUnsavedChanges = true;
  });
});

// individual checkbox changes: keep select-all in sync
document.getElementById('availability-table').addEventListener('change', e => {
  if (e.target.classList.contains('all-day')) return;
  if (e.target.id.startsWith('all-')) return;
  syncAllDayCheckboxes();
  syncColumnCheckboxes();
  hasUnsavedChanges = true;
});

// leaves
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

function renderLeaves() {
  const list = document.getElementById('leave-list');
  const empty = document.getElementById('leave-empty');
  list.innerHTML = '';

  if (leaves.length === 0) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  leaves.forEach(leave => {
    const row = document.createElement('div');
    row.className = 'leave-row';
    row.dataset.id = leave.id;
    row.innerHTML = `
      <span>${formatDateDisplay(leave.from)} — ${formatDateDisplay(leave.to)}</span>
      <button type="button" class="btn-remove-leave" data-id="${leave.id}">Remove</button>
    `;
    list.appendChild(row);
  });
}

document.getElementById('add-leave-btn').addEventListener('click', () => {
  const fromEl = document.getElementById('leave-from');
  const toEl = document.getElementById('leave-to');
  const errorEl = document.getElementById('error-leave');
  const from = fromEl.value;
  const to = toEl.value;

  if (!from || !to) {
    errorEl.textContent = 'Please fill in both dates.';
    errorEl.hidden = false;
    return;
  }
  if (to < from) {
    errorEl.textContent = '"To" date cannot be before "From" date.';
    errorEl.hidden = false;
    return;
  }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = new Date(from);

    if (fromDate < today) {
    errorEl.textContent = 'Leave start date cannot be in the past.';
    errorEl.hidden = false;
    return;
    }

  errorEl.hidden = true;
  leaves.push({ id: nextLeaveId++, from, to });
  fromEl.value = '';
  toEl.value = '';
  renderLeaves();
  hasUnsavedChanges = true;
});

document.getElementById('leave-list').addEventListener('click', e => {
  if (!e.target.matches('.btn-remove-leave')) return;
  const id = Number(e.target.dataset.id);
  leaves = leaves.filter(l => l.id !== id);
  renderLeaves();
  hasUnsavedChanges = true;
});

// warn unsave changes
window.addEventListener('beforeunload', e => {
  if (!hasUnsavedChanges) return;
  e.preventDefault();
  e.returnValue = '';
});

// submit
document.getElementById('form-availability').addEventListener('submit', e => {
  e.preventDefault();

  const anyChecked = DAYS.some(day =>
    SLOTS.some(slot => document.getElementById(`${day}_${slot}`)?.checked)
  );

  if (!anyChecked) {
    const err = document.getElementById('error-no-slots');
    err.hidden = false;
    err.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  document.getElementById('error-no-slots').hidden = true;
  hasUnsavedChanges = false;

  // FIX: Actually submit the form to let the backend process it
  e.target.submit();
});

document.getElementById('form-availability').addEventListener('reset', () => {
  hasUnsavedChanges = false;
  setTimeout(() => {
    syncAllDayCheckboxes();
    syncColumnCheckboxes();
  }, 0);
});

// init
renderSummary();
loadSavedSlots();
renderLeaves();