(function () {

  // offline banner
  const bannerOffline = document.getElementById('banner-offline');
  window.addEventListener('offline', () => { bannerOffline.hidden = false; });
  window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
  if (!navigator.onLine) bannerOffline.hidden = false;


  // session expired banner
  const params = new URLSearchParams(window.location.search);
  if (params.get('reason') === 'session-expired') {
    document.getElementById('banner-session').hidden = false;
  }


  // dynamic dashboard link based on role
  const userRole = sessionStorage.getItem('userRole'); // 'senior' or 'family'
  const dashboardPath = '../senior/dashboard.html';
  const navDashboardLink = document.getElementById('nav-dashboard-link');
  if (navDashboardLink) navDashboardLink.href = dashboardPath;


  // zoom controls
  const root = document.documentElement;
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN  = 0.8;
  const ZOOM_MAX  = 1.6;
  const ZOOM_KEY  = 'laankalinga-zoom';

  function applyZoom(level) {
    root.style.fontSize = `${level * 100}%`;
    localStorage.setItem(ZOOM_KEY, level);
}

  let currentZoom = parseFloat(localStorage.getItem(ZOOM_KEY)) || 1;
  applyZoom(currentZoom);

  document.getElementById('zoom-in').addEventListener('click', () => {
    currentZoom = Math.min(ZOOM_MAX, currentZoom + ZOOM_STEP);
    applyZoom(currentZoom);
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    currentZoom = Math.max(ZOOM_MIN, currentZoom - ZOOM_STEP);
    applyZoom(currentZoom);
  });

  document.getElementById('zoom-reset').addEventListener('click', () => {
    currentZoom = 1;
    applyZoom(currentZoom);
  });


  // logout
  document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem(ZOOM_KEY);
    sessionStorage.removeItem('userRole');
    // FIX: Redirect to the updated login.php file
    window.location.href = '../public/login.php';
  });


  // simulated visit history — replace with actual fetch
  const visits = [
    {
      id: 'v001',
      date: '2026-06-10',
      service: 'Pagsukat ng Presyon / Blood Pressure Check',
      location: 'Sa Tahanan / Home Visit',
      volunteer: 'Maria Santos',
      status: 'completed',
      notes: 'Normal ang presyon. Ipagpatuloy ang gamot.',
      followUp: 'Susunod na bisita sa loob ng 2 linggo.'
    },
    {
      id: 'v002',
      date: '2026-06-15',
      service: 'Pangkalahatang Pagsusuri / General Check-up',
      location: 'Sa Tahanan / Home Visit',
      volunteer: 'Jose Reyes',
      status: 'ongoing',
      notes: '',
      followUp: ''
    },
    {
      id: 'v003',
      date: '2026-06-20',
      service: 'Pagkuha ng Gamot / Medicine Pick-up',
      location: 'Barangay Health Center',
      volunteer: '',
      status: 'ongoing',
      notes: '',
      followUp: ''
    },
    {
      id: 'v004',
      date: '2026-05-28',
      service: 'Bakuna / Vaccination',
      location: 'Barangay Health Center',
      volunteer: '',
      status: 'completed',
      notes: '',
      cancelReason: 'Walang available na volunteer sa araw na iyon.',
      cancelDate: '2026-05-27',
      rebooked: 'v002'
    }
  ];


  // labels
  const statusLabels = {
    completed: 'Tapos na / Completed',
    ongoing:   'Kasalukuyang nangyayari / Ongoing'
  };


  // render cards
  const historyList    = document.getElementById('history-list');
  const emptyAll       = document.getElementById('history-empty');
  const emptyFiltered  = document.getElementById('history-no-results');
  const statusFilter   = document.getElementById('status-filter');

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function renderCards() {
    const filter = statusFilter.value;
    historyList.innerHTML = '';

    if (visits.length === 0) {
      emptyAll.hidden = false;
      emptyFiltered.hidden = true;
      return;
    }
    emptyAll.hidden = true;

    // sort most recent first
    const sorted = [...visits].sort((a, b) => new Date(b.date) - new Date(a.date));

    const filtered = filter === 'all'
      ? sorted
      : sorted.filter(v => v.status === filter);

    if (filtered.length === 0) {
      emptyFiltered.hidden = false;
      return;
    }
    emptyFiltered.hidden = true;

    filtered.forEach(visit => {
      const card = document.createElement('div');
      card.classList.add('history-card', `history-card--${visit.status}`);

      card.innerHTML = `
        <p class="history-card__date">${formatDate(visit.date)}</p>
        <p><strong>Serbisyo / Service:</strong> ${visit.service}</p>
        <p><strong>Lugar / Location:</strong> ${visit.location}</p>
        ${visit.volunteer ? `<p><strong>Boluntaryo / Volunteer:</strong> ${visit.volunteer}</p>` : ''}
        <p><span class="status-badge status-badge--${visit.status}">${statusLabels[visit.status]}</span></p>
      `;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('btn-secondary');
      btn.textContent = 'Tingnan ang Detalye / View Notes';
      btn.addEventListener('click', () => openNotesModal(visit));

      card.appendChild(btn);
      historyList.appendChild(card);
    });
  }

  statusFilter.addEventListener('change', renderCards);
  renderCards();


  // notes modal
  const notesModal = document.getElementById('notes-modal');
  const notesBody  = document.getElementById('notes-body');

  function openNotesModal(visit) {
    let html = `
      <p><strong>Petsa / Date:</strong> ${formatDate(visit.date)}</p>
      <p><strong>Serbisyo / Service:</strong> ${visit.service}</p>
      <p><strong>Lugar / Location:</strong> ${visit.location}</p>
    `;

    if (visit.volunteer) {
      html += `<p><strong>Boluntaryo / Volunteer:</strong> ${visit.volunteer}</p>`;
    }

    html += `<p><strong>Status:</strong> ${statusLabels[visit.status]}</p>`;

    if (visit.status === 'completed') {
      html += `
        <h4>Tala ng Boluntaryo <small>Volunteer Notes</small></h4>
        <p>${visit.notes || 'Walang tala. / No notes provided.'}</p>
      `;
      if (visit.followUp) {
        html += `
          <h4>Susunod na Hakbang <small>Follow-up</small></h4>
          <p>${visit.followUp}</p>
        `;
      }
    }

    if (visit.status === 'cancelled') {
      html += `
        <h4>Dahilan ng Kanselasyon <small>Reason for Cancellation</small></h4>
        <p>${visit.cancelReason || 'Walang nakalagay na dahilan. / No reason provided.'}</p>
        <p><strong>Petsa ng Kanselasyon / Cancelled on:</strong> ${visit.cancelDate ? formatDate(visit.cancelDate) : '—'}</p>
      `;
      if (visit.rebooked) {
        html += `<p>May bagong iskedyul na ginawa para sa request na ito. <small>A new visit was scheduled to replace this one.</small></p>`;
      }
    }

    notesBody.innerHTML = html;
    notesModal.hidden = false;
    document.getElementById('btn-notes-close').focus();
  }

  document.getElementById('btn-notes-close').addEventListener('click', () => {
    notesModal.hidden = true;
  });

})();