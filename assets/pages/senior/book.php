<?php

session_start();

if(!isset($_SESSION['user_id'])){
    header("Location: ../public/login.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book an Appointment – LaanKalinga</title>
  <link rel="stylesheet" href="../../css/style.css">
</head>
<body>

  <!-- PAGE LEVEL ERROR STATE ONLY (hindi ito main) -->
  <div class="page-error" role="alert" aria-live="assertive" hidden>
    <div class="page-error__icon" aria-hidden="true">!</div>
    <h1 class="page-error__title">We could not save your booking.</h1>
    <p class="page-error__reason" id="page-error-reason">
      <!-- Filled in by JS, e.g. "The time slot you chose is no longer available." -->
    </p>
    <ul class="page-error__actions">
      <li><a href="book.php" class="page-error__btn-primary">Try Again</a></li>
      <li><a href="dashboard.php" class="page-error__btn-secondary">Go to Dashboard</a></li>
    </ul>
    <p class="page-error__help">
      Need help? Call <strong>(02) XXXX XXXX</strong>, Monday – Friday, 8 AM – 5 PM.
    </p>
  </div>

  <!-- START OF NORMAL PAGE -->
  <a href="#main-content" class="skip-link">Laktawan ang nilalaman / Skip to main content</a>

  <div class="banner-error" id="banner-offline" role="alert" aria-live="assertive" hidden>
    <p>Walang koneksyon sa internet. <small>No internet connection. Please check your network and try again.</small></p>
  </div>

  <div class="banner-warning" id="banner-session" role="alert" aria-live="assertive" hidden>
    <p>Nag-expire ang iyong session. <small>Your session expired. Please log in again.</small></p>
  </div>

  <div class="page-wrap">

    <header>
      <h1>Pumili ng Serbisyo <small>Pick a Service</small></h1>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="dashboard.php" id="nav-dashboard-link">Dashboard</a></li>
          <li><a href="profile.html">Profile</a></li>
          <li><a href="book.php" aria-current="page">Book</a></li>
          <li><a href="history.html">History</a></li>
          <li><a href="../public/index.html" id="logout-link">Logout</a></li>
        </ul>
      </nav>
    </header>
    <?php if(isset($_GET['success'])): ?>
            <div class="success-card">
              <h1>Thank you!</h1>
              <p>Your booking has been submitted successfully.</p>
              <a href="dashboard.php">Back</a>
            </div>
          <?php else: ?>

    <main id="main-content">

      <!-- Form-level error summary (shown on failed submit) -->
      <div class="error-summary" id="error-summary" role="alert" aria-live="assertive" hidden>
        <p class="error-summary__heading">Please fix these before continuing:</p>
        <ul class="error-summary__list" id="error-summary-list">
          <!-- JS injects <li><a href="#field-id">Error description</a></li> items here -->
        </ul>
      </div>

      <section id="booking-form">
        <h2>Step-by-Step Booking</h2>
        <p>Fields marked <span aria-label="required">*</span> are required.</p>

        <form id="form-booking" action="../../php/processbooking.php" method="POST" novalidate>

          <!-- ── STEP 1: SERVICE ─────────────────────── -->
          <fieldset>
            <legend><h3>Step 1 — Service</h3></legend>

            <div class="field-group" id="group-service-type">
              <label for="service-type">What kind of visit? <span aria-label="required">*</span></label>
              <select id="service-type" name="service-type" required aria-describedby="error-service-type">
                <option value="">— Choose a service —</option>
                <option value="wellness-visit">Wellness Visit (General check-up at home)</option>
                <option value="bp-check">Blood Pressure Check</option>
                <option value="blood-sugar">Blood Sugar Check</option>
                <option value="medicine-pickup">Medicine Pick-up / Delivery</option>
                <option value="wound-care">Wound Care</option>
                <option value="vaccination">Vaccination</option>
                <option value="referral">Referral to Health Center or Hospital</option>
                <option value="follow-up">Follow-up Visit</option>
                <option value="other">Other: I'll describe it below</option>
              </select>
              <div id="group-service-other" hidden>
                <label for="service-other">Please describe what you need <span aria-label="required">*</span></label>
                <input type="text" id="service-other" name="service-other"
                        placeholder="e.g. help with mobility, nutrition advice"
                        aria-describedby="error-service-other">
                <span class="error-msg" id="error-service-other" aria-live="polite" hidden>
                    Please describe the service you need.
                </span>
                </div>
              <span class="error-msg" id="error-service-type" aria-live="polite" hidden>
                Please choose a service.
              </span>
            </div>

            <div class="field-group" id="group-visit-type">
              <label for="visit-type">Where will the service happen? <span aria-label="required">*</span></label>
              <select id="visit-type" name="visit-type" required aria-describedby="error-visit-type">
                <option value="">— Choose a location —</option>
                <option value="home-visit">Home Visit (Barangay health workers and volunteers come to you)</option>
                <option value="barangay-health-center">Barangay Health Center</option>
                <option value="health-clinic">Health Clinic</option>
              </select>
              <span class="error-msg" id="error-visit-type" aria-live="polite" hidden>
                Please choose where the service will happen.
              </span>
            </div>

          </fieldset>

          <!-- ── STEP 2: SCHEDULE ────────────────────── -->
          <fieldset>
            <legend><h3>Step 2 — Date and Time</h3></legend>

            <div class="field-group" id="group-appointment-date">
              <label for="appointment-date">Preferred date <span aria-label="required">*</span></label>
              <small>Monday to Friday only. Choose a date at least one day ahead.</small>
              <input type="date" id="appointment-date" name="appointment-date" required
                     aria-describedby="hint-date error-appointment-date">
              <span class="field-hint" id="hint-date">MM/DD/YYYY</span>
              <span class="error-msg" id="error-appointment-date" aria-live="polite" hidden>
                Please pick a valid weekday.
              </span>
            </div>

            <div class="field-group" id="group-time-slot">
              <label for="time-slot">Preferred time <span aria-label="required">*</span></label>
              <select id="time-slot" name="time-slot" required aria-describedby="error-time-slot">
                <option value="">— Choose a time —</option>
                <option value="08:00">8:00 AM</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="19:00">7:00 PM</option>
              </select>
              <span class="error-msg" id="error-time-slot" aria-live="polite" hidden>
                Please choose a time.
              </span>
            </div>

          </fieldset>

          <!-- ── STEP 3: PATIENT INFO ───────────────── -->
          <fieldset>
            <legend><h3>Step 3 — Your Information</h3></legend>

            <div class="field-group" id="group-patient-name">
              <label for="patient-name">Senior's full name <span aria-label="required">*</span></label>
              <input type="text" id="patient-name" name="patient-name" required
                     autocomplete="name" aria-describedby="error-patient-name">
              <span class="error-msg" id="error-patient-name" aria-live="polite" hidden>
                Please enter the senior's full name.
              </span>
            </div>

            <div class="field-group" id="group-age">
              <label for="age">Age <span aria-label="required">*</span></label>
              <input type="number" id="age" name="age" min="50" max="120" required
                     aria-describedby="error-age">
              <span class="error-msg" id="error-age" aria-live="polite" hidden>
                Age must be between 50 and 120.
              </span>
            </div>

            <div class="field-group" id="group-contact-number">
              <label for="contact-number">Contact number <span aria-label="required">*</span></label>
              <small>Example: +63 912 345 6789</small>
              <input type="tel" id="contact-number" name="contact-number" required
                     autocomplete="tel" aria-describedby="hint-contact error-contact-number">
              <span class="field-hint" id="hint-contact">Mobile or landline</span>
              <span class="error-msg" id="error-contact-number" aria-live="polite" hidden>
                Please enter a contact number.
              </span>
            </div>

            <div class="field-group" id="group-emergency-contact">
              <label for="emergency-contact">Emergency contact number <span aria-label="required">*</span></label>
              <small>A family member or caregiver we can call if needed.</small>
              <input type="tel" id="emergency-contact" name="emergency-contact" required
                     aria-describedby="error-emergency-contact">
              <span class="error-msg" id="error-emergency-contact" aria-live="polite" hidden>
                Please enter an emergency contact number.
              </span>
            </div>

            <div class="field-group" id="group-companion">
              <label for="companion">Who is accompanying the senior? (Optional)</label>
              <small>Leave blank if coming alone.</small>
              <input type="text" id="companion" name="companion" autocomplete="name">
            </div>

            <div class="field-group" id="group-preferred-contact">
              <label for="preferred-contact">How should we confirm your appointment? <span aria-label="required">*</span></label>
              <select id="preferred-contact" name="preferred-contact" required
                      aria-describedby="error-preferred-contact">
                <option value="">— Choose one —</option>
                <option value="sms">SMS Text Message</option>
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
              </select>
              <span class="error-msg" id="error-preferred-contact" aria-live="polite" hidden>
                Please choose how we should contact you.
              </span>
            </div>

          </fieldset>

          <!-- ── STEP 4: EXTRA NOTES ───────────────── -->
          <fieldset>
            <legend><h3>Step 4 — Extra Notes</h3></legend>

            <div class="field-group" id="group-reason">
              <label for="reason">Reason for visit <span aria-label="required">*</span></label>
              <small>Brief description. Example: "Been dizzy, needs BP check."</small>
              <textarea id="reason" name="reason" rows="3" required
                        aria-describedby="error-reason"></textarea>
              <span class="error-msg" id="error-reason" aria-live="polite" hidden>
                Please describe the reason for your visit.
              </span>
            </div>

            <div class="field-group">
              <label for="special-needs">Special needs or requests (Optional)</label>
              <small>Wheelchair, translation, hearing help, transport — anything you need.</small>
              <textarea id="special-needs" name="special-needs" rows="2"></textarea>
            </div>

          </fieldset>

          <!-- ── ACTIONS ────────────────────────────── -->
          <div class="form-actions">
            <button type="submit">Confirm Booking</button>
            <button type="reset">Clear Form</button>
          </div>

        </form>
      </section>
      <?php endif; ?>

      <!-- After-booking info -->
      <section id="booking-info">
        <h2>What Happens Next?</h2>
        <ul>
          <li>You'll get a confirmation via SMS, call, or email.</li>
          <li>A reminder will be sent 24 hours before your appointment.</li>
          <li>Bring a valid ID and any medical records or prescriptions on the day.</li>
        </ul>

        <h3>Need to Cancel or Change?</h3>
        <p>Call your barangay health center directly or use the hotline below.</p>

        <h3>Need Help?</h3>
        <p>
          <strong>Hotline:</strong> (02) XXXX XXXX<br>
          <strong>Hours:</strong> Monday – Friday, 8 AM – 5 PM
        </p>
      </section>

    </main>

    <footer>
      <p>&copy; 2026 LaanKalinga. All rights reserved.</p>
    </footer>

  </div>

  <script src="../../js/senior/booking.js"></script>

  <?php if(isset($_GET['error']) && $_GET['error'] === 'invalid'): ?>

    <script>
      alert("Please Fill out the missing fields.");
    </script>

    <?php endif; ?>
    
</body>
</html>