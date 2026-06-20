// data
const FLAGGED_CASES = [
  {
    id: 1,
    dateFlagged: 'June 12, 2026',
    reportedBy: 'Ana Garcia (Volunteer)',
    seniorName: 'Juan Dela Cruz',
    reason: 'Needs Medicine Refill (Amlodipine)',
    status: 'pending_review',
  },
  {
    id: 2,
    dateFlagged: 'June 11, 2026',
    reportedBy: 'Luis Torres (Volunteer)',
    seniorName: 'Maria Santos',
    reason: 'Wheelchair damaged, needs replacement',
    status: 'under_review',
  },
];

const ACTION_LABELS = {
  mark_resolved: 'Resolved',
  refer_medical: 'Referred to Medical Team',
  refer_admin:   'Referred to Admin',
  other: 'Flagged for Further Review',
};

// state
let cases = [...FLAGGED_CASES];
let pendingActionId = null;
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

document.getElementById('action-select').addEventListener('change', () => {
  const isOther = document.getElementById('action-select').value === 'other';
  document.getElementById('action-other-input').hidden = !isOther;
});

document.getElementById('confirm-modal-yes').addEventListener('click', () => {
  if (pendingConfirmAction) pendingConfirmAction();
  closeConfirmModal();
});
document.getElementById('confirm-modal-no').addEventListener('click', closeConfirmModal);


// helpers
function buildBadge(status) {
  const labels = {
    pending_review: 'Pending Review',
    under_review:   'Under Review',
    mark_resolved:  'Resolved',
    refer_medical:  'Referred – Medical',
    refer_admin:    'Referred – Admin',
  };
  const span = document.createElement('span');
  span.className = `badge badge--${status.replace(/_/g, '-')}`;
  span.textContent = labels[status] || status;
  return span;
}

function isResolved(c) {
  return ['mark_resolved', 'refer_medical', 'refer_admin'].includes(c.status);
}


// render: active (pending_review / under_review)
function renderActive() {
  const active = cases.filter(c => !isResolved(c));
  const tbody  = document.getElementById('flags-tbody');
  const table  = document.getElementById('flags-table');
  const empty  = document.getElementById('flags-empty');

  tbody.innerHTML = '';

  if (active.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  active.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.dateFlagged}</td>
      <td>${c.reportedBy}</td>
      <td>${c.seniorName}</td>
      <td>${c.reason}</td>
      <td></td>
      <td>
        <button class="btn-action" data-id="${c.id}">Take Action</button>
      </td>
    `;
    tr.cells[4].appendChild(buildBadge(c.status));
    tbody.appendChild(tr);
  });
}


// render: resolved
function renderResolved() {
  const resolved = cases.filter(isResolved);
  const tbody    = document.getElementById('resolved-tbody');
  const table    = document.getElementById('resolved-table');
  const empty    = document.getElementById('resolved-empty');

  tbody.innerHTML = '';

  if (resolved.length === 0) {
    table.hidden = true; empty.hidden = false;
    return;
  }
  empty.hidden = true;
  table.hidden = false;

  resolved.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.dateFlagged}</td>
      <td>${c.reportedBy}</td>
      <td>${c.seniorName}</td>
      <td>${c.reason}</td>
      <td></td>
    `;
    tr.cells[4].appendChild(buildBadge(c.status));
    tbody.appendChild(tr);
  });
}


function render() {
  renderActive();
  renderResolved();
}


// action modal
function openActionModal(id) {
  const c = cases.find(c => c.id === id);
  if (!c) return;
  pendingActionId = id;
  document.getElementById('action-modal-desc').textContent =
    `${c.seniorName} — ${c.reason}`;
  document.getElementById('action-select').value = '';
  document.getElementById('error-action-select').hidden = true;
  document.getElementById('action-modal').hidden = false;
  document.getElementById('action-select').focus();
}

function closeActionModal() {
  pendingActionId = null;
  document.getElementById('action-modal').hidden = true;
  document.getElementById('action-other-input').value = '';
  document.getElementById('action-other-input').hidden = true;
  document.getElementById('error-action-other').hidden = true;
}

function confirmAction() {
  const action = document.getElementById('action-select').value;
  if (!action) {
    document.getElementById('error-action-select').hidden = false;
    return;
  }

    if (action === 'other') {
    const note = document.getElementById('action-other-input').value.trim();
    if (!note) {
        document.getElementById('error-action-other').hidden = false;
        return;
    }
    }

  const label = ACTION_LABELS[action] || action;
  openConfirmModal(`Submit action: "${label}"?`, () => {
    cases = cases.map(c =>
      c.id === pendingActionId ? { ...c, status: action } : c 
    );
    closeActionModal();
    render();
    showToast(`Action submitted: ${label}.`);
    // TODO: POST /api/flagged/action
  });
}


// event listeners
document.addEventListener('click', e => {
  if (e.target.matches('.btn-action'))       openActionModal(Number(e.target.dataset.id));
  if (e.target.matches('#action-confirm-btn')) confirmAction();
  if (e.target.matches('#action-cancel-btn'))  closeActionModal();
});

document.getElementById('btn-retry-load').addEventListener('click', render);

// init
render();