// data
const APPOINTMENTS_DATA = [
  {
    id: 1,
    dateRequested: '2026-06-10',
    seniorName: 'Juan Dela Cruz',
    serviceType: 'General Checkup',
    preferredDate: '2026-06-15',
    preferredTime: '09:00',
    location: '123 Sampaguita St.',
    contact: '+63 912 345 6789',
    status: 'pending',
    assignedVolunteer: null,
    assignedStaff: null,
    rejectReason: null,
    approvedBy: null,
    approvedAt: null,
    overridden: false,
  },
  {
    id: 2,
    dateRequested: '2026-06-11',
    seniorName: 'Maria Santos',
    serviceType: 'Blood Pressure Check',
    preferredDate: '2026-06-18',
    preferredTime: '10:00',
    location: '45 Rosal Ave.',
    contact: '+63 917 654 3210',
    status: 'pending',
    assignedVolunteer: null,
    assignedStaff: null,
    rejectReason: null,
    approvedBy: null,
    approvedAt: null,
    overridden: false,
  },
  {
    id: 3,
    dateRequested: '2026-06-09',
    seniorName: 'Pedro Reyes',
    serviceType: 'Wellness Visit',
    preferredDate: '2026-06-14',
    preferredTime: '09:00',
    location: '78 Ilang-Ilang St.',
    contact: '+63 920 111 2222',
    status: 'assigned',
    assignedVolunteer: 'vol1',
    assignedStaff: 'staff1',
    rejectReason: null,
    approvedBy: 'Admin',
    approvedAt: '2026-06-10',
    overridden: false,
  },
  {
    id: 4,
    dateRequested: '2026-06-08',
    seniorName: 'Rosario Bautista',
    serviceType: 'General Checkup',
    preferredDate: '2026-06-13',
    preferredTime: '11:00',
    location: '12 Dahlia St.',
    contact: '+63 915 222 3333',
    status: 'rejected',
    assignedVolunteer: null,
    assignedStaff: null,
    rejectReason: 'No available volunteer on this date.',
    approvedBy: null,
    approvedAt: null,
    overridden: false,
  },
];

const VOLUNTEERS = [
  { id: 'vol1', name: 'Ana Garcia' },
  { id: 'vol2', name: 'Luis Torres' },
];

const STAFF = [
  { id: 'staff1', name: 'Nurse Maria' },
  { id: 'staff2', name: 'Nurse Reyes' },
];

// state
let appointments = [...APPOINTMENTS_DATA];
let pendingForceRejectId = null;
let pendingOverrideId = null;
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
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: '2-digit' });
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function buildBadge(status) {
  const labels = {
    pending:  'Pending',
    approved: 'Approved',
    assigned: 'Assigned',
    rejected: 'Rejected',
  };
  const span = document.createElement('span');
  span.className = `badge badge--${status}`;
  span.textContent = labels[status] || status;
  return span;
}

function buildPersonnelDropdown(apptId, list, currentValue, label, dataAttr) {
  const select = document.createElement('select');
  select.className = 'personnel-select';
  select.dataset.id = apptId;
  select.dataset.type = dataAttr;
  select.setAttribute('aria-label', label);

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = `— Select ${label} —`;
  select.appendChild(placeholder);

  list.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    if (p.id === currentValue) opt.selected = true;
    select.appendChild(opt);
  });

  return select;
}

function getFiltered() {
  const query  = document.getElementById('search-input').value.toLowerCase();
  const status = document.getElementById('filter-status').value;
  return appointments.filter(a => {
    const matchesSearch = a.seniorName.toLowerCase().includes(query) ||
                          a.serviceType.toLowerCase().includes(query);
    const matchesStatus = status ? a.status === status : true;
    return matchesSearch && matchesStatus;
  });
}


// render pending
function renderPending(filtered) {
  const all    = appointments.filter(a => a.status === 'pending');
  const list   = filtered.filter(a => a.status === 'pending');
  const tbody  = document.getElementById('pending-tbody');
  const table  = document.getElementById('pending-table');
  const empty  = document.getElementById('pending-empty');
  const noRes  = document.getElementById('pending-no-results');

  tbody.innerHTML = '';

  if (all.length === 0) {
    table.hidden = true; empty.hidden = false; noRes.hidden = true; return;
  }
  empty.hidden = true;
  if (list.length === 0) {
    table.hidden = true; noRes.hidden = false; return;
  }
  noRes.hidden = true; table.hidden = false;

  list.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(a.dateRequested)}</td>
      <td>${a.seniorName}</td>
      <td>${a.serviceType}</td>
      <td>${formatDate(a.preferredDate)} ${formatTime(a.preferredTime)}</td>
      <td></td>
      <td>
        <button class="btn-approve btn-primary"        data-id="${a.id}">Approve</button>
        <button class="btn-reject btn-secondary"       data-id="${a.id}">Reject</button>
        <button class="btn-force-approve btn-primary"  data-id="${a.id}">Force Approve</button>
        <button class="btn-force-reject btn-secondary" data-id="${a.id}">Force Reject</button>
        <button class="btn-audit btn-secondary"        data-id="${a.id}">Details</button>
      </td>
    `;
    tr.cells[4].appendChild(buildBadge(a.status));
    tbody.appendChild(tr);
  });
}


// render approved
function renderApproved(filtered) {
  const all   = appointments.filter(a => a.status === 'approved');
  const list  = filtered.filter(a => a.status === 'approved');
  const tbody = document.getElementById('approved-tbody');
  const table = document.getElementById('approved-table');
  const empty = document.getElementById('approved-empty');
  const noRes = document.getElementById('approved-no-results');

  tbody.innerHTML = '';

  if (all.length === 0) {
    table.hidden = true; empty.hidden = false; noRes.hidden = true; return;
  }
  empty.hidden = true;
  if (list.length === 0) {
    table.hidden = true; noRes.hidden = false; return;
  }
  noRes.hidden = true; table.hidden = false;

  list.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(a.preferredDate)} ${formatTime(a.preferredTime)}</td>
      <td>${a.seniorName}</td>
      <td>${a.location}</td>
      <td>${a.contact}</td>
      <td></td>
      <td></td>
      <td>
        <button class="btn-assign btn-primary"         data-id="${a.id}">Confirm Assignment</button>
        <button class="btn-override btn-secondary"     data-id="${a.id}">Override Date</button>
        <button class="btn-force-reject btn-secondary" data-id="${a.id}">Force Reject</button>
        <button class="btn-audit btn-secondary"        data-id="${a.id}">Details</button>
      </td>
    `;
    tr.cells[4].appendChild(buildPersonnelDropdown(a.id, VOLUNTEERS, a.assignedVolunteer, 'Volunteer', 'volunteer'));
    tr.cells[5].appendChild(buildPersonnelDropdown(a.id, STAFF, a.assignedStaff, 'Staff', 'staff'));
    tbody.appendChild(tr);
  });
}


// render processed
function renderProcessed(filtered) {
  const all   = appointments.filter(a => a.status === 'assigned' || a.status === 'rejected');
  const list  = filtered.filter(a => a.status === 'assigned' || a.status === 'rejected');
  const tbody = document.getElementById('processed-tbody');
  const table = document.getElementById('processed-table');
  const empty = document.getElementById('processed-empty');
  const noRes = document.getElementById('processed-no-results');

  tbody.innerHTML = '';

  if (all.length === 0) {
    table.hidden = true; empty.hidden = false; noRes.hidden = true; return;
  }
  empty.hidden = true;
  if (list.length === 0) {
    table.hidden = true; noRes.hidden = false; return;
  }
  noRes.hidden = true; table.hidden = false;

  list.forEach(a => {
    let detail = '—';
    if (a.status === 'assigned') {
      const names = [];
      if (a.assignedVolunteer) names.push(VOLUNTEERS.find(v => v.id === a.assignedVolunteer)?.name);
      if (a.assignedStaff)     names.push(STAFF.find(s => s.id === a.assignedStaff)?.name);
      detail = names.filter(Boolean).join(', ') || '—';
    } else if (a.status === 'rejected') {
      detail = a.rejectReason || '—';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(a.preferredDate)} ${formatTime(a.preferredTime)}</td>
      <td>${a.seniorName}</td>
      <td>${a.serviceType}</td>
      <td></td>
      <td>${detail}</td>
      <td>
        ${a.status === 'assigned' ? `
          <button class="btn-reassign btn-secondary"     data-id="${a.id}">Reassign</button>
          <button class="btn-force-reject btn-secondary" data-id="${a.id}">Force Reject</button>
        ` : `
          <button class="btn-reopen btn-primary" data-id="${a.id}">Reopen</button>
        `}
        <button class="btn-audit btn-secondary" data-id="${a.id}">Details</button>
      </td>
    `;
    tr.cells[3].appendChild(buildBadge(a.status));
    tbody.appendChild(tr);
  });
}


function render() {
  const filtered = getFiltered();
  renderPending(filtered);
  renderApproved(filtered);
  renderProcessed(filtered);
}


// audit panel
function openAuditPanel(id) {
  const a = appointments.find(a => a.id === id);
  if (!a) return;

  const dl = document.getElementById('audit-details');
  dl.innerHTML = '';

  const volName   = a.assignedVolunteer ? VOLUNTEERS.find(v => v.id === a.assignedVolunteer)?.name : '—';
  const staffName = a.assignedStaff     ? STAFF.find(s => s.id === a.assignedStaff)?.name         : '—';

  const fields = [
    ['Senior Name',       a.seniorName],
    ['Service',           a.serviceType],
    ['Date Requested',    formatDate(a.dateRequested)],
    ['Preferred Date',    formatDate(a.preferredDate)],
    ['Preferred Time',    formatTime(a.preferredTime)],
    ['Location',          a.location],
    ['Contact',           a.contact],
    ['Status',            a.status],
    ['Assigned Volunteer',volName],
    ['Assigned Staff',    staffName],
    ['Approved By',       a.approvedBy  || '—'],
    ['Approved At',       a.approvedAt  ? formatDate(a.approvedAt) : '—'],
    ['Reject Reason',     a.rejectReason || '—'],
    ['Date Overridden',   a.overridden ? 'Yes' : 'No'],
  ];

  fields.forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    dl.appendChild(dt);
    dl.appendChild(dd);
  });

  document.getElementById('audit-panel').hidden = false;
  document.getElementById('audit-close-btn').focus();
}

function closeAuditPanel() {
  document.getElementById('audit-panel').hidden = true;
}


// force reject modal
function openForceRejectModal(id) {
  pendingForceRejectId = id;
  document.getElementById('force-reject-reason').value = '';
  document.getElementById('error-force-reject-reason').hidden = true;
  document.getElementById('force-reject-modal').hidden = false;
  document.getElementById('force-reject-reason').focus();
}

function closeForceRejectModal() {
  pendingForceRejectId = null;
  document.getElementById('force-reject-modal').hidden = true;
}

function confirmForceReject() {
  const reason = document.getElementById('force-reject-reason').value.trim();
  if (!reason) {
    document.getElementById('error-force-reject-reason').hidden = false;
    return;
  }
  appointments = appointments.map(a =>
    a.id === pendingForceRejectId
      ? { ...a, status: 'rejected', rejectReason: reason }
      : a
  );
  closeForceRejectModal();
  render();
  showToast('Appointment force rejected.');
  // TODO: POST /api/appointments/force-reject
}


// override modal
function openOverrideModal(id) {
  const a = appointments.find(a => a.id === id);
  if (!a) return;
  pendingOverrideId = id;
  document.getElementById('override-modal-name').textContent =
    `${a.seniorName} — ${formatDate(a.preferredDate)} ${formatTime(a.preferredTime)}`;
  document.getElementById('override-date').value = a.preferredDate;
  document.getElementById('override-time').value = a.preferredTime;
  document.getElementById('error-override-date').hidden = true;
  document.getElementById('error-override-time').hidden = true;
  document.getElementById('override-modal').hidden = false;
  document.getElementById('override-date').focus();
}

function closeOverrideModal() {
  pendingOverrideId = null;
  document.getElementById('override-modal').hidden = true;
}

function saveOverride() {
  const date = document.getElementById('override-date').value;
  const time = document.getElementById('override-time').value;
  let valid = true;

  document.getElementById('error-override-date').hidden = !!date;
  document.getElementById('error-override-time').hidden = !!time;
  if (!date) valid = false;
  if (!time) valid = false;
  if (!valid) return;

  const a = appointments.find(a => a.id === pendingOverrideId);
  openConfirmModal(
    `Override date/time for ${a.seniorName} to ${formatDate(date)} ${formatTime(time)}?`,
    () => {
      appointments = appointments.map(a =>
        a.id === pendingOverrideId
          ? { ...a, preferredDate: date, preferredTime: time, overridden: true }
          : a
      );
      closeOverrideModal();
      render();
      showToast('Date and time overridden.');
      // TODO: POST /api/appointments/override
    }
  );
}


// actions
function approveAppointment(id) {
  openConfirmModal('Approve this visit request?', () => {
    appointments = appointments.map(a =>
      a.id === id
        ? { ...a, status: 'approved', approvedBy: 'Admin', approvedAt: new Date().toISOString().slice(0, 10) }
        : a
    );
    render();
    showToast('Visit request approved.');
  });
}

function rejectAppointment(id) {
  openForceRejectModal(id);
}

function forceApprove(id) {
  openConfirmModal('Force approve this visit request? This bypasses normal review.', () => {
    appointments = appointments.map(a =>
      a.id === id
        ? { ...a, status: 'approved', approvedBy: 'Admin (Force)', approvedAt: new Date().toISOString().slice(0, 10) }
        : a
    );
    render();
    showToast('Visit request force approved.');
    // TODO: POST /api/appointments/force-approve
  });
}

function assignPersonnel(id) {
  const volSelect   = document.querySelector(`.personnel-select[data-id="${id}"][data-type="volunteer"]`);
  const staffSelect = document.querySelector(`.personnel-select[data-id="${id}"][data-type="staff"]`);

  if (!volSelect.value && !staffSelect.value) {
    showToast('Please select at least one volunteer or staff member.');
    return;
  }

  openConfirmModal('Confirm this assignment? The assigned person will be notified.', () => {
    appointments = appointments.map(a =>
      a.id === id
        ? { ...a, status: 'assigned', assignedVolunteer: volSelect.value || null, assignedStaff: staffSelect.value || null }
        : a
    );
    render();
    showToast('Assignment confirmed.');
    // TODO: POST /api/appointments/assign
  });
}

function reassignAppointment(id) {
  appointments = appointments.map(a =>
    a.id === id ? { ...a, status: 'approved' } : a
  );
  render();
  showToast('Appointment reopened for reassignment.');
}

function reopenAppointment(id) {
  openConfirmModal('Reopen this rejected appointment back to pending?', () => {
    appointments = appointments.map(a =>
      a.id === id
        ? { ...a, status: 'pending', rejectReason: null }
        : a
    );
    render();
    showToast('Appointment reopened.');
    // TODO: POST /api/appointments/reopen
  });
}


// event listeners
document.getElementById('search-input').addEventListener('input', render);
document.getElementById('filter-status').addEventListener('change', render);
document.getElementById('btn-retry-load').addEventListener('click', render);
document.getElementById('audit-close-btn').addEventListener('click', closeAuditPanel);
document.getElementById('force-reject-confirm-btn').addEventListener('click', confirmForceReject);
document.getElementById('force-reject-cancel-btn').addEventListener('click', closeForceRejectModal);
document.getElementById('override-save-btn').addEventListener('click', saveOverride);
document.getElementById('override-cancel-btn').addEventListener('click', closeOverrideModal);

document.addEventListener('click', e => {
  if (e.target.matches('.btn-approve'))       approveAppointment(Number(e.target.dataset.id));
  if (e.target.matches('.btn-reject'))        rejectAppointment(Number(e.target.dataset.id));
  if (e.target.matches('.btn-force-approve')) forceApprove(Number(e.target.dataset.id));
  if (e.target.matches('.btn-force-reject'))  openForceRejectModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-assign'))        assignPersonnel(Number(e.target.dataset.id));
  if (e.target.matches('.btn-reassign'))      reassignAppointment(Number(e.target.dataset.id));
  if (e.target.matches('.btn-reopen'))        reopenAppointment(Number(e.target.dataset.id));
  if (e.target.matches('.btn-override'))      openOverrideModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-audit'))         openAuditPanel(Number(e.target.dataset.id));
});


// init
render();