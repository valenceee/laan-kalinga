(function () {

  // offline banner
  const bannerOffline = document.getElementById('banner-offline');
  window.addEventListener('offline', () => { bannerOffline.hidden = false; });
  window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
  if (!navigator.onLine) bannerOffline.hidden = false;


  // today's date display
  const todayDate = document.getElementById('today-date');
  const today = new Date();
  todayDate.textContent = today.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });


  // logout
  document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    // FIX: Redirect to the proper login.php handler instead of a dead HTML file
    window.location.href = '../public/login.php';
  });


  // load dashboard data (simulated: replace with actual fetch)
  function loadDashboardData() {
    document.getElementById('banner-load-error').hidden = true;

    // simulated response
    const data = {
      staffName: 'Maria Santos',
      pending: 12,
      scheduledToday: 8,
      flagged: 3,
      urgentActions: [
        { label: 'Review 3 new flagged cases from volunteers', href: 'flagged.html' },
        { label: 'Assign volunteers to 5 approved visit requests', href: 'appointments.html' }
      ]
    };

    renderDashboard(data);
  }

  function renderDashboard(data) {
    document.getElementById('staff-name').textContent = data.staffName;
    document.getElementById('stat-pending').textContent = data.pending;
    document.getElementById('stat-today').textContent = data.scheduledToday;
    document.getElementById('stat-flagged').textContent = data.flagged;

    const statsEmpty = document.getElementById('stats-empty');
    const hasStats = data.pending > 0 || data.scheduledToday > 0 || data.flagged > 0;
    statsEmpty.hidden = hasStats;

    const list = document.getElementById('urgent-actions-list');
    const empty = document.getElementById('urgent-actions-empty');
    list.innerHTML = '';

    if (!data.urgentActions || data.urgentActions.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    data.urgentActions.forEach(action => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = action.href;
      a.textContent = action.label;
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  document.getElementById('btn-retry-load').addEventListener('click', loadDashboardData);

  loadDashboardData();

})();