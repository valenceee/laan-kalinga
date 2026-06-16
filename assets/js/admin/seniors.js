// data
const SENIORS = [
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    dob: '1950-03-12',
    gender: 'Male',
    barangay: 'Bagong Pag-Asa',
    address: '123 Sampaguita St.',
    phone: '09171112222',
    philsys: '1234-5678-9012-3456',
    conditions: 'Hypertension, Type 2 Diabetes',
    emergencyContact: { name: 'Maria Dela Cruz', phone: '09179998888' },
    linkedReps: ['Maria Dela Cruz (Anak)'],
    status: 'active',
    flag: null,
  },
  {
    id: 2,
    firstName: 'Rosa',
    lastName: 'Mendoza',
    dob: '1945-07-22',
    gender: 'Female',
    barangay: 'Batasan Hills',
    address: '45 Rosal Ave.',
    phone: '09209991111',
    philsys: '',
    conditions: 'Arthritis',
    emergencyContact: { name: 'Jose Mendoza', phone: '09171234567' },
    linkedReps: [],
    status: 'pending',
    flag: { type: 'philsys-pending', reason: 'PhilSys ID not provided during registration. Volunteer to verify on next visit.' },
  },
  {
    id: 3,
    firstName: 'Pedro',
    lastName: 'Reyes',
    dob: '1948-11-05',
    gender: 'Male',
    barangay: 'Commonwealth',
    address: '78 Ilang-Ilang St.',
    phone: '09181234567',
    philsys: '9876-5432-1098-7654',
    conditions: 'COPD',
    emergencyContact: { name: 'Ana Reyes', phone: '09271234567' },
    linkedReps: ['Ana Reyes (Anak)', 'Carlo Reyes (Apo)'],
    status: 'flagged',
    flag: { type: 'medical-concern', reason: 'Volunteer reported difficulty breathing during last visit. Needs follow-up from staff.' },
  },
];

const FAMILY_REPS = [
  { id: 'r1', name: 'Maria Dela Cruz', email: 'maria@email.com', relationship: 'Anak' },
  { id: 'r2', name: 'Jose Santos',     email: 'jose@email.com',  relationship: 'Asawa' },
  { id: 'r3', name: 'Ana Reyes',       email: 'ana@email.com',   relationship: 'Anak' },
];

const qcBarangays = [
  'Alicia', 'Amihan', 'Apolonio Samson', 'Aurora', 'Baesa', 'Bagbag',
  'Bagong Buhay', 'Bagong Pag-Asa', 'Bagong Silangan', 'Bagong Silang',
  'Bagumbayan', 'Bagumbuhay', 'Bahay Toro', 'Balingasa', 'Balintawak',
  'Batasan Hills', 'Bayanihan', 'Blue Ridge A', 'Blue Ridge B',
  'Botocan', 'Bungad', 'Camp Aguinaldo', 'Capri', 'Central',
  'Claro', 'Commonwealth', 'Culiat', 'Damar', 'Damayan',
  'Damayan Lagi', 'Dangwa', 'Del Monte', 'Dioquino Zobel',
  'Don Manuel', 'Doña Aurora', 'Doña Imelda', 'Doña Josefa',
  'Duyan-Duyan', 'E. Rodriguez', 'East Kamias', 'Escopa I',
  'Escopa II', 'Escopa III', 'Escopa IV', 'Fairview', 'Greater Lagro',
  'Gulod', 'Holy Spirit', 'Horseshoe', 'Immaculate Concepcion',
  'Kaligayahan', 'Kalusugan', 'Kamuning', 'Katipunan', 'Kaunlaran',
  'Kristong Hari', 'Krus na Ligas', 'Laging Handa', 'Libis',
  'Lourdes', 'Loyola Heights', 'Lucban', 'Luzviminda',
  'Maharlika', 'Malaya', 'Mangga', 'Manresa', 'Mariana',
  'Mariblo', 'Marilag', 'Masagana', 'Masambong', 'Matandang Balara',
  'Milagrosa', 'Model', 'Nagkaisang Nayon', 'Nayong Kanluran',
  'New Era', 'North Fairview', 'Novaliches Proper', 'Obrero',
  'Old Capitol Site', 'Paang Bundok', 'Pag-Ibig sa Nayon',
  'Paligsahan', 'Paltok', 'Pansol', 'Paraiso', 'Pasong Putik Proper',
  'Pasong Tamo', 'Payatas', 'Phil-Am', 'Pinagkaisahan', 'Pinyahan',
  'Pitogo', 'Plaridel', 'Poblacion', 'Project 6', 'Pugad Lawin',
  'Quezon City Proper', 'Quirino 2-A', 'Quirino 2-B', 'Quirino 2-C',
  'Quirino 3-A', 'Ramon Magsaysay', 'Roxas', 'Sacred Heart',
  'Saint Ignatius', 'Saint Peter', 'Salvacion', 'San Agustin',
  'San Antonio', 'San Bartolome', 'San Isidro', 'San Isidro Labrador',
  'San Jose', 'San Martin de Porres', 'San Roque', 'San Vicente',
  'Sangandaan', 'Santa Cruz', 'Santa Lucia', 'Santa Monica',
  'Santa Teresita', 'Santo Cristo', 'Santo Niño', 'Santol',
  'Sauyo', 'Siena', 'Sikatuna Village', 'Silangan', 'Socorro',
  'South Triangle', 'Tagumpay', 'Talayan', 'Talipapa',
  'Tandang Sora', 'Tatalon', 'Teacher\'s Village East',
  'Teacher\'s Village West', 'Ugong Norte', 'Unang Sigaw',
  'UP Campus', 'UP Village', 'Vasra', 'Veterans Village',
  'Villa Maria Clara', 'West Kamias', 'West Triangle', 'White Plains'
];

const PAGE_SIZE = 10;

// state
let seniors = [...SENIORS];
let currentPage = 1;
let pendingConfirmAction = null;
let editingId = null;
let linkingSeniorId = null;
let flaggingSeniorId = null;
let deactivatingId = null;

// helpers
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3000);
}

function buildBadge(status) {
  const span = document.createElement('span');
  span.className = `badge badge--${status}`;
  span.textContent = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  return span;
}

function calcAge(dob) {
  const today = new Date();
  const d = new Date(dob + 'T00:00:00');
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function validatePhone(val) {
  return /^09\d{9}$/.test(val.replace(/\s/g, ''));
}

function validateDob(val) {
  if (!val) return false;
  const age = calcAge(val);
  return age >= 50 && age <= 110;
}

function addDt(dl, term, detail) {
  const dt = document.createElement('dt');
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = detail || '—';
  dl.appendChild(dt);
  dl.appendChild(dd);
}

function populateBarangayFilters() {
  const filterSelect = document.getElementById('filter-barangay');
  const modalDatalist = document.getElementById('modal-barangay-list');

  qcBarangays.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b; 
    filterSelect.appendChild(opt);
    modalDatalist.appendChild(opt.cloneNode(true));
  });
}

// filter pagination
function getFiltered() {
  const query     = document.getElementById('search-input').value.toLowerCase();
  const barangay  = document.getElementById('filter-barangay').value;
  const status    = document.getElementById('filter-status').value;

  return seniors.filter(s => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch   = name.includes(query);
    const matchesBarangay = barangay ? s.barangay === barangay : true;
    const matchesStatus   = status   ? s.status   === status   : true;
    return matchesSearch && matchesBarangay && matchesStatus;
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
  const tbody     = document.getElementById('seniors-tbody');
  const table     = document.getElementById('seniors-table');
  const empty     = document.getElementById('seniors-empty');
  const noResults = document.getElementById('seniors-no-results');
  const pagination = document.getElementById('pagination');

  tbody.innerHTML = '';

  if (seniors.length === 0) {
    table.hidden = true; empty.hidden = false; noResults.hidden = true; pagination.hidden = true;
    return;
  }
  if (filtered.length === 0) {
    table.hidden = true; empty.hidden = true; noResults.hidden = false; pagination.hidden = true;
    return;
  }

  empty.hidden = true; noResults.hidden = true;
  table.hidden = false;

  paged.forEach(s => {
    const tr = document.createElement('tr');
    const reps = s.linkedReps.length ? s.linkedReps.join(', ') : '—';
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>
        ${s.firstName} ${s.lastName}
        ${s.flag ? '<span class="flag-dot" title="Flagged">⚑</span>' : ''}
      </td>
      <td>${calcAge(s.dob)}</td>
      <td>${s.barangay}</td>
      <td>${s.phone}</td>
      <td>${reps}</td>
      <td></td>
      <td>
        <button class="btn-view-profile btn-secondary" data-id="${s.id}">View</button>
        <button class="btn-edit-senior btn-secondary" data-id="${s.id}">Edit</button>
        <button class="btn-link-rep btn-secondary" data-id="${s.id}">Reps</button>
        <button class="btn-flag btn-secondary" data-id="${s.id}">${s.flag ? 'Unflag' : 'Flag'}</button>
        <button class="btn-deactivate btn-secondary" data-id="${s.id}">
          ${s.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
        </button>
      </td>
    `;
    tr.cells[6].appendChild(buildBadge(s.status));
    tbody.appendChild(tr);
  });

  // pagination
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

// view profile modal
function openProfileModal(id) {
  const s = seniors.find(x => x.id === id);
  if (!s) return;

  document.getElementById('profile-modal-title').textContent = `${s.firstName} ${s.lastName}`;

  const personal = document.getElementById('profile-personal');
  personal.innerHTML = '';
  addDt(personal, 'Date of Birth', s.dob);
  addDt(personal, 'Age', calcAge(s.dob));
  addDt(personal, 'Sex', s.gender);
  addDt(personal, 'Barangay', s.barangay);
  addDt(personal, 'Address', s.address);
  addDt(personal, 'Contact', s.phone);
  addDt(personal, 'PhilSys ID', s.philsys || 'Pending verification');

  const health = document.getElementById('profile-health');
  health.innerHTML = '';
  addDt(health, 'Chronic Conditions', s.conditions || 'None on record');

  const emergency = document.getElementById('profile-emergency');
  emergency.innerHTML = '';
  addDt(emergency, 'Name', s.emergencyContact.name);
  addDt(emergency, 'Phone', s.emergencyContact.phone);

  const repList = document.getElementById('profile-reps');
  repList.innerHTML = '';
  if (s.linkedReps.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No linked representatives.';
    repList.appendChild(li);
  } else {
    s.linkedReps.forEach(r => {
      const li = document.createElement('li');
      li.textContent = r;
      repList.appendChild(li);
    });
  }

  const flagIndicator = document.getElementById('profile-flag-indicator');
  if (s.flag) {
    document.getElementById('profile-flag-reason').textContent =
      `⚑ ${s.flag.type.replace(/-/g, ' ')}: ${s.flag.reason}`;
    flagIndicator.hidden = false;
  } else {
    flagIndicator.hidden = true;
  }

  document.getElementById('profile-modal').hidden = false;
}

document.getElementById('profile-close-btn').addEventListener('click', () => {
  document.getElementById('profile-modal').hidden = true;
});

// add/edit senior modal
function clearSeniorModal() {
  ['senior-first-name','senior-last-name','senior-barangay','senior-address',
   'senior-phone','senior-philsys','senior-conditions',
   'senior-emergency-name','senior-emergency-phone'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('senior-dob').value = '';
  document.getElementById('senior-gender').value = '';
  ['error-senior-first-name','error-senior-last-name','error-senior-dob',
   'error-senior-gender','error-senior-barangay','error-senior-address',
   'error-senior-phone','error-senior-emergency-name',
   'error-senior-emergency-phone'].forEach(id => {
    document.getElementById(id).hidden = true;
  });
}

function openAddSeniorModal() {
  editingId = null;
  clearSeniorModal();
  document.getElementById('senior-modal-title').textContent = 'Add Senior';
  document.getElementById('senior-modal').hidden = false;
  document.getElementById('senior-first-name').focus();
}

function openEditSeniorModal(id) {
  const s = seniors.find(x => x.id === id);
  if (!s) return;
  editingId = id;
  clearSeniorModal();
  document.getElementById('senior-modal-title').textContent = 'Edit Senior';
  document.getElementById('senior-first-name').value       = s.firstName;
  document.getElementById('senior-last-name').value        = s.lastName;
  document.getElementById('senior-dob').value              = s.dob;
  document.getElementById('senior-gender').value           = s.gender.toLowerCase();
  document.getElementById('senior-barangay').value         = s.barangay;
  document.getElementById('senior-address').value          = s.address;
  document.getElementById('senior-phone').value            = s.phone;
  document.getElementById('senior-philsys').value          = s.philsys || '';
  document.getElementById('senior-conditions').value       = s.conditions || '';
  document.getElementById('senior-emergency-name').value   = s.emergencyContact.name;
  document.getElementById('senior-emergency-phone').value  = s.emergencyContact.phone;
  document.getElementById('senior-modal').hidden = false;
  document.getElementById('senior-first-name').focus();
}

function closeSeniorModal() {
  document.getElementById('senior-modal').hidden = true;
  editingId = null;
}

function saveSenior() {
  const fields = [
    ['senior-first-name',     'error-senior-first-name',     v => !!v],
    ['senior-last-name',      'error-senior-last-name',      v => !!v],
    ['senior-dob',            'error-senior-dob',            v => validateDob(v)],
    ['senior-gender',         'error-senior-gender',         v => !!v],
    ['senior-barangay',       'error-senior-barangay',       v => !!v],
    ['senior-address',        'error-senior-address',        v => !!v],
    ['senior-phone',          'error-senior-phone',          v => validatePhone(v)],
    ['senior-emergency-name', 'error-senior-emergency-name', v => !!v],
    ['senior-emergency-phone','error-senior-emergency-phone',v => validatePhone(v)],
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
    firstName:        document.getElementById('senior-first-name').value.trim(),
    lastName:         document.getElementById('senior-last-name').value.trim(),
    dob:              document.getElementById('senior-dob').value,
    gender:           document.getElementById('senior-gender').value,
    barangay:         document.getElementById('senior-barangay').value.trim(),
    address:          document.getElementById('senior-address').value.trim(),
    phone:            document.getElementById('senior-phone').value.trim(),
    philsys:          document.getElementById('senior-philsys').value.trim(),
    conditions:       document.getElementById('senior-conditions').value.trim(),
    emergencyContact: {
      name:  document.getElementById('senior-emergency-name').value.trim(),
      phone: document.getElementById('senior-emergency-phone').value.trim(),
    },
  };

  if (editingId) {
    seniors = seniors.map(s => s.id === editingId ? { ...s, ...data } : s);
    showToast('Senior record updated.');
    // TODO: PUT /api/seniors/:id
  } else {
    const newId = Math.max(...seniors.map(s => s.id)) + 1;
    seniors.push({ id: newId, linkedReps: [], status: 'pending', flag: null, ...data });
    showToast('Senior added.');
    // TODO: POST /api/seniors
  }

  closeSeniorModal();
  render();
}

document.getElementById('senior-save-btn').addEventListener('click', saveSenior);
document.getElementById('senior-cancel-btn').addEventListener('click', closeSeniorModal);

// link/unlink fam reps
function openLinkModal(id) {
  linkingSeniorId = id;
  const s = seniors.find(x => x.id === id);
  if (!s) return;

  document.getElementById('link-modal-senior-name').textContent = `${s.firstName} ${s.lastName}`;
  document.getElementById('link-search').value = '';
  document.getElementById('link-search-results').innerHTML = '';
  document.getElementById('link-no-results').hidden = true;

  renderLinkedReps(s);
  document.getElementById('link-modal').hidden = false;
}

function renderLinkedReps(s) {
  const list  = document.getElementById('link-current-list');
  const empty = document.getElementById('link-empty');
  list.innerHTML = '';

  if (s.linkedReps.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  s.linkedReps.forEach((rep, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${rep}
      <button type="button" class="btn-unlink-rep btn-secondary" data-index="${i}">Unlink</button>
    `;
    list.appendChild(li);
  });
}

function searchReps() {
  const query   = document.getElementById('link-search').value.toLowerCase();
  const results = document.getElementById('link-search-results');
  const noRes   = document.getElementById('link-no-results');
  results.innerHTML = '';

  if (!query) return;

  const matches = FAMILY_REPS.filter(r =>
    r.name.toLowerCase().includes(query) || r.email.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    noRes.hidden = false;
    return;
  }
  noRes.hidden = true;

  matches.forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${r.name} (${r.email})
      <button type="button" class="btn-link-add btn-primary" data-id="${r.id}">Link</button>
    `;
    results.appendChild(li);
  });
}

document.getElementById('link-search-btn').addEventListener('click', searchReps);
document.getElementById('link-search').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); searchReps(); }
});

document.getElementById('link-current-list').addEventListener('click', e => {
  if (!e.target.matches('.btn-unlink-rep')) return;
  const index = Number(e.target.dataset.index);
  const s = seniors.find(x => x.id === linkingSeniorId);
  openConfirmModal(`Unlink "${s.linkedReps[index]}" from ${s.firstName} ${s.lastName}?`, () => {
    s.linkedReps.splice(index, 1);
    renderLinkedReps(s);
    render();
    showToast('Representative unlinked.');
    // TODO: DELETE /api/seniors/:id/reps/:repId
  });
});

document.getElementById('link-search-results').addEventListener('click', e => {
  if (!e.target.matches('.btn-link-add')) return;
  const repId = e.target.dataset.id;
  const rep   = FAMILY_REPS.find(r => r.id === repId);
  const s     = seniors.find(x => x.id === linkingSeniorId);
  const label = `${rep.name} (${rep.relationship})`;
  if (s.linkedReps.includes(label)) {
    showToast('This representative is already linked.');
    return;
  }
  s.linkedReps.push(label);
  renderLinkedReps(s);
  render();
  showToast(`${rep.name} linked.`);
  // TODO: POST /api/seniors/:id/reps
});

document.getElementById('link-close-btn').addEventListener('click', () => {
  document.getElementById('link-modal').hidden = true;
  linkingSeniorId = null;
});

// flag modal
function openFlagModal(id) {
  const s = seniors.find(x => x.id === id);
  if (!s) return;

  if (s.flag) {
    openConfirmModal(`Remove flag from ${s.firstName} ${s.lastName}?`, () => {
      seniors = seniors.map(x => x.id === id
        ? { ...x, flag: null, status: x.status === 'flagged' ? 'active' : x.status }
        : x
      );
      render();
      showToast('Flag removed.');
      // TODO: DELETE /api/seniors/:id/flag
    });
    return;
  }

  flaggingSeniorId = id;
  document.getElementById('flag-modal-senior-name').textContent = `${s.firstName} ${s.lastName}`;
  document.getElementById('flag-type').value   = '';
  document.getElementById('flag-reason').value = '';
  document.getElementById('error-flag-type').hidden   = true;
  document.getElementById('error-flag-reason').hidden = true;
  document.getElementById('flag-modal').hidden = false;
  document.getElementById('flag-type').focus();
}

function confirmFlag() {
  const type   = document.getElementById('flag-type').value;
  const reason = document.getElementById('flag-reason').value.trim();
  let valid = true;

  document.getElementById('error-flag-type').hidden   = !!type;
  document.getElementById('error-flag-reason').hidden = !!reason;
  if (!type || !reason) valid = false;
  if (!valid) return;

  seniors = seniors.map(s => s.id === flaggingSeniorId
    ? { ...s, flag: { type, reason }, status: 'flagged' }
    : s
  );
  document.getElementById('flag-modal').hidden = true;
  flaggingSeniorId = null;
  render();
  showToast('Senior record flagged.');
  // TODO: POST /api/seniors/:id/flag
}

document.getElementById('flag-confirm-btn').addEventListener('click', confirmFlag);
document.getElementById('flag-cancel-btn').addEventListener('click', () => {
  document.getElementById('flag-modal').hidden = true;
  flaggingSeniorId = null;
});

// deact/react modal
function openDeactivateModal(id) {
  const s = seniors.find(x => x.id === id);
  if (!s) return;

  if (s.status === 'inactive') {
    openConfirmModal(`Reactivate ${s.firstName} ${s.lastName}'s record?`, () => {
      seniors = seniors.map(x => x.id === id ? { ...x, status: 'active' } : x);
      render();
      showToast('Senior record reactivated.');
      // TODO: PATCH /api/seniors/:id/reactivate
    });
    return;
  }

  deactivatingId = id;
  document.getElementById('deactivate-modal-title').textContent = `Deactivate Record`;
  document.getElementById('deactivate-modal-senior-name').textContent = `${s.firstName} ${s.lastName}`;
  document.getElementById('deactivate-reason-type').value = '';
  document.getElementById('deactivate-notes').value       = '';
  document.getElementById('error-deactivate-reason-type').hidden = true;
  document.getElementById('deactivate-modal').hidden = false;
  document.getElementById('deactivate-reason-type').focus();
}

function confirmDeactivate() {
  const reasonType = document.getElementById('deactivate-reason-type').value;
  document.getElementById('error-deactivate-reason-type').hidden = !!reasonType;
  if (!reasonType) return;

  seniors = seniors.map(s => s.id === deactivatingId ? { ...s, status: 'inactive' } : s);
  document.getElementById('deactivate-modal').hidden = true;
  deactivatingId = null;
  render();
  showToast('Senior record deactivated.');
  // TODO: PATCH /api/seniors/:id/deactivate
}

document.getElementById('deactivate-confirm-btn').addEventListener('click', confirmDeactivate);
document.getElementById('deactivate-cancel-btn').addEventListener('click', () => {
  document.getElementById('deactivate-modal').hidden = true;
  deactivatingId = null;
});

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

// event delegation
document.addEventListener('click', e => {
  if (e.target.matches('.btn-view-profile'))  openProfileModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-edit-senior'))   openEditSeniorModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-link-rep'))      openLinkModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-flag'))          openFlagModal(Number(e.target.dataset.id));
  if (e.target.matches('.btn-deactivate'))    openDeactivateModal(Number(e.target.dataset.id));
});

document.getElementById('btn-add-senior').addEventListener('click', openAddSeniorModal);
document.getElementById('btn-retry-load').addEventListener('click', render);
document.getElementById('btn-prev').addEventListener('click', () => { currentPage--; render(); });
document.getElementById('btn-next').addEventListener('click', () => { currentPage++; render(); });

document.getElementById('search-input').addEventListener('input',  () => { currentPage = 1; render(); });
document.getElementById('filter-barangay').addEventListener('change', () => { currentPage = 1; render(); });
document.getElementById('filter-status').addEventListener('change',   () => { currentPage = 1; render(); });

// init
populateBarangayFilters();
render();