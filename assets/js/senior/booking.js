(() => {
    const form = document.getElementById('form-booking');
    const REQUIRED_FIELDS = [
    ['service-type',       'error-service-type',       'Service type'],
    ['visit-type',         'error-visit-type',         'Visit location'],
    ['appointment-date',   'error-appointment-date',   'Appointment date'],
    ['time-slot',          'error-time-slot',          'Time slot'],
    ['patient-name',       'error-patient-name',       'Senior\'s full name'],
    ['age',                'error-age',                'Age'],
    ['contact-number',     'error-contact-number',     'Contact number'],
    ['emergency-contact',  'error-emergency-contact',  'Emergency contact'],
    ['preferred-contact',  'error-preferred-contact',  'Confirmation method'],
    ['reason',             'error-reason',             'Reason for visit'],
];

// set correct dashboard links based on logged-in role
const userRole = sessionStorage.getItem('userRole'); // 'senior' or 'family'
const dashboardPath = '../senior/dashboard.html';

const navDashboardLink = document.getElementById('nav-dashboard-link');
if (navDashboardLink) navDashboardLink.href = dashboardPath;

const dashboardLink = document.getElementById('dashboard-link');
if (dashboardLink) dashboardLink.href = dashboardPath;

// inline error for a single field (for example: "age must be between 50 and 120")
function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (!field || !errorEl) return;
    field.classList.add('field--invalid');
    errorEl.textContent = message || errorEl.textContent;
    errorEl.hidden = false;
}

// clear inline error lang to
function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (!field || !errorEl) return;
    field.classList.remove('field--invalid');
    errorEl.hidden = true;
}

// age validation (must be number between 50 and 120)
function validateAge() {
    const ageEl = document.getElementById('age');
    const val = parseInt(ageEl.value, 10);
    if (!ageEl.value || isNaN(val) || val < 50 || val > 120) {
    showError('age', 'error-age', 'Age must be between 50 and 120.');
    return false;
    }
    clearError('age', 'error-age');
    return true;
}

// date validation (must be future)
function validateDate() {
    const dateEl = document.getElementById('appointment-date');
    if (!dateEl.value) {
    showError('appointment-date', 'error-appointment-date', 'Please pick a date.');
    return false;
    }
    const chosen = new Date(dateEl.value + 'T00:00:00');
    const day = chosen.getDay(); // 0=Sun, 6=Sat
    const today = new Date(); today.setHours(0,0,0,0);
    if (chosen <= today) {
    showError('appointment-date', 'error-appointment-date', 'Please choose a future date.');
    return false;
    }
    if (day === 0 || day === 6) {
    showError('appointment-date', 'error-appointment-date', 'Please choose a weekday (Mon–Fri).');
    return false;
    }
    clearError('appointment-date', 'error-appointment-date');
    return true;
}

// blur validations lang, magpapakita inline error messages kapag user leaves a required field empty or with invalid data. 
// input event will clear the error as soon as they start typing again
const serviceSelect      = document.getElementById('service-type');
const serviceOtherGroup  = document.getElementById('group-service-other');
const serviceOtherInput  = document.getElementById('service-other');

serviceSelect.addEventListener('change', () => {
    const isOther = serviceSelect.value === 'other';
    serviceOtherGroup.hidden  = !isOther;
    serviceOtherInput.required = isOther;
    if (!isOther) {
        serviceOtherInput.value = '';
        clearError('service-other', 'error-service-other');
    }
});

serviceOtherInput.addEventListener('blur', () => {
    if (serviceOtherInput.required && !serviceOtherInput.value.trim())
        showError('service-other', 'error-service-other');
    else
        clearError('service-other', 'error-service-other');
});

serviceOtherInput.addEventListener('input', () => {
    if (serviceOtherInput.value.trim()) clearError('service-other', 'error-service-other');
});

// per-field blur/input wiring
REQUIRED_FIELDS.forEach(([fieldId, errorId]) => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.addEventListener('blur', () => {
        if (fieldId === 'age')              { validateAge();  return; }
        if (fieldId === 'appointment-date') { validateDate(); return; }
        if (!el.value.trim()) showError(fieldId, errorId);
        else                  clearError(fieldId, errorId);
    });
    el.addEventListener('input', () => {
        if (el.value.trim()) clearError(fieldId, errorId);
    });
});

// submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    let errors = [];

    REQUIRED_FIELDS.forEach(([fieldId, errorId, label]) => {
    if (fieldId === 'age') {
        if (!validateAge()) errors.push({ fieldId, label });
        return;
    }
    if (fieldId === 'appointment-date') {
        if (!validateDate()) errors.push({ fieldId, label });
        return;
    }
    const el = document.getElementById(fieldId);
    if (!el || !el.value.trim()) {
        showError(fieldId, errorId);
        errors.push({ fieldId, label });
    } else {
        clearError(fieldId, errorId);
    }
    });

    if (serviceSelect.value === 'other' && !serviceOtherInput.value.trim()) {
        showError('service-other', 'error-service-other');
        errors.push({ fieldId: 'service-other', label: 'Service description' });
        }

    if (errors.length > 0) {
    // error summary at top of page
    const summary = document.getElementById('error-summary');
    const list = document.getElementById('error-summary-list');
    list.innerHTML = '';
    errors.forEach(({ fieldId, label }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + fieldId;
        a.textContent = label + ' is required.';
        a.addEventListener('click', (ev) => {
        ev.preventDefault();
        document.getElementById(fieldId)?.focus();
        });
        li.appendChild(a);
        list.appendChild(li);
    });
    summary.hidden = false;
    summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
    }

    // no errors
    document.getElementById('error-summary').hidden = true;
    submitBooking();
});

// page-level error (for example: "the time slot you chose is no longer available. please pick a different time.")
function showPageError(reason) {
    const pageErr = document.querySelector('.page-error');
    const pageWrap = document.querySelector('.page-wrap');
    document.getElementById('page-error-reason').textContent =
    reason || 'Something went wrong. Please try again.';
    pageErr.hidden = false;
    pageWrap.hidden = true;
    pageErr.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hidePageError() {
    document.querySelector('.page-error').hidden = true;
    document.querySelector('.page-wrap').hidden = false;
}

// simulated submission — replace with real fetch() call (wala pa tong backend API, so just simulating success or error response)
function submitBooking() {
    // Example: simulate a server error
    // showPageError('The time slot you chose is no longer available. Please pick a different time.');

    // On success, redirect to confirmation page:
    // window.location.href = 'confirmation.html';

    alert('Booking submitted! (Integrate real API here.)');
}
})();