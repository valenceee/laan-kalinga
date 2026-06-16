(function () {

  // offline
  const bannerOffline = document.getElementById('banner-offline');
  window.addEventListener('offline', () => { bannerOffline.hidden = false; });
  window.addEventListener('online',  () => { bannerOffline.hidden = true;  });
  if (!navigator.onLine) bannerOffline.hidden = false;

  // session expired
  const params = new URLSearchParams(window.location.search);
  if (params.get('reason') === 'session-expired') {
    document.getElementById('banner-session').hidden = false;
  }

  // ensure all errors hidden on load
  document.querySelectorAll('.error-msg').forEach(el => el.hidden = true);
  document.getElementById('error-summary').hidden = true;

  // pick role
  const contactInput = document.getElementById('email');
  const contactLabel = document.querySelector('label[for="email"]');
  const roleBtns     = document.querySelectorAll('.role-btn');
  const errorRole    = document.getElementById('error-role');
  let selectedRole   = null;

  const registerRoutes = {
    senior:    'register-senior.html',
    family:    'register-family.html',
    volunteer: 'register-volunteer.html'
  };

  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleBtns.forEach(b => {
        b.setAttribute('aria-pressed', 'false');
        b.classList.remove('role-btn--active');
      });

      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('role-btn--active');

      selectedRole = btn.dataset.role;

      if (selectedRole === 'senior') {
        contactLabel.innerHTML = 'Mobile Number <span aria-label="required">*</span>';
        contactInput.placeholder = '09171234567';
      } else {
        contactLabel.innerHTML = 'Email Address <span aria-label="required">*</span>';
        contactInput.placeholder = 'example@email.com';
      }

      errorRole.hidden = true;
      document.getElementById('register-prompt').hidden = false;
      document.getElementById('register-link').href = registerRoutes[selectedRole];
    });
  });

  // password toggle
  const passwordInput = document.getElementById('password');
  const toggleBtn     = document.getElementById('toggle-pw');
  const iconHide      = document.getElementById('icon-hide');
  const iconShow      = document.getElementById('icon-show');

  iconShow.hidden = true;

  toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    iconHide.hidden = isHidden;
    iconShow.hidden = !isHidden;
  });

  // validation helpers
  function showError(id, show) {
    document.getElementById(id).hidden = !show;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhone(value) {
    return /^09\d{9}$/.test(value);
  }

  // submit
  const form        = document.getElementById('login-form');
  const summaryBox  = document.getElementById('error-summary');
  const summaryList = document.getElementById('error-summary-list');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // clear previous server errors
    showError('error-credentials', false);
    showError('error-not-found',   false);
    showError('error-locked',      false);
    showError('error-email',       false);
    showError('error-password',    false);

    const errors = [];
    const contactValue = contactInput.value.trim();
    const emailError = document.getElementById('error-email');

    // role check first
    if (!selectedRole) {
      errorRole.hidden = false;
      errors.push({ id: null, msg: 'Please select who you are.' });
    }

    // contact check
    if (selectedRole === 'senior') {
      emailError.textContent = 'Please enter a valid mobile number.';
      if (!isValidPhone(contactValue)) {
        showError('error-email', true);
        errors.push({ id: 'email', msg: 'Please enter a valid mobile number.' });
      }
    } else if (selectedRole) {
      emailError.textContent = 'Please enter a valid email address.';
      if (!isValidEmail(contactValue)) {
        showError('error-email', true);
        errors.push({ id: 'email', msg: 'Please enter a valid email address.' });
      }
    }

    // password check
    if (passwordInput.value.trim() === '') {
      showError('error-password', true);
      errors.push({ id: 'password', msg: 'Please enter your password.' });
    }

    // show error summary
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

    // TODO: replace with actual fetch/POST call
    const simulatedResponse = 'success'; // 'success' | 'credentials' | 'not-found' | 'locked'

    if (simulatedResponse === 'success') {
      sessionStorage.setItem('userRole', selectedRole);
      window.location.href = '../senior/dashboard.html';
    } else if (simulatedResponse === 'credentials') {
      showError('error-credentials', true);
    } else if (simulatedResponse === 'not-found') {
      showError('error-not-found', true);
    } else if (simulatedResponse === 'locked') {
      showError('error-locked', true);
    }

  });

})();