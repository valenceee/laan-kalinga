/*
// data
const APPOINTMENTS = [
  {
    id: 1,
    dateRequested: 'June 10, 2026',
    seniorName: 'Juan Dela Cruz',
    serviceType: 'General Checkup',
    preferredDate: 'June 15, 2026',
    preferredTime: '9:00 AM',
    location: '123 Sampaguita St.',
    contact: '+63 912 345 6789',
    status: 'pending',
    assignedVolunteer: null,
    assignedStaff: null,
    rejectReason: null,
  },
  {
    id: 2,
    dateRequested: 'June 11, 2026',
    seniorName: 'Maria Santos',
    serviceType: 'Blood Pressure Check',
    preferredDate: 'June 18, 2026',
    preferredTime: '10:00 AM',
    location: '45 Rosal Ave.',
    contact: '+63 917 654 3210',
    status: 'pending',
    assignedVolunteer: null,
    assignedStaff: null,
    rejectReason: null,
  },
  {
    id: 3,
    dateRequested: 'June 9, 2026',
    seniorName: 'Pedro Reyes',
    serviceType: 'Wellness Visit',
    preferredDate: 'June 14, 2026',
    preferredTime: '9:00 AM',
    location: '78 Ilang-Ilang St.',
    contact: '+63 920 111 2222',
    status: 'approved',
    assignedVolunteer: null,
    assignedStaff: null,
    rejectReason: null,
  },
];
*/

const VOLUNTEERS = [
  { id: 'vol1', name: 'Ana Garcia' },
  { id: 'vol2', name: 'Luis Torres' },
];

const STAFF = [
  { id: 'staff1', name: 'Nurse Maria' },
  { id: 'staff2', name: 'Nurse Reyes' },
];

// state
let appointments = [];
let pendingRejectId = null;
let pendingConfirmAction = null;

// offline banner
const bannerOffline = document.getElementById('banner-offline');
window.addEventListener('offline', () => { bannerOffline.hidden = false; });
window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
if (!navigator.onLine) bannerOffline.hidden = false;

// logout
document.getElementById('logout-link').addEventListener('click', (e) => {
  e.preventDefault();
  // clear staff session here (handled by backend session/JS function)
  window.location.href = '../public/index.html';
});


// toast notifications (replaces alert())
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3000);
}


// generic confirm modal (replaces confirm())
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
function getFiltered() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;
  return appointments.filter(a => {
    const matchesSearch =
      a.seniorName.toLowerCase().includes(query) ||
      a.serviceType.toLowerCase().includes(query);
    const matchesStatus = statusFilter ? a.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });
}

function buildBadge(status) {
  const span = document.createElement('span');
  span.className = `badge badge--${status}`;
  span.textContent = status.charAt(0).toUpperCase() + status.slice(1);
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


// render: pending
function renderPending(list) {
  const all = appointments.filter(a => a.status === 'pending');
  const filtered = list.filter(a => a.status === 'pending');

  const tbody  = document.getElementById('pending-tbody');
  const table  = document.getElementById('pending-table');
  const empty  = document.getElementById('pending-empty');
  const noRes  = document.getElementById('pending-no-results');

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

  filtered.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.dateRequested}</td>
      <td>${a.seniorName}</td>
      <td>${a.serviceType}</td>
      <td>${a.preferredDate} ${a.preferredTime}</td>
      <td></td>
      <td>
        <button class="btn-approve" data-id="${a.id}">Approve</button>
        <button class="btn-reject"  data-id="${a.id}">Reject</button>
      </td>
    `;
    tr.cells[4].appendChild(buildBadge(a.status));
    tbody.appendChild(tr);
  });
}


// render: approved (needs assignment)
function renderApproved(list) {
  const all = appointments.filter(a => a.status === 'approved');
  const filtered = list.filter(a => a.status === 'approved');

  const tbody  = document.getElementById('approved-tbody');
  const table  = document.getElementById('approved-table');
  const empty  = document.getElementById('approved-empty');
  const noRes  = document.getElementById('approved-no-results');

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

  filtered.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.preferredDate} ${a.preferredTime}</td>
      <td>${a.seniorName}</td>
      <td>${a.location}</td>
      <td>${a.contact}</td>
      <td></td>
      <td></td>
      <td><button class="btn-assign" data-id="${a.id}">Confirm Assignment</button></td>
    `;
    tr.cells[4].appendChild(buildPersonnelDropdown(a.id, VOLUNTEERS, a.assignedVolunteer, 'Volunteer', 'volunteer'));
    tr.cells[5].appendChild(buildPersonnelDropdown(a.id, STAFF, a.assignedStaff, 'Staff', 'staff'));
    tbody.appendChild(tr);
  });
}


// render: processed (assigned + rejected)
function renderProcessed(list) {
  const all = appointments.filter(a => a.status === 'assigned' || a.status === 'rejected');
  const filtered = list.filter(a => a.status === 'assigned' || a.status === 'rejected');

  const tbody = document.getElementById('processed-tbody');
  const table = document.getElementById('processed-table');
  const empty = document.getElementById('processed-empty');
  const noRes = document.getElementById('processed-no-results');

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

  filtered.forEach(a => {
    const tr = document.createElement('tr');
    let detail = '—';

    if (a.status === 'assigned') {
      const names = [];
      if (a.assignedVolunteer) names.push(VOLUNTEERS.find(v => v.id === a.assignedVolunteer)?.name);
      if (a.assignedStaff) names.push(STAFF.find(s => s.id === a.assignedStaff)?.name);
      detail = names.join(', ') || '—';
    } else if (a.status === 'rejected') {
      detail = a.rejectReason || '—';
    }

    tr.innerHTML = `
      <td>${a.preferredDate} ${a.preferredTime}</td>
      <td>${a.seniorName}</td>
      <td>${a.serviceType}</td>
      <td></td>
      <td>${detail}</td>
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


// actions
function approveAppointment(id) {
  openConfirmModal('Approve this visit request?', () => {
    appointments = appointments.map(a =>
      a.id === id ? { ...a, status: 'approved' } : a
    );
    render();
    showToast('Visit request approved.');
    // TODO: POST /api/appointments/approve
  });
}

function openRejectModal(id) {
  pendingRejectId = id;
  document.getElementById('reject-reason-input').value = '';
  document.getElementById('error-reject-reason').hidden = true;
  document.getElementById('reject-modal').hidden = false;
  document.getElementById('reject-reason-input').focus();
}

function closeRejectModal() {
  pendingRejectId = null;
  document.getElementById('reject-modal').hidden = true;
}

function confirmReject() {
  const reason = document.getElementById('reject-reason-input').value.trim();
  if (!reason) {
    document.getElementById('error-reject-reason').hidden = false;
    return;
  }
  appointments = appointments.map(a =>
    a.id === pendingRejectId ? { ...a, status: 'rejected', rejectReason: reason } : a
  );
  closeRejectModal();
  render();
  showToast('Visit request rejected.');
  // TODO: POST /api/appointments/reject
}

function assignPersonnel(id) {
  const volunteerSelect = document.querySelector(`.personnel-select[data-id="${id}"][data-type="volunteer"]`);
  const staffSelect     = document.querySelector(`.personnel-select[data-id="${id}"][data-type="staff"]`);

  if (!volunteerSelect.value && !staffSelect.value) {
    showToast('Please select at least one volunteer or staff member.');
    return;
  }

  openConfirmModal('Confirm this assignment? The assigned person will be notified.', () => {
    appointments = appointments.map(a =>
      a.id === id
        ? { ...a, status: 'assigned', assignedVolunteer: volunteerSelect.value || null, assignedStaff: staffSelect.value || null }
        : a
    );
    render();
    showToast('Assignment confirmed.');
    /* TODO: POST /api/appointments/assign
       fetch('/api/appointments/assign', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ appointmentId: id, volunteerId: volunteerSelect.value, staffId: staffSelect.value })
       });
    */
  });
}


// event listeners
document.addEventListener('click', e => {
  if (e.target.matches('.btn-approve'))       approveAppointment(Number(e.target.dataset.id));
  if (e.target.matches('.btn-reject'))        openRejectModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-assign'))        assignPersonnel(Number(e.target.dataset.id));
  if (e.target.matches('#reject-confirm-btn')) confirmReject();
  if (e.target.matches('#reject-cancel-btn'))  closeRejectModal();
});

// Karl -----
document.getElementById('search-input').addEventListener('input', render);
document.getElementById('filter-status').addEventListener('change', render);

async function loadAppointments() {
    try {
        const response = await fetch('../../php/displaybooking.php');
        const data = await response.json();

        appointments = data.map(a => ({
            id: Number(a.id),
            dateRequested: a.createdAt,
            seniorName: a.pName,
            serviceType: a.serviceType,
            preferredDate: a.appointmentDate,
            preferredTime: a.timeSlot,
            location: a.address,
            contact: a.contactNum,
            status: a.status.toLowerCase(),
            assignedTo: null
        }));

        render();

    } catch (err) {
        console.error(err);
    }
}

// init
loadAppointments();
