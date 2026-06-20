<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book an Appointment – LaanKalinga</title>
  <link rel="stylesheet" href="../../css/style.css">
</head>
<body>

  <div class="page-wrap">

    <header>
      <?php if(isset($_GET['success'])): ?>
            <div class="success-card">
              <h1>Thank you!</h1>
              <p>Your booking has been submitted successfully.</p>
              <a href="dashboard.html">Back</a>
            </div>
      <?php else: ?>

      <h1>Book an Appointment</h1>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="dashboard.html">Dashboard</a></li>
          <li><a href="profile.html">Profile</a></li>
          <li><a href="book.html" aria-current="page">Book</a></li>
          <li><a href="history.html">History</a></li>
          <li><a href="../public/index.html">Log Out</a></li>
        </ul>
      </nav>
    </header>

    <main id="main-content">
      <section id="booking-form">
        <h2>Step-by-Step Booking</h2>
        <p>Fields marked <span aria-label="required">*</span> are required.</p>

        <form id="form-booking" action="../../php/processbooking.php" method="POST" novalidate>

          <fieldset>
            <legend><h3>Step 1 — Service</h3></legend>

            <div class="field-group" id="group-service-type">
              <label for="service-type">What kind of visit? <span aria-label="required">*</span></label>
              <select id="service-type" name="serviceType" required>
                <option value="">— Choose a service —</option>
                <option value="wellness-visit">Wellness Visit</option>
                <option value="bp-check">Blood Pressure Check</option>
                <option value="other">Other: I'll describe it below</option>
              </select>
              
              <div id="group-service-other" hidden>
                <label for="service-other">Please describe what you need <span aria-label="required">*</span></label>
                <input type="text" id="service-other" name="serviceOther" placeholder="e.g. help with mobility, nutrition advice">
              </div>
            </div>

            <div class="field-group" id="group-visit-type">
              <label for="visit-type">Where will the service happen? <span aria-label="required">*</span></label>
              <select id="visit-type" name="visitType" required>
                <option value="">— Choose a location —</option>
                <option value="home-visit">Home Visit</option>
                <option value="barangay-health-center">Barangay Health Center</option>
                <option value="health-clinic">Health Clinic</option>
              </select>
            </div>
          </fieldset>

          <fieldset>
            <legend><h3>Step 2 — Date and Time</h3></legend>

            <div class="field-group" id="group-appointment-date">
              <label for="appointment-date">Preferred date <span aria-label="required">*</span></label>
              <input type="date" id="appointment-date" name="appointmentDate" required>
            </div>

            <div class="field-group" id="group-time-slot">
              <label for="time-slot">Preferred time <span aria-label="required">*</span></label>
              <select id="time-slot" name="timeSlot" required>
                <option value="">— Choose a time —</option>
                <option value="08:00">8:00 AM</option>
                <option value="09:00">9:00 AM</option>
              </select>
            </div>
          </fieldset>

          <fieldset>
            <legend><h3>Step 3 — Your Information</h3></legend>

            <div class="field-group" id="group-patient-name">
              <label for="patient-name">Senior's full name <span aria-label="required">*</span></label>
              <input type="text" id="patient-name" name="pName" required>
            </div>

            <div class="field-group" id="group-age">
              <label for="age">Age <span aria-label="required">*</span></label>
              <input type="number" id="age" name="age" min="50" max="120" required>
            </div>

            <div class="field-group" id="group-contact-number">
              <label for="contact-number">Contact number <span aria-label="required">*</span></label>
              <input type="tel" id="contact-number" name="contact" required>
            </div>

            <div class="field-group" id="group-emergency-contact">
              <label for="emergency-contact">Emergency contact number <span aria-label="required">*</span></label>
              <input type="tel" id="emergency-contact" name="emContact" required>
            </div>

            <div class="field-group" id="group-companion">
              <label for="companion">Who is accompanying the senior? (Optional)</label>
              <input type="text" id="companion" name="companion">
            </div>

            <div class="field-group" id="group-preferred-contact">
              <label for="preferred-contact">How should we confirm your appointment? <span aria-label="required">*</span></label>
              <select id="preferred-contact" name="preferredContact" required>
                <option value="">— Choose one —</option>
                <option value="sms">SMS Text Message</option>
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
              </select>
            </div>
          </fieldset>

          <fieldset>
            <legend><h3>Step 4 — Extra Notes</h3></legend>

            <div class="field-group" id="group-reason">
              <label for="reason">Reason for visit <span aria-label="required">*</span></label>
              <textarea id="reason" name="reason" rows="3" required></textarea>
            </div>

            <div class="field-group">
              <label for="special-needs">Special needs or requests (Optional)</label>
              <textarea id="special-needs" name="specialNeeds" rows="2"></textarea>
            </div>
          </fieldset>

          <div class="form-actions">
            <button type="submit">Confirm Booking</button>
            <button type="reset">Clear Form</button>
          </div>

        </form>
        <?php endif; ?>
      </section>
    </main>
  </div>

  <script src="../../js/senior/booking.js"></script>

  <?php if(isset($_GET['error'])): ?>
    <script>
      const err = "<?php echo htmlspecialchars($_GET['error']); ?>";
      if (err === 'invalid') alert("Please fill out the missing fields.");
      else if (err === 'db_error') alert("An error occurred saving your booking. Please try again.");
    </script>
  <?php endif; ?>
    
</body>
</html>