<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login – Laan-Kalinga</title>
  <link rel="stylesheet" href="../../css/style.css">
</head>
<body>

  <main id="main-content">
    <div class="login-wrapper">

      <div class="logo-section">
        <img src="../../images/logo.png" alt="LaanKalinga Logo" class="logo">
        <h1>Laan-Kalinga</h1>
        <p class="hero-barangay">Barangay XXX, Quezon City</p>
      </div>

      <section class="role-picker" aria-labelledby="role-heading">
        <h2 id="role-heading">Select a role</h2>
        <div class="role-grid">
          <button type="button" class="role-btn" data-role="senior" aria-pressed="false">Senior Citizen</button>
          <button type="button" class="role-btn" data-role="family" aria-pressed="false">Family Representative</button>
          <button type="button" class="role-btn" data-role="volunteer" aria-pressed="false">Volunteer</button>
        </div>
      </section>

      <section class="form-section" id="login-form-section">
        <h2>Sign In</h2>

        <form id="login-form" action="../../php/signin.php" method="POST" novalidate>
          <input type="hidden" id="role-input" name="role" value="">

          <div class="field-group" id="group-email">
            <label for="email">Email address <span aria-label="required">*</span></label>
            <input type="email" id="email" name="email" required autocomplete="email">
          </div>

          <div class="field-group" id="group-password">
            <label for="password">Password <span aria-label="required">*</span></label>
            <div class="input-wrapper">
              <input type="password" id="password" name="password" required autocomplete="current-password">
              <button type="button" class="toggle-pw" id="toggle-pw" aria-label="Show password">
                <img src="../../icons/hidepass.svg" id="icon-hide" alt="">
                <img src="../../icons/viewpass.svg" id="icon-show" alt="">
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" id="remember" name="remember">
              <span>Remember me</span>
            </label>
            <a href="forgot-password.html" class="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" class="btn-primary">Sign In</button>
        </form>

        <p class="register-link" id="register-prompt">
          No account yet? <a href="register.html" id="register-link">Register here.</a>
        </p>

      </section>
    </div>
  </main>

  <script src="../../js/public/login.js"></script>

  <?php if(isset($_GET['error'])): ?>
    <script>
      const error = "<?php echo htmlspecialchars($_GET['error']); ?>";
      if (error === 'invalid') {
          alert("Invalid email or password.");
      } else if (error === 'missing_fields') {
          alert("Please fill in both email and password.");
      } else if (error === 'unauthorized') {
          alert("You must be logged in to view that page.");
      }
    </script>
  <?php endif; ?>

</body>
</html>