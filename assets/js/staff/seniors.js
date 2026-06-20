// data
const SENIORS = [
  {
    id: 1,
    name: 'Juan Dela Cruz',
    age: 71,
    address: '123 Sampaguita St., Brgy. Pag-asa',
    contact: '+63 912 345 6789',
    priority: 'normal',
    lastVisit: 'June 10, 2026',
    totalVisits: 4,
  },
  {
    id: 2,
    name: 'Maria Santos',
    age: 82,
    address: '456 Mabini St., Brgy. Pag-asa',
    contact: '+63 917 654 3210',
    priority: 'frail',
    lastVisit: 'June 11, 2026',
    totalVisits: 9,
  },
  {
    id: 3,
    name: 'Pedro Reyes',
    age: 68,
    address: '789 Rizal Ave., Brgy. Pag-asa',
    contact: '+63 920 111 2222',
    priority: 'pwd',
    lastVisit: 'June 14, 2026',
    totalVisits: 6,
  },
];

const PRIORITY_LABELS = {
  normal: 'Normal',
  frail:  'Priority (Frail)',
  pwd:    'Priority (PWD)',
};

// state
let seniors = [...SENIORS];
let pendingPriorityId = null;
let pendingConfirmAction = null;

// offline banner
const bannerOffline = document.getElementById('banner-offline');
window.addEventListener('offline', () => { bannerOffline.hidden = false; });
window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
if (!navigator.onLine) bannerOffline.hidden = false;

// logout
document.getElementById('logout-link').addEventListener('click', (e) => {
  e.preventDefault();
  // FIX: Redirect to the updated login.php file
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
function buildBadge(priority) {
  const span = document.createElement('span');
  span.className = `badge badge--${priority}`;
  span.textContent = PRIORITY_LABELS[priority] || priority;
  return span;
}

function getFiltered() {
  const query    = document.getElementById('search-input').value.toLowerCase();
  const priority = document.getElementById('filter-priority').value;
  return seniors.filter(s => {
    const matchesSearch   = s.name.toLowerCase().includes(query) ||
                            s.address.toLowerCase().includes(query);
    const matchesPriority = priority ? s.priority === priority : true;
    return matchesSearch && matchesPriority;
  });
}


// render
function render() {
  const all      = seniors;
  const filtered = getFiltered();
  const tbody    = document.getElementById('seniors-tbody');
  const table    = document.getElementById('seniors-table');
  const empty    = document.getElementById('seniors-empty');
  const noRes    = document.getElementById('seniors-no-results');

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

  filtered.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.age}</td>
      <td>${s.address}</td>
      <td></td>
      <td>
        <button class="btn-view-profile" data-id="${s.id}">View Profile</button>
        <button class="btn-edit-priority" data-id="${s.id}">Edit Priority</button>
      </td>
    `;
    tr.cells[3].appendChild(buildBadge(s.priority));
    tbody.appendChild(tr);
  });
}


// profile modal
function openProfileModal(id) {
  const s = seniors.find(s => s.id === id);
  if (!s) return;

  const dl = document.getElementById('profile-details');
  dl.innerHTML = '';

  const fields = [
    ['Name',          s.name],
    ['Age',           s.age],
    ['Address',       s.address],
    ['Contact',       s.contact],
    ['Priority',      PRIORITY_LABELS[s.priority]],
    ['Last Visit',    s.lastVisit],
    ['Total Visits',  s.totalVisits],
  ];

  fields.forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    dl.appendChild(dt);
    dl.appendChild(dd);
  });

  document.getElementById('profile-modal').hidden = false;
  document.getElementById('profile-close-btn').focus();
}

function closeProfileModal() {
  document.getElementById('profile-modal').hidden = true;
}


// priority modal
function openPriorityModal(id) {
  const s = seniors.find(s => s.id === id);
  if (!s) return;
  pendingPriorityId = id;
  document.getElementById('priority-modal-name').textContent = s.name;
  document.getElementById('priority-select').value = s.priority;
  document.getElementById('priority-modal').hidden = false;
  document.getElementById('priority-select').focus();
}

function closePriorityModal() {
  pendingPriorityId = null;
  document.getElementById('priority-modal').hidden = true;
}

function savePriority() {
  const newPriority = document.getElementById('priority-select').value;
  const s = seniors.find(s => s.id === pendingPriorityId);
  const label = PRIORITY_LABELS[newPriority];

  openConfirmModal(`Set priority for ${s.name} to "${label}"?`, () => {
    seniors = seniors.map(s =>
      s.id === pendingPriorityId ? { ...s, priority: newPriority } : s
    );
    closePriorityModal();
    render();
    showToast(`Priority updated to ${label}.`);
    // TODO: POST /api/seniors/priority
  });
}


// event listeners
document.addEventListener('click', e => {
  if (e.target.matches('.btn-view-profile'))  openProfileModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-edit-priority')) openPriorityModal(Number(e.target.dataset.id));
  if (e.target.matches('#profile-close-btn')) closeProfileModal();
  if (e.target.matches('#priority-save-btn')) savePriority();
  if (e.target.matches('#priority-cancel-btn')) closePriorityModal();
});

document.getElementById('search-input').addEventListener('input', render);
document.getElementById('filter-priority').addEventListener('change', render);
document.getElementById('btn-retry-load').addEventListener('click', render);


// init
render();