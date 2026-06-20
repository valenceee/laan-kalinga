(function () {

  // ─── offline / session banners ───────────────────────────────────────────────

  const bannerOffline = document.getElementById('banner-offline');
  window.addEventListener('offline', () => { bannerOffline.hidden = false; });
  window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
  if (!navigator.onLine) bannerOffline.hidden = false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('reason') === 'session-expired') {
    document.getElementById('banner-session').hidden = false;
  }


  // ─── barangay datalist ────────────────────────────────────────────────────────

  const barangays = [
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

  barangays.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    barangayList.appendChild(opt);
  });

  barangaySearch.addEventListener('change', () => {
    const val = barangaySearch.value.trim();
    if (barangays.includes(val)) {
      barangayHidden.value = val;
      clearError('barangay-search', 'error-barangay');
    } else {
      barangayHidden.value = '';
      showError('barangay-search', 'error-barangay');
    }
  });


  // ─── password toggle ──────────────────────────────────────────────────────────

  const pwInput  = document.getElementById('password');
  const togglePw = document.getElementById('toggle-pw');
  const iconHide = document.getElementById('icon-hide');
  const iconShow = document.getElementById('icon-show');
  iconShow.hidden = true;

  togglePw.addEventListener('click', () => {
    const isHidden = pwInput.type === 'password';
    pwInput.type    = isHidden ? 'text' : 'password';
    iconHide.hidden = isHidden;
    iconShow.hidden = !isHidden;
  });


  // ─── helpers ──────────────────────────────────────────────────────────────────

  function showError(fieldId, errorId, message) {
    const field   = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (!field || !errorEl) return;
    field.classList.add('field--invalid');
    if (message) errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError(fieldId, errorId) {
    const field   = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (!field || !errorEl) return;
    field.classList.remove('field--invalid');
    errorEl.hidden = true;
  }


  // ─── field validators ─────────────────────────────────────────────────────────

  function validateDob() {
    const dobEl = document.getElementById('dob');
    if (!dobEl.value) {
      showError('dob', 'error-dob');
      return false;
    }
    const today = new Date();
    const dob   = new Date(dobEl.value + 'T00:00:00');
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 50 || age > 110) {
      showError('dob', 'error-dob');
      return false;
    }
    clearError('dob', 'error-dob');
    return true;
  }

  function validatePassword() {
    const pw      = document.getElementById('password');
    const confirm = document.getElementById('confirm-password');
    if (pw.value.length < 8) {
      showError('password', 'error-password');
      return false;
    }
    clearError('password', 'error-password');
    if (confirm.value && pw.value !== confirm.value) {
      showError('confirm-password', 'error-confirm-password');
      return false;
    }
    if (confirm.value) clearError('confirm-password', 'error-confirm-password');
    return true;
  }

  function validateConfirmPassword() {
    const pw      = document.getElementById('password').value;
    const confirm = document.getElementById('confirm-password').value;
    if (pw !== confirm) {
      showError('confirm-password', 'error-confirm-password');
      return false;
    }
    clearError('confirm-password', 'error-confirm-password');
    return true;
  }

  function validatePhone(fieldId, errorId) {
    const el  = document.getElementById(fieldId);
    const val = el.value.replace(/\s/g, '');
    if (!val) {
      showError(fieldId, errorId);
      return false;
    }
    if (!/^09\d{9}$/.test(val)) {
      showError(fieldId, errorId, 'Dapat magsimula sa 09 at may 11 digits. / Must start with 09 and be 11 digits.');
      return false;
    }
    clearError(fieldId, errorId);
    return true;
  }


  // ─── blur validation ──────────────────────────────────────────────────────────

  document.getElementById('dob').addEventListener('blur', () => validateDob());
  document.getElementById('password').addEventListener('blur', () => validatePassword());
  document.getElementById('confirm-password').addEventListener('blur', () => validateConfirmPassword());
  document.getElementById('phone').addEventListener('blur', () => validatePhone('phone', 'error-phone'));
  document.getElementById('primary-contact-phone').addEventListener('blur', () =>
    validatePhone('primary-contact-phone', 'error-primary-contact-phone'));

  const simpleBlurFields = [
    ['first-name',                   'error-first-name'],
    ['last-name',                    'error-last-name'],
    ['house-number',                 'error-house-number'],
    ['street',                       'error-street'],
    ['primary-contact-name',         'error-primary-contact-name'],
  ];

  simpleBlurFields.forEach(([fieldId, errorId]) => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.addEventListener('blur',  () => { if (!el.value.trim()) showError(fieldId, errorId); else clearError(fieldId, errorId); });
    el.addEventListener('input', () => { if (el.value.trim()) clearError(fieldId, errorId); });
  });

  const selectBlurFields = [
    ['gender',                       'error-gender'],
    ['civil-status',                 'error-civil-status'],
    ['primary-contact-relationship', 'error-primary-contact-relationship'],
  ];

  selectBlurFields.forEach(([fieldId, errorId]) => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.addEventListener('blur',   () => { if (!el.value) showError(fieldId, errorId); else clearError(fieldId, errorId); });
    el.addEventListener('change', () => { if (el.value) clearError(fieldId, errorId); });
  });


  // ─── philsys follow-up toggle ─────────────────────────────────────────────────

  const philsysInput   = document.getElementById('philsys-id');
  const philsysFollowup = document.getElementById('philsys-followup');

  philsysFollowup.addEventListener('change', () => {
    philsysInput.disabled = philsysFollowup.checked;
    if (philsysFollowup.checked) {
      philsysInput.value = '';
      clearError('philsys-id', 'error-philsys-id');
    }
  });


  // ─── pwd status toggle ────────────────────────────────────────────────────────

  const pwdStatus       = document.getElementById('pwd-status');
  const pwdDetailsGroup = document.getElementById('group-pwd-details');
  const pwdUploadGroup  = document.getElementById('group-pwd-upload');
  const pwdUpload       = document.getElementById('pwd-upload');

  pwdStatus.addEventListener('change', () => {
    const hasDisability = pwdStatus.value === 'yes' || pwdStatus.value === 'yes-no-id';
    const hasId         = pwdStatus.value === 'yes';

    pwdDetailsGroup.hidden = !hasDisability;
    pwdUploadGroup.hidden  = !hasId;
    pwdUpload.required     = hasId;

    if (!hasId) {
      pwdUpload.value = '';
      clearError('pwd-upload', 'error-pwd-upload');
    }
  });


  // submit 

  const form       = document.getElementById('register-senior-form');
  const summaryBox = document.getElementById('error-summary');
  const summaryList = document.getElementById('error-summary-list');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const errors = [];

    function check(fieldId, errorId, valid, label) {
      if (!valid) {
        showError(fieldId, errorId);
        errors.push({ fieldId, label });
      } else {
        clearError(fieldId, errorId);
      }
    }

    // personal information
    check('first-name',  'error-first-name',  document.getElementById('first-name').value.trim() !== '',  'Pangalan / First name');
    check('last-name',   'error-last-name',   document.getElementById('last-name').value.trim() !== '',   'Apelyido / Last name');
    check('gender',      'error-gender',      document.getElementById('gender').value !== '',              'Kasarian / Sex');
    check('civil-status','error-civil-status',document.getElementById('civil-status').value !== '',        'Katayuang Sibil / Civil status');
    if (!validateDob())      errors.push({ fieldId: 'dob',      label: 'Petsa ng Kapanganakan / Date of birth' });
    if (!validatePassword()) errors.push({ fieldId: 'password', label: 'Password' });
    if (!validateConfirmPassword()) errors.push({ fieldId: 'confirm-password', label: 'Kumpirmahin ang Password / Confirm password' });
    if (!validatePhone('phone', 'error-phone')) errors.push({ fieldId: 'phone', label: 'Numero ng Cellphone / Mobile number' });

    // address
    check('house-number', 'error-house-number', document.getElementById('house-number').value.trim() !== '', 'Numero ng Bahay / House number');
    check('street',       'error-street',       document.getElementById('street').value.trim() !== '',       'Kalye / Street');
    if (!barangayHidden.value) {
      showError('barangay-search', 'error-barangay');
      errors.push({ fieldId: 'barangay-search', label: 'Barangay' });
    } else {
      clearError('barangay-search', 'error-barangay');
    }

    // philsys: must have ID or follow-up checked
    if (!philsysInput.value.trim() && !philsysFollowup.checked) {
      showError('philsys-id', 'error-philsys-id');
      errors.push({ fieldId: 'philsys-id', label: 'PhilSys ID / National ID' });
    } else {
      clearError('philsys-id', 'error-philsys-id');
    }

    // emergency contact
    check('primary-contact-name',         'error-primary-contact-name',         document.getElementById('primary-contact-name').value.trim() !== '',  'Pangalan ng Kontak / Emergency contact name');
    check('primary-contact-relationship', 'error-primary-contact-relationship', document.getElementById('primary-contact-relationship').value !== '',   'Relasyon ng Kontak / Contact relationship');
    if (!validatePhone('primary-contact-phone', 'error-primary-contact-phone')) errors.push({ fieldId: 'primary-contact-phone', label: 'Numero ng Kontak / Contact number' });

    // pwd upload: required only if "yes" selected
    if (pwdUpload.required && !pwdUpload.files.length) {
      showError('pwd-upload', 'error-pwd-upload');
      errors.push({ fieldId: 'pwd-upload', label: 'PWD ID' });
    }

    // consent
    check('terms',       'error-terms',       document.getElementById('terms').checked,       'Mga Tuntunin / Terms and Conditions');
    check('accuracy',    'error-accuracy',    document.getElementById('accuracy').checked,    'Katumpakan / Information accuracy');
    check('data-privacy','error-data-privacy',document.getElementById('data-privacy').checked,'Data Privacy Consent');

    if (errors.length > 0) {
      summaryList.innerHTML = errors
        .map(({ fieldId, label }) => `<li><a href="#${fieldId}">${label}</a></li>`)
        .join('');
      summaryBox.hidden = false;
      summaryBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById(errors[0].fieldId)?.focus();
      return;
    }

    summaryBox.hidden = true;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Nagsusumite… / Submitting…';

    // FIX: Actually let PHP handle the backend submission
    form.submit();
  });

})();