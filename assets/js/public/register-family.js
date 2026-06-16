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


  // barangay datalist 

  const barangays = [
    'San Andres', 'San Isidro', 'San Juan', 'San Roque', 'Sta. Rosa', 'Sto. Domingo', 'Sto. Niño'
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
      showError('error-barangay', false);
    } else {
      barangayHidden.value = '';
      showError('error-barangay', true);
    }
  });


  // password toggle 

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

  function isValidPassword(val) {
    return val.length >= 8;
  }


  // blur validation 

  const blurRules = [
    { id: 'first-name',       errorId: 'error-first-name',       check: v => v.trim() !== '' },
    { id: 'last-name',        errorId: 'error-last-name',        check: v => v.trim() !== '' },
    { id: 'email',            errorId: 'error-email',            check: v => isValidEmail(v) },
    { id: 'phone',            errorId: 'error-phone',            check: v => isValidPhone(v) },
    { id: 'house-number',     errorId: 'error-house-number',     check: v => v.trim() !== '' },
    { id: 'street',           errorId: 'error-street',           check: v => v.trim() !== '' },
    { id: 'password',         errorId: 'error-password',         check: v => isValidPassword(v) },
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


  // submit 

  const form        = document.getElementById('register-family-form');
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

    check('first-name',       'error-first-name',       document.getElementById('first-name').value.trim() !== '',        'Please enter your first name.');
    check('last-name',        'error-last-name',         document.getElementById('last-name').value.trim() !== '',         'Please enter your last name.');
    check('email',            'error-email',             isValidEmail(document.getElementById('email').value),             'Please enter a valid email address.');
    check('phone',            'error-phone',             isValidPhone(document.getElementById('phone').value),             'Please enter a valid mobile number.');
    check('house-number',     'error-house-number',      document.getElementById('house-number').value.trim() !== '',      'Please enter your house or unit number.');
    check('street',           'error-street',            document.getElementById('street').value.trim() !== '',            'Please enter your street name.');
    check('barangay-search',  'error-barangay',          barangayHidden.value !== '',                                      'Please select a valid barangay.');
    check('password',         'error-password',          isValidPassword(document.getElementById('password').value),       'Password must be at least 8 characters.');
    check('confirm-password', 'error-confirm-password',  document.getElementById('password').value === document.getElementById('confirm-password').value, 'Passwords do not match.');
    check('terms',            'error-terms',             document.getElementById('terms').checked,                         'You must agree to the terms.');
    check('accuracy',         'error-accuracy',          document.getElementById('accuracy').checked,                      'Please confirm your information is accurate.');
    check('data-privacy',     'error-data-privacy',      document.getElementById('data-privacy').checked,                  'Please give your consent to continue.');

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

    // mark setup as incomplete so dashboard shows the continue-setup banner
    localStorage.setItem('fam_setup_complete', 'false');

    // TODO: replace with actual fetch POST /api/register
    document.getElementById('register-family-form').hidden = true;
    document.getElementById('register-success').hidden = false;
  });

})();