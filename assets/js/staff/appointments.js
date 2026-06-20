// placeholde (similar to json file sa lakbay before)
/*
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
    assignedTo: null,
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
    assignedTo: null,
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
    assignedTo: null,
  },
];
*/

const VOLUNTEERS = [
  { id: 'vol1',   name: 'Ana Garcia',  role: 'Volunteer' },
  { id: 'vol2',   name: 'Luis Torres', role: 'Volunteer' },
  { id: 'staff1', name: 'Nurse Maria', role: 'Staff'     },
];

// state
let appointments = [];
let pendingRejectId = null;

// helpers: filter, status badge, volunteer dropdown
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

function buildVolunteerDropdown(apptId, currentValue) {
  const select = document.createElement('select');
  select.className = 'volunteer-select';
  select.dataset.id = apptId;
  select.setAttribute('aria-label', 'Assign volunteer');

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '— Select Personnel —';
  select.appendChild(placeholder);

  VOLUNTEERS.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = `${v.name} (${v.role})`;
    if (v.id === currentValue) opt.selected = true;
    select.appendChild(opt);
  });

  return select;
}

// render table
function renderPending(list) {
  const pending = list.filter(a => a.status === 'pending');
  const tbody = document.getElementById('pending-tbody');
  const table = document.getElementById('pending-table');
  const empty = document.getElementById('pending-empty');

  tbody.innerHTML = '';

  if (pending.length === 0) {
    table.hidden = true;
    empty.hidden = false;
    return;
  }

  table.hidden = false;
  empty.hidden = true;

  pending.forEach(a => {
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
    // insert badge into the empty <td> cleanly
    tr.cells[4].appendChild(buildBadge(a.status));
    tbody.appendChild(tr);
  });
}

function renderApproved(list) {
  const approved = list.filter(a => a.status === 'approved');
  const tbody = document.getElementById('approved-tbody');
  const table = document.getElementById('approved-table');
  const empty = document.getElementById('approved-empty');

  tbody.innerHTML = '';

  if (approved.length === 0) {
    table.hidden = true;
    empty.hidden = false;
    return;
  }

  table.hidden = false;
  empty.hidden = true;

  approved.forEach(a => {
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
    tr.cells[4].appendChild(buildBadge(a.status));
    tr.cells[5].appendChild(buildVolunteerDropdown(a.id, a.assignedTo));
    tbody.appendChild(tr);
  });
}

function render() {
  const filtered = getFiltered();
  renderPending(filtered);
  renderApproved(filtered);
}

// actions: approve, reject (w reason), close and confirm reject, assign volunteer
function approveAppointment(id) {
  if (!confirm('Approve this appointment?')) return;
  appointments = appointments.map(a =>
    a.id === id ? { ...a, status: 'approved' } : a
  );
  render();
  // TODO: POST /api/appointments/approve
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
  // TODO: POST /api/appointments/reject
}

function assignVolunteer(id) {
  const select = document.querySelector(`.volunteer-select[data-id="${id}"]`);
  if (!select || !select.value) {
    alert('Please select a volunteer or staff member first.');
    return;
  }
  appointments = appointments.map(a =>
    a.id === id ? { ...a, assignedTo: select.value } : a
  );
  alert('Assignment confirmed. They will be notified.');
  render();
  // TODO: POST /api/appointments/assign (when php is done, replace this with real API call)
    
  /* something like: 
        fetch('/api/appointments/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, volunteerId: select.value })
        });
    */
}

// event listeners
document.addEventListener('click', e => {
  if (e.target.matches('.btn-approve'))      approveAppointment(Number(e.target.dataset.id));
  if (e.target.matches('.btn-reject'))       openRejectModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-assign'))       assignVolunteer(Number(e.target.dataset.id));
  if (e.target.matches('#reject-confirm-btn')) confirmReject();
  if (e.target.matches('#reject-cancel-btn'))  closeRejectModal();
});


// Karl -----
document.getElementById('search-input').addEventListener('input', render);
document.getElementById('filter-status').addEventListener('change', render);

// FIX: Added authorization check & safe mapping
async function loadAppointments() {
    try {
        const response = await fetch('../../php/displaybooking.php');
        if (!response.ok) {
            if (response.status === 401) {
                 window.location.href = '../public/login.php?error=unauthorized';
                 return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if(Array.isArray(data)) {
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
        } else {
            console.error("Invalid data format received from API");
        }
    } catch (err) {
        console.error("Failed to load appointments:", err);
    }
}

// init
loadAppointments();