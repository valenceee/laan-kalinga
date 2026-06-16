// data
const ACCOUNTS = [
  {
    id: 'SA-001',
    name: 'Master Administrator',
    email: 'master@laankalinga.com',
    role: 'superadmin',
    status: 'active',
    dateAdded: '2024-01-01',
    locked: true,
  },
  {
    id: 'AD-012',
    name: 'System Operator',
    email: 'operator@laankalinga.com',
    role: 'admin',
    status: 'active',
    dateAdded: '2024-03-15',
    locked: false,
  },
  {
    id: 'AD-014',
    name: 'Database Manager',
    email: 'db.manager@laankalinga.com',
    role: 'admin',
    status: 'suspended',
    dateAdded: '2024-05-20',
    locked: false,
  },
];

// superadmin password (placeholder — replace with real auth)
const REAUTH_PASSWORD = 'superadmin123';

const PAGE_SIZE = 10;

// state
let accounts = [...ACCOUNTS];
let currentPage = 1;
let pendingConfirmAction = null;
let editingId = null;
let resettingId = null;
let deactivatingId = null;

// helpers
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3000);
}

function buildBadge(text, modifier) {
  const span = document.createElement('span');
  span.className = `badge badge--${modifier}`;
  span.textContent = text.charAt(0).toUpperCase() + text.slice(1);
  return span;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: '2-digit' });
}

function addDt(dl, term, detail) {
  const dt = document.createElement('dt');
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = detail || '—';
  dl.appendChild(dt);
  dl.appendChild(dd);
}

function generateId() {
  const num = Math.max(...accounts.map(a => parseInt(a.id.replace(/\D/g, '')) || 0)) + 1;
  return `AD-${String(num).padStart(3, '0')}`;
}

// re-auth gate
function initReauth() {
  document.getElementById('reauth-modal').hidden = false;
  document.getElementById('reauth-password').focus();
}

function confirmReauth() {
  const val = document.getElementById('reauth-password').value;
  const err = document.getElementById('error-reauth-password');
  if (val !== REAUTH_PASSWORD) {
    err.hidden = false;
    document.getElementById('reauth-password').classList.add('field--invalid');
    return;
  }
  err.hidden = true;
  document.getElementById('reauth-modal').hidden = true;
  document.getElementById('main-content').hidden = false;
  render();
}

document.getElementById('reauth-confirm-btn').addEventListener('click', confirmReauth);
document.getElementById('reauth-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); confirmReauth(); }
});

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

// filters and pagination
function getFiltered() {
  const query  = document.getElementById('search-input').value.toLowerCase();
  const role   = document.getElementById('filter-role').value;
  const status = document.getElementById('filter-status').value;

  return accounts.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(query) || a.email.toLowerCase().includes(query);
    const matchesRole   = role   ? a.role   === role   : true;
    const matchesStatus = status ? a.status === status : true;
    return matchesSearch && matchesRole && matchesStatus;
  });
}

function getPage(list) {
  const start = (currentPage - 1) * PAGE_SIZE;
  return list.slice(start, start + PAGE_SIZE);
}

// render table
function render() {
  const filtered  = getFiltered();
  const paged     = getPage(filtered);
  const tbody     = document.getElementById('accounts-tbody');
  const table     = document.getElementById('accounts-table');
  const empty     = document.getElementById('accounts-empty');
  const noResults = document.getElementById('accounts-no-results');
  const pagination = document.getElementById('pagination');

  tbody.innerHTML = '';

  if (accounts.length === 0) {
    table.hidden = true; empty.hidden = false; noResults.hidden = true; pagination.hidden = true;
    return;
  }
  if (filtered.length === 0) {
    table.hidden = true; empty.hidden = true; noResults.hidden = false; pagination.hidden = true;
    return;
  }

  empty.hidden = true; noResults.hidden = true;
  table.hidden = false;

  paged.forEach(a => {
    const tr = document.createElement('tr');
    const roleLabel = a.role === 'superadmin' ? 'Super Admin' : 'Standard Admin';
    tr.innerHTML = `
      <td>${a.id}</td>
      <td>${a.name}</td>
      <td>${a.email}</td>
      <td>${roleLabel}</td>
      <td></td>
      <td>${formatDate(a.dateAdded)}</td>
      <td></td>
    `;
    tr.cells[4].appendChild(buildBadge(a.status, a.status));

    // actions cell
    const actions = tr.cells[6];
    if (a.locked) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-secondary';
      btn.textContent = 'System Locked';
      btn.disabled = true;
      actions.appendChild(btn);
    } else {
      actions.innerHTML = `
        <button type="button" class="btn-view btn-secondary" data-id="${a.id}">View</button>
        <button type="button" class="btn-edit btn-secondary" data-id="${a.id}">Edit</button>
        <button type="button" class="btn-reset btn-secondary" data-id="${a.id}">Reset Password</button>
        <button type="button" class="btn-deactivate btn-secondary" data-id="${a.id}">
          ${a.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
        </button>
      `;
    }

    tbody.appendChild(tr);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (totalPages > 1) {
    pagination.hidden = false;
    document.getElementById('pagination-label').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('btn-prev').disabled = currentPage === 1;
    document.getElementById('btn-next').disabled = currentPage === totalPages;
  } else {
    pagination.hidden = true;
  }
}

// view profile modal
function openProfileModal(id) {
  const a = accounts.find(x => x.id === id);
  if (!a) return;
  const dl = document.getElementById('profile-details');
  dl.innerHTML = '';
  addDt(dl, 'ID', a.id);
  addDt(dl, 'Name', a.name);
  addDt(dl, 'Email', a.email);
  addDt(dl, 'Role', a.role === 'superadmin' ? 'Super Admin' : 'Standard Admin');
  addDt(dl, 'Status', a.status);
  addDt(dl, 'Date Added', formatDate(a.dateAdded));
  document.getElementById('profile-modal-title').textContent = a.name;
  document.getElementById('profile-modal').hidden = false;
}

document.getElementById('profile-close-btn').addEventListener('click', () => {
  document.getElementById('profile-modal').hidden = true;
});

// add / edit modal
function clearAccountModal() {
  ['account-name', 'account-email', 'account-password'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('account-role').value = '';
  ['error-account-name', 'error-account-email', 'error-account-role', 'error-account-password'].forEach(id => {
    document.getElementById(id).hidden = true;
  });
}

function openAddModal() {
  editingId = null;
  clearAccountModal();
  document.getElementById('account-modal-title').textContent = 'Add Admin';
  document.getElementById('account-password-field').hidden = false;
  document.getElementById('account-modal').hidden = false;
  document.getElementById('account-name').focus();
}

function openEditModal(id) {
  const a = accounts.find(x => x.id === id);
  if (!a) return;
  editingId = id;
  clearAccountModal();
  document.getElementById('account-modal-title').textContent = 'Edit Admin';
  document.getElementById('account-name').value  = a.name;
  document.getElementById('account-email').value = a.email;
  document.getElementById('account-role').value  = a.role;
  document.getElementById('account-password-field').hidden = true;
  document.getElementById('account-modal').hidden = false;
  document.getElementById('account-name').focus();
}

function closeAccountModal() {
  document.getElementById('account-modal').hidden = true;
  editingId = null;
}

function saveAccount() {
  const isAdding = !editingId;
  const fields = [
    ['account-name',     'error-account-name',     v => !!v],
    ['account-email',    'error-account-email',     v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
    ['account-role',     'error-account-role',      v => !!v],
    ...(isAdding ? [['account-password', 'error-account-password', v => !!v]] : []),
  ];

  let valid = true;
  fields.forEach(([fieldId, errorId, check]) => {
    const el = document.getElementById(fieldId);
    const ok = check(el.value.trim());
    document.getElementById(errorId).hidden = ok;
    if (!ok) { el.classList.add('field--invalid'); valid = false; }
    else el.classList.remove('field--invalid');
  });
  if (!valid) return;

  const data = {
    name:  document.getElementById('account-name').value.trim(),
    email: document.getElementById('account-email').value.trim(),
    role:  document.getElementById('account-role').value,
  };

  if (editingId) {
    accounts = accounts.map(a => a.id === editingId ? { ...a, ...data } : a);
    showToast('Account updated.');
    // TODO: PUT /api/admins/:id
  } else {
    accounts.push({ id: generateId(), status: 'active', dateAdded: new Date().toISOString().slice(0, 10), locked: false, ...data });
    showToast('Admin account created.');
    // TODO: POST /api/admins
  }

  closeAccountModal();
  render();
}

document.getElementById('account-save-btn').addEventListener('click', saveAccount);
document.getElementById('account-cancel-btn').addEventListener('click', closeAccountModal);
document.getElementById('btn-add-account').addEventListener('click', openAddModal);

// reset password modal
function openResetModal(id) {
  const a = accounts.find(x => x.id === id);
  if (!a) return;
  resettingId = id;
  document.getElementById('reset-modal-name').textContent = a.name;
  document.getElementById('reset-password').value = '';
  document.getElementById('error-reset-password').hidden = true;
  document.getElementById('reset-modal').hidden = false;
  document.getElementById('reset-password').focus();
}

function closeResetModal() {
  document.getElementById('reset-modal').hidden = true;
  resettingId = null;
}

function confirmReset() {
  const val = document.getElementById('reset-password').value.trim();
  const err = document.getElementById('error-reset-password');
  if (!val) { err.hidden = false; return; }
  err.hidden = true;
  closeResetModal();
  showToast('Password reset successfully.');
  // TODO: PATCH /api/admins/:id/reset-password
}

document.getElementById('reset-confirm-btn').addEventListener('click', confirmReset);
document.getElementById('reset-cancel-btn').addEventListener('click', closeResetModal);

// deactivate / reactivate modal
function openDeactivateModal(id) {
  const a = accounts.find(x => x.id === id);
  if (!a) return;

  if (a.status === 'inactive') {
    openConfirmModal(`Reactivate ${a.name}'s account?`, () => {
      accounts = accounts.map(x => x.id === id ? { ...x, status: 'active' } : x);
      render();
      showToast('Account reactivated.');
      // TODO: PATCH /api/admins/:id/reactivate
    });
    return;
  }

  deactivatingId = id;
  document.getElementById('deactivate-modal-name').textContent = a.name;
  document.getElementById('deactivate-reason').value = '';
  document.getElementById('deactivate-notes').value  = '';
  document.getElementById('error-deactivate-reason').hidden = true;
  document.getElementById('deactivate-modal').hidden = false;
  document.getElementById('deactivate-reason').focus();
}

function closeDeactivateModal() {
  document.getElementById('deactivate-modal').hidden = true;
  deactivatingId = null;
}

function confirmDeactivate() {
  const reason = document.getElementById('deactivate-reason').value;
  document.getElementById('error-deactivate-reason').hidden = !!reason;
  if (!reason) return;
  accounts = accounts.map(a => a.id === deactivatingId ? { ...a, status: 'inactive' } : a);
  closeDeactivateModal();
  render();
  showToast('Account deactivated.');
  // TODO: PATCH /api/admins/:id/deactivate
}

document.getElementById('deactivate-confirm-btn').addEventListener('click', confirmDeactivate);
document.getElementById('deactivate-cancel-btn').addEventListener('click', closeDeactivateModal);

// event delegation
document.addEventListener('click', e => {
  if (e.target.matches('.btn-view'))       openProfileModal(e.target.dataset.id);
  if (e.target.matches('.btn-edit'))       openEditModal(e.target.dataset.id);
  if (e.target.matches('.btn-reset'))      openResetModal(e.target.dataset.id);
  if (e.target.matches('.btn-deactivate')) openDeactivateModal(e.target.dataset.id);
});

// filter listeners
document.getElementById('search-input').addEventListener('input',  () => { currentPage = 1; render(); });
document.getElementById('filter-role').addEventListener('change',   () => { currentPage = 1; render(); });
document.getElementById('filter-status').addEventListener('change', () => { currentPage = 1; render(); });
document.getElementById('btn-prev').addEventListener('click', () => { currentPage--; render(); });
document.getElementById('btn-next').addEventListener('click', () => { currentPage++; render(); });
document.getElementById('btn-retry-load').addEventListener('click', render);

// offline banner
const bannerOffline = document.getElementById('banner-offline');
window.addEventListener('offline', () => { bannerOffline.hidden = false; });
window.addEventListener('online',  () => { bannerOffline.hidden = true; });
if (!navigator.onLine) bannerOffline.hidden = false;

// logout
document.getElementById('logout-link').addEventListener('click', e => {
  e.preventDefault();
  window.location.href = '../public/index.html';
});

// init — show re-auth gate first, main content stays hidden until confirmed
initReauth();