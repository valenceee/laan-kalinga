(function () {

  // offline / session banners 

  const bannerOffline = document.getElementById('banner-offline');
  window.addEventListener('offline', () => { bannerOffline.hidden = false; });
  window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
  if (!navigator.onLine) bannerOffline.hidden = false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('reason') === 'session-expired') {
    document.getElementById('banner-session').hidden = false;
  }


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

  document.getElementById('logout-link').addEventListener('click', e => {
    e.preventDefault();
    // TODO: POST /api/logout, then redirect
    window.location.href = '../../pages/public/login.html';
  });


  /*  simulated data 
     TODO: replace with actual fetch from GET /api/me
     Expected shape:
     {
       role: 'senior' | 'family',
       name: string,
       linkedSeniors: [
         { id: string, name: string, appointment: { ... } | null }
       ]
     }
  */

  const currentUser = {
    role: 'family',
    name: 'Laura Florante',
    linkedSeniors: [
      {
        id: 's001',
        name: 'Lauro Florante',
        appointment: {
          date:           'Lunes, Hunyo 15, 2026',
          isoDate:        '2026-06-15',
          time:           '9:00 AM',
          service:        'Pangkalahatang Pagsusuri / General Check-up',
          location:       'Sa tahanan / Home Visit',
          volunteer:      'Maria Santos',
          volunteerPhone: '09171234567',
        },
      },
      {
        id: 's002',
        name: 'Lourdes Reyes',
        appointment: null,
      },
    ],
  };

  /* to simulate a senior login, replace currentUser with:
     {
       role: 'senior',
       name: 'Jose Reyes',
       linkedSeniors: [
         { id: 's003', name: 'Jose Reyes', appointment: { ... } | null }
       ]
     }

     to simulate a family rep with no seniors yet, set linkedSeniors: []
  */


  // welcome message 

  document.getElementById('welcome-message').innerHTML =
    `Maligayang Pagbabalik, ${currentUser.name}! <small>Welcome back!</small>`;


  // role-based setup 

  const switcherSection = document.getElementById('senior-switcher-section');
  const switcher        = document.getElementById('senior-switcher');
  const quickAddSenior  = document.getElementById('quick-add-senior');

  // show "Add Another Senior" in quick links for family reps only
  if (currentUser.role === 'family') {
    quickAddSenior.hidden = false;
  }

  // empty state: family rep with no linked seniors
  if (!currentUser.linkedSeniors.length) {
    document.getElementById('dashboard-empty').hidden      = false;
    document.getElementById('upcoming-appointment').hidden = true;
    document.getElementById('quick-links').hidden          = true;
  } else {

    // switcher: only for family reps with more than one senior
    if (currentUser.role === 'family' && currentUser.linkedSeniors.length > 1) {
      currentUser.linkedSeniors.forEach((senior, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = senior.name;
        switcher.appendChild(opt);
      });
      switcherSection.hidden = false;
    }

    switcher.addEventListener('change', () => {
      renderSenior(currentUser.linkedSeniors[parseInt(switcher.value, 10)]);
    });

    renderSenior(currentUser.linkedSeniors[0]);
  }


  // helpers 

  function toggleError(id, visible) {
  const el = document.getElementById(id);
  if (el) el.hidden = !visible;
  }

  function isWeekday(dateStr) {
    if (!dateStr) return false;
    const day = new Date(dateStr + 'T00:00:00').getDay();
    return day >= 1 && day <= 5;
  }

  function openModal(modal) {
    modal.hidden = false;
    const first = modal.querySelector('button, input, select, [tabindex]');
    if (first) first.focus();
  }

  function closeModal(modal) {
    modal.hidden = true;
  }


  // render senior 

  let activeSenior = null;

  function renderSenior(senior) {
    activeSenior = senior;

    const detailsEl = document.getElementById('appointment-details');
    const emptyEl   = document.getElementById('appointment-empty');

    if (senior.appointment) {
      const a = senior.appointment;
      document.getElementById('appt-senior-name').textContent  = senior.name;
      document.getElementById('appt-date').textContent         = a.date;
      document.getElementById('appt-time').textContent         = a.time;
      document.getElementById('appt-service').textContent      = a.service;
      document.getElementById('appt-location').textContent     = a.location;
      document.getElementById('appt-volunteer').textContent    = a.volunteer;

      const phoneLink = document.getElementById('appt-volunteer-phone');
      phoneLink.href        = 'tel:+63' + a.volunteerPhone.slice(1);
      phoneLink.textContent = a.volunteerPhone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');

      document.getElementById('cancel-modal-msg').innerHTML =
        `Kakanselahin ang bisita ni <strong>${senior.name}</strong> sa <strong>${a.date}</strong>. <small>This will cancel the visit on ${a.date}.</small>`;

      detailsEl.hidden = false;
      emptyEl.hidden   = true;
    } else {
      detailsEl.hidden = true;
      emptyEl.hidden   = false;
    }

    // pass active senior to booking page via sessionStorage
    sessionStorage.setItem('bookingFor', JSON.stringify({
      id:   senior.id,
      name: senior.name,
    }));
  }


  // reschedule modal 

  const rescheduleModal   = document.getElementById('reschedule-modal');
  const rescheduleDate    = document.getElementById('reschedule-date');
  const rescheduleTime    = document.getElementById('reschedule-time');
  const rescheduleErrBox  = document.getElementById('reschedule-error-summary');
  const rescheduleErrList = document.getElementById('reschedule-error-list');

  document.getElementById('btn-reschedule').addEventListener('click', () => {
    rescheduleDate.value    = '';
    rescheduleTime.value    = '';
    toggleError('error-reschedule-date', false);
    toggleError('error-reschedule-time', false);
    rescheduleErrBox.hidden = true;
    openModal(rescheduleModal);
  });

  document.getElementById('btn-reschedule-cancel').addEventListener('click', () => {
    closeModal(rescheduleModal);
  });

  document.getElementById('btn-reschedule-confirm').addEventListener('click', () => {
    const errors = [];

    if (!rescheduleDate.value || !isWeekday(rescheduleDate.value)) {
      toggleError('error-reschedule-date', true);
      errors.push('Pumili ng valid na araw (Lunes–Biyernes). / Please pick a valid weekday.');
    } else {
      toggleError('error-reschedule-date', false);
    }

    if (!rescheduleTime.value) {
      toggleError('error-reschedule-time', true);
      errors.push('Pumili ng oras. / Please choose a time.');
    } else {
      toggleError('error-reschedule-time', false);
    }

    if (errors.length > 0) {
      rescheduleErrList.innerHTML = errors.map(m => `<li>${m}</li>`).join('');
      rescheduleErrBox.hidden = false;
      return;
    }

    rescheduleErrBox.hidden = true;

    // TODO: PATCH /api/appointments/:id { date, time }

    if (activeSenior.appointment) {
      const newDate = new Date(rescheduleDate.value + 'T00:00:00');
      activeSenior.appointment.date    = newDate.toLocaleDateString('fil-PH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      activeSenior.appointment.isoDate = rescheduleDate.value;

      const timeMap = {
        '08:00': '8:00 AM',  '09:00': '9:00 AM',  '10:00': '10:00 AM',
        '11:00': '11:00 AM', '13:00': '1:00 PM',  '14:00': '2:00 PM',
        '15:00': '3:00 PM',  '16:00': '4:00 PM',
      };
      activeSenior.appointment.time = timeMap[rescheduleTime.value] || rescheduleTime.value;

      renderSenior(activeSenior);
    }

    closeModal(rescheduleModal);
  });


  // cancel modal 

  const cancelModal = document.getElementById('cancel-modal');

  document.getElementById('btn-cancel').addEventListener('click', () => {
    openModal(cancelModal);
  });

  document.getElementById('btn-cancel-dismiss').addEventListener('click', () => {
    closeModal(cancelModal);
  });

  document.getElementById('btn-cancel-confirm').addEventListener('click', () => {
    // TODO: DELETE /api/appointments/:id

    if (activeSenior.appointment) {
      activeSenior.appointment = null;
      renderSenior(activeSenior);
    }

    closeModal(cancelModal);
  });


  // close modals on backdrop click / ESC

  [rescheduleModal, cancelModal].forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!rescheduleModal.hidden) closeModal(rescheduleModal);
      if (!cancelModal.hidden)     closeModal(cancelModal);
    }
  });

})();