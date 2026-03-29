/**
 * scripts/install-manager.js
 * Native Android PWA Install Manager
 * Captures the beforeinstallprompt event and surfaces a native CTA button.
 */

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default mini-infobar from appearing on mobile
  e.preventDefault();

  // Stash the event so it can be triggered on user click
  deferredPrompt = e;

  // Reveal the install CTA
  const installBtn = document.getElementById('btn-install-os');
  if (installBtn) {
    installBtn.style.display = 'flex';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.getElementById('btn-install-os');
  if (!installBtn) return;

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    // Trigger the native install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[VIA OS] Install outcome:', outcome);

    // Prompt consumed — clear reference
    deferredPrompt = null;

    // Hide the button regardless of outcome
    installBtn.style.display = 'none';
  });
});

// Clean up if app gets installed mid-session
window.addEventListener('appinstalled', () => {
  const installBtn = document.getElementById('btn-install-os');
  if (installBtn) installBtn.style.display = 'none';
  deferredPrompt = null;
  console.log('[VIA OS] App installed successfully.');
});
