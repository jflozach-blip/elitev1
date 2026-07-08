'use strict';

(function loadModalHelpers() {
  const pwaInstallScript = document.createElement('script');
  pwaInstallScript.src = 'pwa-install.js';
  document.head.appendChild(pwaInstallScript);

  const eliteToolsStyle = document.createElement('link');
  eliteToolsStyle.rel = 'stylesheet';
  eliteToolsStyle.href = 'elite-tools.css';
  document.head.appendChild(eliteToolsStyle);

  const eliteLockScript = document.createElement('script');
  eliteLockScript.src = 'elite-lock.js';
  document.head.appendChild(eliteLockScript);

  const eliteSplashScript = document.createElement('script');
  eliteSplashScript.src = 'elite-splash.js';
  document.head.appendChild(eliteSplashScript);

  const modalScript = document.createElement('script');
  modalScript.src = 'modals.js';
  document.head.appendChild(modalScript);

  const summaryImageScript = document.createElement('script');
  summaryImageScript.src = 'summary-image.js';
  document.head.appendChild(summaryImageScript);

  const rotaPopupScript = document.createElement('script');
  rotaPopupScript.src = 'rota-popup.js';
  document.head.appendChild(rotaPopupScript);

  const rotaEliteScript = document.createElement('script');
  rotaEliteScript.src = 'rota-elite.js';
  document.head.appendChild(rotaEliteScript);

  const dayModalEliteScript = document.createElement('script');
  dayModalEliteScript.src = 'day-modal-elite.js';
  document.head.appendChild(dayModalEliteScript);

  const payInFilterScript = document.createElement('script');
  payInFilterScript.src = 'payin-modal-filter.js';
  document.head.appendChild(payInFilterScript);

  const repOnDemandScript = document.createElement('script');
  repOnDemandScript.src = 'rep-on-demand.js';
  document.head.appendChild(repOnDemandScript);
})();
