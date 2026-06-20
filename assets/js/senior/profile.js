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
  const userRole = sessionStorage.getItem('userRole');
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
    sessionStorage.setItem(ZOOM_KEY, level);
  }

  let currentZoom = parseFloat(sessionStorage.getItem(ZOOM_KEY)) || 1;
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
    sessionStorage.removeItem(ZOOM_KEY);
    sessionStorage.removeItem('userRole');
    // FIX: Redirect to the updated login.php file
    window.location.href = '../public/login.php';
  });


  // barangay datalist
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

  const barangaySearch = document.getElementById('barangay-search');
  const barangayHidden = document.getElementById('barangay');
  const barangayList   = document.getElementById('barangay-list');

  if (barangaySearch && barangayList) {
    qcBarangays.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      barangayList.appendChild(opt);
    });

    barangaySearch.addEventListener('change', () => {
      const val = barangaySearch.value.trim();
      if (qcBarangays.includes(val)) {
        barangayHidden.value = val;
        showError('error-barangay', false);
      } else {
        barangayHidden.value = '';
        showError('error-barangay', true);
      }
    });
  }


  // PWD status toggle
  const pwdStatus = document.getElementById('pwd-status');
  const pwdDetailsGroup = document.getElementById('group-pwd-details');
  const pwdUploadGroup = document.getElementById('group-pwd-upload');

  pwdStatus.addEventListener('change', () => {
    const hasDisability = pwdStatus.value === 'yes' || pwdStatus.value === 'yes-no-id';
    const hasId = pwdStatus.value === 'yes';
    pwdDetailsGroup.hidden = !hasDisability;
    pwdUploadGroup.hidden = !hasId;
  });


  // shared helpers
  function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.hidden = !show;
  }

  function isValidEmail(val) {
    return val.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function isValidPhone(val) {
    return /^09\d{9}$/.test(val.replace(/\s/g, ''));
  }

  function formatPhone(val) {
    const digits = val.replace(/\s/g, '');
    return digits.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  }


  // edit / cancel toggle
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      document.getElementById(`view-${section}`).hidden = true;
      document.getElementById(`edit-${section}`).hidden = false;
    });
  });

  document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      document.getElementById(`edit-${section}`).hidden = true;
      document.getElementById(`view-${section}`).hidden = false;
    });
  });


  // save handlers per section
  document.querySelectorAll('.btn-save').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      let valid = true;

      if (section === 'personal') valid = validateAndSavePersonal();
      if (section === 'health') saveHealth();
      if (section === 'preferences') savePreferences();
      if (section === 'contacts') valid = validateAndSaveContacts();

      if (!valid) return;

      document.getElementById(`edit-${section}`).hidden = true;
      document.getElementById(`view-${section}`).hidden = false;
      showSavedBanner();
    });
  });

  function showSavedBanner() {
    const banner = document.getElementById('banner-saved');
    banner.hidden = false;
    setTimeout(() => { banner.hidden = true; }, 4000);
  }


  // personal section
  function validateAndSavePersonal() {
    const firstName = document.getElementById('first-name');
    const lastName  = document.getElementById('last-name');
    const dob       = document.getElementById('dob');
    const phone     = document.getElementById('phone');
    const email     = document.getElementById('email');
    const houseNumber = document.getElementById('house-number');
    const street    = document.getElementById('street');

    let valid = true;

    showError('error-first-name', firstName.value.trim() === '');
    if (firstName.value.trim() === '') valid = false;

    showError('error-last-name', lastName.value.trim() === '');
    if (lastName.value.trim() === '') valid = false;

    showError('error-dob', dob.value === '');
    if (dob.value === '') valid = false;

    showError('error-phone', !isValidPhone(phone.value));
    if (!isValidPhone(phone.value)) valid = false;

    showError('error-email', !isValidEmail(email.value));
    if (!isValidEmail(email.value)) valid = false;

    showError('error-house-number', houseNumber.value.trim() === '');
    if (houseNumber.value.trim() === '') valid = false;

    showError('error-street', street.value.trim() === '');
    if (street.value.trim() === '') valid = false;

    showError('error-barangay', barangayHidden.value === '');
    if (barangayHidden.value === '') valid = false;

    if (!valid) return false;

    // update view
    document.querySelector('[data-field="first-name-display"]').textContent = firstName.value;
    document.querySelector('[data-field="middle-name-display"]').textContent = document.getElementById('middle-name').value;
    document.querySelector('[data-field="last-name-display"]').textContent = lastName.value;
    document.querySelector('[data-field="suffix-display"]').textContent = document.getElementById('suffix').selectedOptions[0].textContent;
    document.querySelector('[data-field="dob-display"]').textContent = formatDate(dob.value);
    document.querySelector('[data-field="gender-display"]').textContent = document.getElementById('gender').selectedOptions[0].textContent;
    document.querySelector('[data-field="civil-status-display"]').textContent = document.getElementById('civil-status').selectedOptions[0].textContent;
    document.querySelector('[data-field="phone-display"]').textContent = formatPhone(phone.value);
    document.querySelector('[data-field="email-display"]').textContent = email.value;
    document.querySelector('[data-field="philsys-display"]').textContent = document.getElementById('philsys-id').value;
    document.querySelector('[data-field="osca-display"]').textContent = document.getElementById('osca-id').value;
    document.querySelector('[data-field="address-display"]').textContent =
      `${houseNumber.value} ${street.value}, Brgy. ${barangayHidden.value}, Quezon City, Metro Manila`;

    // TODO: replace with actual fetch/POST
    return true;
  }


  // health section
  function saveHealth() {
    document.querySelector('[data-field="blood-type-display"]').textContent =
      document.getElementById('blood-type').selectedOptions[0].textContent;
    document.querySelector('[data-field="chronic-conditions-display"]').textContent =
      document.getElementById('chronic-conditions').value || 'Wala / None';
    document.querySelector('[data-field="allergies-display"]').textContent =
      document.getElementById('allergies').value || 'Wala / None';
    document.querySelector('[data-field="medications-display"]').textContent =
      document.getElementById('medications').value || 'Wala / None';
    document.querySelector('[data-field="pwd-status-display"]').textContent =
      document.getElementById('pwd-status').selectedOptions[0].textContent;

    // TODO: replace with actual fetch/POST
  }


  // preferences section
  function savePreferences() {
    document.querySelector('[data-field="language-display"]').textContent =
      document.getElementById('language').selectedOptions[0].textContent;
    document.querySelector('[data-field="mobility-display"]').textContent =
      document.getElementById('mobility').selectedOptions[0].textContent;
    document.querySelector('[data-field="dietary-display"]').textContent =
      document.getElementById('dietary').value || 'Wala / None';
    document.querySelector('[data-field="dietary-notes-display"]').textContent =
      document.getElementById('dietary-notes').value || 'Wala / None';

    // TODO: replace with actual fetch/POST
  }


  // contacts section
  function validateAndSaveContacts() {
    const primaryName = document.getElementById('primary-name');
    const primaryRel  = document.getElementById('primary-relationship');
    const primaryPhone = document.getElementById('primary-phone');

    let valid = true;

    showError('error-primary-name', primaryName.value.trim() === '');
    if (primaryName.value.trim() === '') valid = false;

    showError('error-primary-relationship', primaryRel.value === '');
    if (primaryRel.value === '') valid = false;

    showError('error-primary-phone', !isValidPhone(primaryPhone.value));
    if (!isValidPhone(primaryPhone.value)) valid = false;

    if (!valid) return false;

    document.querySelector('[data-field="primary-name-display"]').textContent = primaryName.value;
    document.querySelector('[data-field="primary-relationship-display"]').textContent = primaryRel.selectedOptions[0].textContent;
    document.querySelector('[data-field="primary-phone-display"]').textContent = formatPhone(primaryPhone.value);
    document.querySelector('[data-field="primary-email-display"]').textContent = document.getElementById('primary-email').value || '—';

    const secName  = document.getElementById('secondary-name').value;
    const secRel   = document.getElementById('secondary-relationship');
    const secPhone = document.getElementById('secondary-phone').value;
    const secEmail = document.getElementById('secondary-email').value;

    document.querySelector('[data-field="secondary-name-display"]').textContent = secName || '—';
    document.querySelector('[data-field="secondary-relationship-display"]').textContent =
      secRel.value ? secRel.selectedOptions[0].textContent : '—';
    document.querySelector('[data-field="secondary-phone-display"]').textContent = secPhone ? formatPhone(secPhone) : '—';
    document.querySelector('[data-field="secondary-email-display"]').textContent = secEmail || '—';

    // TODO: replace with actual fetch/POST
    return true;
  }

})();