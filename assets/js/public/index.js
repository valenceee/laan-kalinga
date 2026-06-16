(function () {

  // offline detection
  const bannerOffline = document.getElementById('banner-offline');

  window.addEventListener('offline', () => { bannerOffline.hidden = false; });
  window.addEventListener('online',  () => { bannerOffline.hidden = true;  });

  if (!navigator.onLine) bannerOffline.hidden = false;


  // session expired
  const bannerSession = document.getElementById('banner-session');
  const params = new URLSearchParams(window.location.search);

  if (params.get('reason') === 'session-expired') {
    bannerSession.hidden = false;
  }


  // scheduling status  
  const bookingStatus = document.getElementById('booking-status');
  const now  = new Date();
  const hour = now.getHours();
  const isWithinHours = hour >= 8 && hour < 17;

  if (isWithinHours) {
    bookingStatus.textContent = 'Open now.';
    bookingStatus.classList.add('status-open');
  } else {
    bookingStatus.textContent = 'Closed for today.';
    bookingStatus.classList.add('status-closed');
  }

})();