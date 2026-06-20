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

  // populate barangay datalist + validate selection
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

  // password toggle
  const pwInput = document.getElementById('password');
  const togglePw = document.getElementById('toggle-pw');
  const iconHide = document.getElementById('icon-hide');
  const iconShow = document.getElementById('icon-show');
  iconShow.hidden = true;
  togglePw.addEventListener('click', () => {
    const isHidden = pwInput.type === 'password';
    pwInput.type = isHidden ? 'text' : 'password';
    iconHide.hidden = isHidden;
    iconShow.hidden = !isHidden;
  });

  function isValidPassword(val) {
    return val.length >= 8;
  }

  // toggle volunteer-reason-other field when "Other" is selected
  const volunteerReason = document.getElementById('volunteer-reason');
  const reasonOtherGroup = document.getElementById('group-volunteer-reason-other');
  volunteerReason.addEventListener('change', () => {
    reasonOtherGroup.hidden = volunteerReason.value !== 'other';
    if (reasonOtherGroup.hidden) showError('error-volunteer-reason-other', false);
  });


  // validation helpers
  function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.hidden = !show;
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }
  function isValidPhone(val) {
    return /^09\d{9}$/.test(val.replace(/\s/g, ''));
  }


  // blur validation for required fields
  const blurRules = [
    { id: 'first-name',         errorId: 'error-first-name',         check: v => v.trim() !== '' },
    { id: 'last-name',          errorId: 'error-last-name',          check: v => v.trim() !== '' },
    { id: 'email',              errorId: 'error-email',              check: v => isValidEmail(v) },
    { id: 'phone',              errorId: 'error-phone',              check: v => isValidPhone(v) },
    { id: 'house-number',       errorId: 'error-house-number',       check: v => v.trim() !== '' },
    { id: 'street',             errorId: 'error-street',             check: v => v.trim() !== '' },
    { id: 'emergency-name',     errorId: 'error-emergency-name',     check: v => v.trim() !== '' },
    { id: 'emergency-phone',    errorId: 'error-emergency-phone',    check: v => isValidPhone(v) },
    { id: 'motivation',         errorId: 'error-motivation',         check: v => v.trim() !== '' },
    { id: 'volunteer-reason-other', errorId: 'error-volunteer-reason-other', check: v => v.trim() !== '' },
    { id: 'password', errorId: 'error-password', check: v => isValidPassword(v) },
  ];

  blurRules.forEach(({ id, errorId, check }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', () => {
        showError(errorId, !check(el.value));
      });
    }
  });

  document.getElementById('confirm-password').addEventListener('blur', () => {
    showError('error-confirm-password',
      document.getElementById('password').value !== document.getElementById('confirm-password').value);
  });

  // select blur validation
  ['emergency-relationship', 'availability-time', 'volunteer-reason'].forEach(id => {
    const el = document.getElementById(id);
    const errorId = `error-${id}`;
    if (el) {
      el.addEventListener('blur', () => {
        showError(errorId, el.value === '');
      });
    }
  });


  // checkbox group validation (interests, availability days)
  function isGroupChecked(name) {
    return document.querySelectorAll(`input[name="${name}"]:checked`).length > 0;
  }


  // form submit: run all checks, build error summary, focus first error
  const form        = document.getElementById('register-volunteer-form');
  const summaryBox  = document.getElementById('error-summary');
  const summaryList = document.getElementById('error-summary-list');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const errors = [];

    function check(fieldId, errorId, condition, msg) {
      if (!condition) {
        showError(errorId, true);
        errors.push({ id: fieldId, msg });
      } else {
        showError(errorId, false);
      }
    }

    // Step 1
    check('first-name',      'error-first-name',      document.getElementById('first-name').value.trim() !== '', 'Please enter your first name.');
    check('last-name',       'error-last-name',       document.getElementById('last-name').value.trim() !== '',  'Please enter your last name.');
    check('email',           'error-email',           isValidEmail(document.getElementById('email').value),       'Please enter a valid email address.');
    check('phone',           'error-phone',           isValidPhone(document.getElementById('phone').value),       'Please enter a valid mobile number.');
    check('house-number',    'error-house-number',    document.getElementById('house-number').value.trim() !== '','Please enter your house or unit number.');
    check('street',          'error-street',          document.getElementById('street').value.trim() !== '',      'Please enter your street name.');
    check('barangay-search', 'error-barangay',        barangayHidden.value !== '',                                 'Please select a valid barangay.');
    check('emergency-name',  'error-emergency-name',  document.getElementById('emergency-name').value.trim() !== '', 'Please enter your emergency contact name.');
    check('emergency-relationship', 'error-emergency-relationship', document.getElementById('emergency-relationship').value !== '', 'Please select a relationship.');
    check('emergency-phone', 'error-emergency-phone', isValidPhone(document.getElementById('emergency-phone').value), 'Please enter a valid emergency contact number.');
    check('password', 'error-password', isValidPassword(document.getElementById('password').value), 'Password must be at least 8 characters.');
    check('confirm-password', 'error-confirm-password', document.getElementById('password').value === document.getElementById('confirm-password').value, 'Passwords do not match.');

    // Step 2
    check('government-id',   'error-government-id',  document.getElementById('government-id').files.length > 0, 'Please upload a government-issued ID.');
    check('background-check','error-background-check',document.getElementById('background-check').checked,       'You must consent to a background check.');

    if (!isGroupChecked('availability_days')) {
      showError('error-availability-days', true);
      errors.push({ id: null, msg: 'Please select at least one available day.' });
    } else {
      showError('error-availability-days', false);
    }

    check('availability-time','error-availability-time', document.getElementById('availability-time').value !== '', 'Please select your preferred time.');

    // Step 3
    if (!isGroupChecked('interests')) {
      showError('error-interests', true);
      errors.push({ id: null, msg: 'Please select at least one area of interest.' });
    } else {
      showError('error-interests', false);
    }

    check('volunteer-reason', 'error-volunteer-reason', document.getElementById('volunteer-reason').value !== '', 'Please select a reason for volunteering.');

    if (document.getElementById('volunteer-reason').value === 'other') {
      check('volunteer-reason-other', 'error-volunteer-reason-other', document.getElementById('volunteer-reason-other').value.trim() !== '', 'Please specify or write N/A.');
    }

    check('motivation', 'error-motivation', document.getElementById('motivation').value.trim() !== '', 'Please share why you want to volunteer.');

    // Step 4
    check('terms',          'error-terms',          document.getElementById('terms').checked,          'You must agree to the terms.');
    check('accuracy',       'error-accuracy',       document.getElementById('accuracy').checked,       'Please confirm your information is accurate.');
    check('data-privacy',   'error-data-privacy',   document.getElementById('data-privacy').checked,   'Please give your consent to continue.');
    check('code-of-conduct','error-code-of-conduct',document.getElementById('code-of-conduct').checked,'You must agree to the code of conduct.');

    if (errors.length > 0) {
      summaryList.innerHTML = errors
        .map(err => err.id
          ? `<li><a href="#${err.id}">${err.msg}</a></li>`
          : `<li>${err.msg}</li>`)
        .join('');
      summaryBox.hidden = false;
      const firstId = errors.find(e => e.id)?.id;
      if (firstId) document.getElementById(firstId).focus();
      return;
    }

    summaryBox.hidden = true;

    // FIX: Actually submit the form to the backend
    form.submit();
  });

})();