'use strict';

(function initRotaEliteMakeover() {
  if (window.__rotaEliteMakeoverLoaded) return;
  window.__rotaEliteMakeoverLoaded = true;

  const ROTA_ELITE_CSS = `
    :root {
      --elite-bg: #020617;
      --elite-panel: rgba(7, 16, 31, .86);
      --elite-line: rgba(147, 197, 253, .28);
      --elite-blue: #60a5fa;
      --elite-gold: #facc15;
      --elite-green: #22c55e;
      --elite-red: #ef4444;
      --elite-text: #f8fafc;
      --elite-muted: #bfdbfe;
      color-scheme: dark;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      min-height: 100%;
      background:
        radial-gradient(circle at 50% -10%, rgba(96, 165, 250, .34), transparent 34%),
        radial-gradient(circle at 8% 95%, rgba(250, 204, 21, .14), transparent 32%),
        radial-gradient(circle at 95% 80%, rgba(34, 197, 94, .10), transparent 30%),
        linear-gradient(180deg, #020617, #07101f 42%, #020617) !important;
      color: var(--elite-text) !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
    }

    body {
      position: relative;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
      background-size: 38px 38px;
      mask-image: radial-gradient(circle at 50% 10%, #000 0%, transparent 75%);
      opacity: .5;
      z-index: 0;
    }

    body > * {
      position: relative;
      z-index: 1;
    }

    .bg-white,
    .section {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 12% 0%, rgba(96, 165, 250, .20), transparent 38%),
        radial-gradient(circle at 92% 8%, rgba(250, 204, 21, .10), transparent 34%),
        linear-gradient(180deg, rgba(15, 23, 42, .92), rgba(2, 6, 23, .82)) !important;
      border: 1px solid rgba(147, 197, 253, .28) !important;
      box-shadow:
        0 22px 50px rgba(0, 0, 0, .34),
        0 0 34px rgba(37, 99, 235, .20),
        inset 0 1px 0 rgba(255, 255, 255, .10) !important;
      color: var(--elite-text) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .bg-white::before,
    .section::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(120deg, transparent, rgba(147, 197, 253, .10), transparent);
      opacity: .7;
    }

    .header-title h1,
    .text-3xl {
      color: #f8fafc !important;
      font-weight: 1000 !important;
      letter-spacing: -.04em;
      text-shadow:
        0 0 18px rgba(96, 165, 250, .82),
        0 0 42px rgba(37, 99, 235, .42);
    }

    .header-title p,
    p,
    .preview-note,
    label {
      color: var(--elite-muted) !important;
      font-weight: 850 !important;
    }

    input,
    select,
    .search-input {
      min-height: 46px;
      border-radius: 16px !important;
      border: 1px solid rgba(147, 197, 253, .34) !important;
      background: linear-gradient(180deg, #08172c, #051022) !important;
      color: #f8fafc !important;
      font-weight: 950 !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
    }

    input:focus,
    .search-input:focus {
      outline: 1px solid rgba(96, 165, 250, .82);
      box-shadow: 0 0 20px rgba(37, 99, 235, .28), inset 0 1px 0 rgba(255,255,255,.08);
    }

    .toolbar {
      padding: 12px;
      border-radius: 22px;
      background: rgba(2, 6, 23, .34);
      border: 1px solid rgba(147, 197, 253, .14);
    }

    .btn,
    button {
      border-radius: 16px !important;
      border: 1px solid rgba(147, 197, 253, .30) !important;
      background: linear-gradient(180deg, rgba(37, 99, 235, .34), rgba(15, 23, 42, .90)) !important;
      color: #f8fafc !important;
      font-weight: 1000 !important;
      box-shadow:
        0 12px 26px rgba(0, 0, 0, .28),
        inset 0 1px 0 rgba(255, 255, 255, .10) !important;
      transition: transform .16s ease, filter .16s ease, box-shadow .16s ease;
    }

    .btn:hover,
    button:hover {
      transform: translateY(-2px);
      filter: brightness(1.12) saturate(1.08);
      box-shadow:
        0 18px 34px rgba(0, 0, 0, .38),
        0 0 28px rgba(37, 99, 235, .26),
        inset 0 1px 0 rgba(255, 255, 255, .14) !important;
    }

    .btn-rotas {
      gap: 12px !important;
    }

    .rota-btn {
      min-height: 78px !important;
      border-radius: 24px !important;
      position: relative;
      isolation: isolate;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: .08em;
    }

    .rota-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      background:
        radial-gradient(circle at 18% 0%, rgba(255,255,255,.22), transparent 38%),
        linear-gradient(120deg, transparent, rgba(255,255,255,.12), transparent);
    }

    .rota-btn.active {
      transform: translateY(-2px);
      border-color: rgba(191, 219, 254, .70) !important;
      box-shadow:
        0 0 0 1px rgba(147, 197, 253, .24),
        0 20px 42px rgba(0, 0, 0, .42),
        0 0 38px rgba(96, 165, 250, .32),
        inset 0 1px 0 rgba(255,255,255,.20) !important;
    }

    .rota-main {
      background: linear-gradient(135deg, #2563eb, #1e40af) !important;
    }

    .rota-late {
      background: linear-gradient(135deg, #f59e0b, #92400e) !important;
    }

    .rota-split {
      background: linear-gradient(135deg, #10b981, #065f46) !important;
    }

    .rota-r {
      background: linear-gradient(135deg, #8b5cf6, #4c1d95) !important;
    }

    .rota-fixed {
      background: linear-gradient(135deg, #ec4899, #831843) !important;
    }

    .header {
      background:
        radial-gradient(circle at 10% 0%, rgba(147, 197, 253, .22), transparent 38%),
        linear-gradient(180deg, rgba(15, 23, 42, .96), rgba(2, 6, 23, .76)) !important;
      border-bottom: 1px solid rgba(147, 197, 253, .20) !important;
    }

    .header span {
      color: #f8fafc;
      font-weight: 1000;
      text-shadow: 0 0 14px rgba(96, 165, 250, .62);
    }

    .table-wrap {
      border-radius: 22px;
      border: 1px solid rgba(147, 197, 253, .20);
      background: rgba(2, 6, 23, .38);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
    }

    table {
      border-collapse: separate !important;
      border-spacing: 0;
      color: #f8fafc !important;
    }

    tr {
      transition: background .14s ease, transform .14s ease;
    }

    tr:hover {
      background: rgba(37, 99, 235, .16);
    }

    td,
    th {
      border-top: 1px solid rgba(147, 197, 253, .14) !important;
      color: #eaf2ff !important;
      font-weight: 850;
    }

    td:first-child {
      color: #93c5fd !important;
      font-weight: 1000 !important;
    }

    td:nth-child(2) {
      color: #f8fafc !important;
      font-weight: 1000 !important;
    }

    td:nth-child(n + 3) {
      border-left: 1px solid rgba(147, 197, 253, .08);
      font-weight: 1000;
    }

    .duty-DO {
      background: rgba(127, 29, 29, .44) !important;
      color: #fecaca !important;
      text-shadow: 0 0 10px rgba(248, 113, 113, .30);
    }

    .duty-SP {
      background: rgba(37, 99, 235, .34) !important;
      color: #dbeafe !important;
      text-shadow: 0 0 10px rgba(96, 165, 250, .34);
    }

    td:not(.duty-DO):not(.duty-SP):nth-child(n + 3) {
      background: rgba(20, 83, 45, .22);
      color: #dcfce7 !important;
      text-shadow: 0 0 10px rgba(34, 197, 94, .24);
    }

    .modal-overlay {
      background:
        radial-gradient(circle at 50% 10%, rgba(96, 165, 250, .24), transparent 34%),
        rgba(0, 0, 0, .78) !important;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }

    .modal {
      background:
        radial-gradient(circle at 12% 0%, rgba(96, 165, 250, .24), transparent 38%),
        linear-gradient(180deg, #07101f, #020817) !important;
      border: 1px solid rgba(191, 219, 254, .36) !important;
      box-shadow:
        0 0 58px rgba(37, 99, 235, .30),
        0 28px 90px rgba(0, 0, 0, .70) !important;
      color: #f8fafc !important;
    }

    .modal-body {
      background: transparent !important;
    }

    .modal-body h2,
    .modal-body h3 {
      color: #f8fafc !important;
      font-weight: 1000 !important;
      text-shadow: 0 0 18px rgba(96, 165, 250, .68);
    }

    .search-results {
      gap: 10px !important;
    }

    .search-result {
      border-radius: 18px !important;
      border: 1px solid rgba(147, 197, 253, .24) !important;
      background:
        radial-gradient(circle at 12% 0%, rgba(147, 197, 253, .13), transparent 38%),
        linear-gradient(180deg, rgba(15, 23, 42, .92), rgba(2, 6, 23, .72)) !important;
      color: #f8fafc !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.07);
    }

    .search-result:hover {
      background:
        radial-gradient(circle at 12% 0%, rgba(147, 197, 253, .20), transparent 38%),
        linear-gradient(180deg, rgba(30, 64, 175, .42), rgba(2, 6, 23, .78)) !important;
    }

    @media (max-width: 768px) {
      body {
        padding: 10px !important;
      }

      .btn-rotas {
        grid-template-columns: 1fr !important;
      }

      .toolbar {
        align-items: stretch !important;
      }

      .modal {
        background:
          radial-gradient(circle at 50% 0%, rgba(96, 165, 250, .20), transparent 38%),
          linear-gradient(180deg, #07101f, #020817) !important;
      }
    }
  `;

  function addParentStyles() {
    if (document.getElementById('rotaEliteParentStyles')) return;

    const style = document.createElement('style');
    style.id = 'rotaEliteParentStyles';
    style.textContent = `
      #rotaPopupBackdrop {
        background:
          radial-gradient(circle at 50% 8%, rgba(96, 165, 250, .26), transparent 36%),
          radial-gradient(circle at 12% 88%, rgba(250, 204, 21, .10), transparent 30%),
          rgba(0, 0, 0, .78) !important;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }

      .rota-popup-modal {
        border-radius: 30px !important;
        background:
          radial-gradient(circle at 12% 0%, rgba(96, 165, 250, .26), transparent 36%),
          radial-gradient(circle at 90% 10%, rgba(250, 204, 21, .12), transparent 34%),
          linear-gradient(180deg, #07101f, #020817) !important;
        border: 1px solid rgba(191, 219, 254, .42) !important;
        box-shadow:
          0 0 58px rgba(37, 99, 235, .34),
          0 28px 90px rgba(0, 0, 0, .68),
          inset 0 1px 0 rgba(255,255,255,.10) !important;
      }

      .rota-popup-modal .modal-head {
        padding: 12px;
        border-radius: 22px;
        background: rgba(15, 23, 42, .74);
        border: 1px solid rgba(147, 197, 253, .24);
      }

      #rotaPopupTitle {
        color: #f8fafc;
        font-weight: 1000;
        text-shadow: 0 0 16px rgba(96, 165, 250, .78);
      }

      #closeRotaPopupBtn {
        width: 44px;
        height: 44px;
        border-radius: 999px;
        border: 1px solid rgba(147, 197, 253, .36);
        background: rgba(15, 23, 42, .78);
        color: #dbeafe;
        font-weight: 1000;
      }

      .rota-popup-frame {
        border: 1px solid rgba(147, 197, 253, .20) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
      }
    `;
    document.head.appendChild(style);
  }

  function injectIntoRotaFrame(frame) {
    try {
      const doc = frame.contentDocument || frame.contentWindow?.document;
      if (!doc || doc.getElementById('rotaEliteInjectedStyles')) return;

      const style = doc.createElement('style');
      style.id = 'rotaEliteInjectedStyles';
      style.textContent = ROTA_ELITE_CSS;
      doc.head.appendChild(style);

      doc.body?.classList.add('rota-elite-mode');
    } catch (error) {
      console.warn('Rota Elite styles could not be injected yet');
    }
  }

  function patchRotaFrames() {
    addParentStyles();

    document.querySelectorAll('.rota-popup-frame').forEach(frame => {
      injectIntoRotaFrame(frame);
      if (frame.dataset.rotaEliteBound === 'true') return;

      frame.dataset.rotaEliteBound = 'true';
      frame.addEventListener('load', () => injectIntoRotaFrame(frame));
    });
  }

  function init() {
    patchRotaFrames();

    const observer = new MutationObserver(patchRotaFrames);
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(patchRotaFrames, 250);
    setTimeout(patchRotaFrames, 750);
    setTimeout(patchRotaFrames, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();