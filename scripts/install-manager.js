// Bypass
(function bypass() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const trap = document.getElementById('install-trap');
  if (isStandalone && trap) trap.style.display = 'none';
})();
