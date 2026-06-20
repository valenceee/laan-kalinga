// data
const ACCOUNTS_DATA = [
  {
    id: 1,
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    mobile: '0918 234 5678',
    role: 'staff',
    status: 'active',
    dateRegistered: '2024-11-15',
    suspendFrom: null,
    suspendTo: null,
    suspendReason: null,
  },
  {
    id: 2,
    name: 'Pedro Reyes',
    email: 'pedro.reyes@example.com',
    mobile: '0919 345 6789',
    role: 'volunteer',
    status: 'active',
    dateRegistered: '2024-10-20',
    suspendFrom: null,
    suspendTo: null,
    suspendReason: null,
  },
  {
    id: 3,
    name: 'Ana Garcia',
    email: 'ana.garcia@example.com',
    mobile: '0920 456 7890',
    role: 'volunteer',
    status: 'inactive',
    dateRegistered: '2024-09-05',
    suspendFrom: null,
    suspendTo: null,
    suspendReason: null,
  },
  {
    id: 4,
    name: 'Luis Torres',
    email: 'luis.torres@example.com',
    mobile: '0921 567 8901',
    role: 'volunteer',
    status: 'suspended',
    dateRegistered: '2024-08-12',
    suspendFrom: '2026-06-01',
    suspendTo: '2026-06-30',
    suspendReason: 'Repeated no-shows without notice.',
  },
  {
    id: 5,
    name: 'Rosario Bautista',
    email: 'rosario.bautista@example.com',
    mobile: '0922 678 9012',
    role: 'staff',
    status: 'pending',
    dateRegistered: '2026-01-10',
    suspendFrom: null,
    suspendTo: null,
    suspendReason: null,
  },
];

const ROLE_LABELS = {
  staff:     'Staff',
  volunteer: 'Volunteer',
};

const STATUS_LABELS = {
  active:    'Active',
  inactive:  'Inactive',
  suspended: 'Suspended',
  pending:   'Pending',
};

const PAGE_SIZE = 10;

// state
let accounts = [...ACCOUNTS_DATA];
let nextId = accounts.length + 1;
let currentPage = 1;
let editingAccountId = null;
let pendingSuspendId = null;
let pendingResetId = null;
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

function buildBadge(value, labelMap) {
  const span = document.createElement('span');
  const key  = value.replace(/_/g, '-');
  span.className = `badge badge--${key}`;
  span.textContent = labelMap[value] || value;
  return span;
}

function getFiltered() {
  const query  = document.getElementById('search-input').value.toLowerCase();
  const role   = document.getElementById('filter-role').value;
  const status = document.getElementById('filter-status').value;
  return accounts.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(query) ||
                          a.email.toLowerCase().includes(query);
    const matchesRole   = role   ? a.role   === role   : true;
    const matchesStatus = status ? a.status === status : true;
    return matchesSearch && matchesRole && matchesStatus;
  });
}
function buildActionButtons(a) {
  const td = document.createElement('td');
  const wrap = document.createElement('div');
  wrap.className = 'actions-cell';

  const viewBtn = document.createElement('button');
  viewBtn.type = 'button';
  viewBtn.className = 'btn-view-account btn-secondary btn-sm';
  viewBtn.dataset.id = a.id;
  viewBtn.textContent = 'View';
  wrap.appendChild(viewBtn);

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn-edit-account btn-secondary btn-sm';
  editBtn.dataset.id = a.id;
  editBtn.textContent = 'Edit';
  wrap.appendChild(editBtn);

  if (a.status === 'pending') {
    const approveBtn = document.createElement('button');
    approveBtn.type = 'button';
    approveBtn.className = 'btn-approve-account btn-primary btn-sm';
    approveBtn.dataset.id = a.id;
    approveBtn.textContent = 'Approve';
    wrap.appendChild(approveBtn);

    const rejectBtn = document.createElement('button');
    rejectBtn.type = 'button';
    rejectBtn.className = 'btn-reject-account btn-secondary btn-sm';
    rejectBtn.dataset.id = a.id;
    rejectBtn.textContent = 'Reject';
    wrap.appendChild(rejectBtn);
  }

  if (a.status === 'active') {
    const suspendBtn = document.createElement('button');
    suspendBtn.type = 'button';
    suspendBtn.className = 'btn-suspend-account btn-warning btn-sm';
    suspendBtn.dataset.id = a.id;
    suspendBtn.textContent = 'Suspend';
    wrap.appendChild(suspendBtn);
  }

  if (a.status === 'suspended' || a.status === 'inactive') {
    const activateBtn = document.createElement('button');
    activateBtn.type = 'button';
    activateBtn.className = 'btn-activate-account btn-primary btn-sm';
    activateBtn.dataset.id = a.id;
    activateBtn.textContent = 'Activate';
    wrap.appendChild(activateBtn);
  }

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn-reset-password btn-secondary btn-sm';
  resetBtn.dataset.id = a.id;
  resetBtn.textContent = 'Reset Pw';
  wrap.appendChild(resetBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn-delete-account btn-danger btn-sm';
  deleteBtn.dataset.id = a.id;
  deleteBtn.textContent = 'Delete';
  wrap.appendChild(deleteBtn);

  td.appendChild(wrap);
  return td;
}


// render
function render() {
  const all      = accounts;
  const filtered = getFiltered();
  const tbody    = document.getElementById('accounts-tbody');
  const table    = document.getElementById('accounts-table');
  const empty    = document.getElementById('accounts-empty');
  const noRes    = document.getElementById('accounts-no-results');
  const pagination = document.getElementById('pagination');

  tbody.innerHTML = '';

  if (all.length === 0) {
    table.hidden = true; pagination.hidden = true;
    empty.hidden = false; noRes.hidden = true;
    return;
  }
  empty.hidden = true;

  if (filtered.length === 0) {
    table.hidden = true; pagination.hidden = true;
    noRes.hidden = false;
    return;
  }
  noRes.hidden = true;
  table.hidden = false;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  paged.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${String(a.id).padStart(3, '0')}</td>
      <td>${a.name}</td>
      <td>${a.email}</td>
      <td>${a.mobile}</td>
      <td></td>
      <td></td>
      <td>${formatDate(a.dateRegistered)}</td>
    `;
    tr.cells[4].appendChild(buildBadge(a.role,   ROLE_LABELS));
    tr.cells[5].appendChild(buildBadge(a.status, STATUS_LABELS));
    tr.appendChild(buildActionButtons(a));
    tbody.appendChild(tr);
  });

  // pagination
  if (totalPages > 1) {
    pagination.hidden = false;
    document.getElementById('pagination-label').textContent =
      `Page ${currentPage} of ${totalPages}`;
    document.getElementById('btn-prev').disabled = currentPage === 1;
    document.getElementById('btn-next').disabled = currentPage === totalPages;
  } else {
    pagination.hidden = true;
  }
}


// profile modal
function openProfileModal(id) {
  const a = accounts.find(a => a.id === id);
  if (!a) return;

  const dl = document.getElementById('profile-details');
  dl.innerHTML = '';

  const fields = [
    ['Name',            a.name],
    ['Email',           a.email],
    ['Mobile',          a.mobile],
    ['Role',            ROLE_LABELS[a.role]],
    ['Status',          STATUS_LABELS[a.status]],
    ['Date Registered', formatDate(a.dateRegistered)],
    ['Suspended From',  a.suspendFrom   ? formatDate(a.suspendFrom)   : '—'],
    ['Suspended Until', a.suspendTo     ? formatDate(a.suspendTo)     : '—'],
    ['Suspend Reason',  a.suspendReason || '—'],
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


// add / edit modal
function openAccountModal(id = null) {
  editingAccountId = id;
  const isEdit = id !== null;
  document.getElementById('account-modal-title').textContent = isEdit ? 'Edit Account' : 'Add Account';
  document.getElementById('account-password-field').hidden = isEdit;

  ['error-account-name', 'error-account-email', 'error-account-mobile'].forEach(e => {
    document.getElementById(e).hidden = true;
  });

  if (isEdit) {
    const a = accounts.find(a => a.id === id);
    document.getElementById('account-name').value   = a.name;
    document.getElementById('account-email').value  = a.email;
    document.getElementById('account-mobile').value = a.mobile;
    document.getElementById('account-role').value   = a.role;
  } else {
    document.getElementById('account-name').value     = '';
    document.getElementById('account-email').value    = '';
    document.getElementById('account-mobile').value   = '';
    document.getElementById('account-role').value     = 'staff';
    document.getElementById('account-password').value = 'account123';
  }

  document.getElementById('account-modal').hidden = false;
  document.getElementById('account-name').focus();
}

function closeAccountModal() {
  editingAccountId = null;
  document.getElementById('account-modal').hidden = true;
}

function saveAccount() {
  const name   = document.getElementById('account-name').value.trim();
  const email  = document.getElementById('account-email').value.trim();
  const mobile = document.getElementById('account-mobile').value.trim();
  const role   = document.getElementById('account-role').value;
  let valid = true;

  document.getElementById('error-account-name').hidden   = !!name;
  document.getElementById('error-account-email').hidden  = !!email;
  document.getElementById('error-account-mobile').hidden = !!mobile;
  if (!name)   valid = false;
  if (!email)  valid = false;
  if (!mobile) valid = false;
  if (!valid) return;

  const isEdit = editingAccountId !== null;
  openConfirmModal(isEdit ? 'Save changes to this account?' : 'Create this account?', () => {
    if (isEdit) {
      accounts = accounts.map(a =>
        a.id === editingAccountId ? { ...a, name, email, mobile, role } : a
      );
      showToast('Account updated.');
    } else {
      accounts.push({
        id: nextId++,
        name, email, mobile, role,
        status: 'active',
        dateRegistered: new Date().toISOString().slice(0, 10),
        suspendFrom: null, suspendTo: null, suspendReason: null,
      });
      showToast('Account created.');
    }
    closeAccountModal();
    render();
    // TODO: POST /api/accounts/save
  });
}


// suspend modal
function openSuspendModal(id) {
  const a = accounts.find(a => a.id === id);
  if (!a) return;
  pendingSuspendId = id;
  document.getElementById('suspend-modal-name').textContent = a.name;
  document.getElementById('suspend-from').value   = '';
  document.getElementById('suspend-to').value     = '';
  document.getElementById('suspend-reason').value = '';
  ['error-suspend-from', 'error-suspend-to', 'error-suspend-reason'].forEach(e => {
    document.getElementById(e).hidden = true;
  });
  document.getElementById('suspend-modal').hidden = false;
  document.getElementById('suspend-from').focus();
}

function closeSuspendModal() {
  pendingSuspendId = null;
  document.getElementById('suspend-modal').hidden = true;
}

function confirmSuspend() {
  const from   = document.getElementById('suspend-from').value;
  const to     = document.getElementById('suspend-to').value;
  const reason = document.getElementById('suspend-reason').value.trim();
  let valid = true;

  document.getElementById('error-suspend-from').hidden   = !!from;
  document.getElementById('error-suspend-to').hidden     = !!to;
  document.getElementById('error-suspend-reason').hidden = !!reason;
  if (!from)   valid = false;
  if (!to)     valid = false;
  if (!reason) valid = false;
  if (!valid) return;

  const a = accounts.find(a => a.id === pendingSuspendId);
  openConfirmModal(`Suspend ${a.name} from ${formatDate(from)} to ${formatDate(to)}?`, () => {
    accounts = accounts.map(a =>
      a.id === pendingSuspendId
        ? { ...a, status: 'suspended', suspendFrom: from, suspendTo: to, suspendReason: reason }
        : a
    );
    closeSuspendModal();
    render();
    showToast('Account suspended.');
    // TODO: POST /api/accounts/suspend
  });
}


// reset password modal
function openResetModal(id) {
  const a = accounts.find(a => a.id === id);
  if (!a) return;
  pendingResetId = id;
  document.getElementById('reset-modal-name').textContent = a.name;
  document.getElementById('reset-password').value = 'account123';
  document.getElementById('reset-modal').hidden = false;
  document.getElementById('reset-password').focus();
}

function closeResetModal() {
  pendingResetId = null;
  document.getElementById('reset-modal').hidden = true;
}

function confirmReset() {
  const a = accounts.find(a => a.id === pendingResetId);
  openConfirmModal(`Reset password for ${a.name}?`, () => {
    closeResetModal();
    showToast(`Password reset for ${a.name}.`);
    // TODO: POST /api/accounts/reset-password
  });
}


// actions
function approveAccount(id) {
  const a = accounts.find(a => a.id === id);
  openConfirmModal(`Approve account for ${a.name}?`, () => {
    accounts = accounts.map(a =>
      a.id === id ? { ...a, status: 'active' } : a
    );
    render();
    showToast('Account approved.');
    // TODO: POST /api/accounts/approve
  });
}

function rejectAccount(id) {
  const a = accounts.find(a => a.id === id);
  openConfirmModal(`Reject and delete account for ${a.name}? This cannot be undone.`, () => {
    accounts = accounts.filter(a => a.id !== id);
    render();
    showToast('Account rejected and removed.');
    // TODO: POST /api/accounts/reject
  });
}

function activateAccount(id) {
  const a = accounts.find(a => a.id === id);
  openConfirmModal(`Activate account for ${a.name}?`, () => {
    accounts = accounts.map(a =>
      a.id === id
        ? { ...a, status: 'active', suspendFrom: null, suspendTo: null, suspendReason: null }
        : a
    );
    render();
    showToast('Account activated.');
    // TODO: POST /api/accounts/activate
  });
}

function deleteAccount(id) {
  const a = accounts.find(a => a.id === id);
  openConfirmModal(`Permanently delete account for ${a.name}? A backup will be sent to superadmin.`, () => {
    accounts = accounts.filter(a => a.id !== id);
    render();
    showToast('Account deleted. Backup sent to superadmin.');
    // TODO: POST /api/accounts/delete (soft delete, backed up to superadmin)
  });
}


// event listeners
document.getElementById('search-input').addEventListener('input', () => { currentPage = 1; render(); });
document.getElementById('filter-role').addEventListener('change', () => { currentPage = 1; render(); });
document.getElementById('filter-status').addEventListener('change', () => { currentPage = 1; render(); });
document.getElementById('btn-retry-load').addEventListener('click', render);
document.getElementById('btn-add-account').addEventListener('click', () => openAccountModal());
document.getElementById('account-save-btn').addEventListener('click', saveAccount);
document.getElementById('account-cancel-btn').addEventListener('click', closeAccountModal);
document.getElementById('suspend-confirm-btn').addEventListener('click', confirmSuspend);
document.getElementById('suspend-cancel-btn').addEventListener('click', closeSuspendModal);
document.getElementById('reset-confirm-btn').addEventListener('click', confirmReset);
document.getElementById('reset-cancel-btn').addEventListener('click', closeResetModal);
document.getElementById('profile-close-btn').addEventListener('click', closeProfileModal);
document.getElementById('btn-prev').addEventListener('click', () => { currentPage--; render(); });
document.getElementById('btn-next').addEventListener('click', () => { currentPage++; render(); });

document.addEventListener('click', e => {
  if (e.target.matches('.btn-view-account'))     openProfileModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-edit-account'))     openAccountModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-approve-account'))  approveAccount(Number(e.target.dataset.id));
  if (e.target.matches('.btn-reject-account'))   rejectAccount(Number(e.target.dataset.id));
  if (e.target.matches('.btn-suspend-account'))  openSuspendModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-activate-account')) activateAccount(Number(e.target.dataset.id));
  if (e.target.matches('.btn-reset-password'))   openResetModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-delete-account'))   deleteAccount(Number(e.target.dataset.id));
});


// init
render();