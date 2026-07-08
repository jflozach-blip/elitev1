'use strict';

(function initEliteKeypadLock() {
  if (window.__eliteKeypadLockLoaded) return;
  window.__eliteKeypadLockLoaded = true;

  const ELITE_PASSKEY = '74563';
  const ELITE_EVER_UNLOCKED_KEY = 'memberElitePortalEverUnlocked';
  const ELITE_OPEN_COUNT_KEY = 'memberElitePortalOpenCount';

  let pendingAction = null;
  let pendingOpenCount = 0;
  let pinInput = '';

  function hasEverUnlocked() {
    return localStorage.getItem(ELITE_EVER_UNLOCKED_KEY) === 'true';
  }

  function getEliteOpenCount() {
    return Math.max(0, Number.parseInt(localStorage.getItem(ELITE_OPEN_COUNT_KEY) || '0', 10) || 0);
  }

  function markEliteOpen(count) {
    localStorage.setItem(ELITE_OPEN_COUNT_KEY, String(Math.max(1, count)));
    document.documentElement.classList.add('elite-unlocked');
    document.documentElement.classList.remove('elite-locked');
  }

  function shouldAskForPin(nextCount) {
    return !hasEverUnlocked() || nextCount === 1 || nextCount % 5 === 0;
  }

  function setEliteUnlocked() {
    localStorage.setItem(ELITE_EVER_UNLOCKED_KEY, 'true');
    markEliteOpen(pendingOpenCount || getEliteOpenCount() + 1);
  }

  function setEliteLockedClass() {
    document.documentElement.classList.toggle('elite-unlocked', hasEverUnlocked());
    document.documentElement.classList.toggle('elite-locked', !hasEverUnlocked());
  }

  function addStyle() {
    if (document.getElementById('eliteKeypadLockStyles')) return;

    const style = document.createElement('style');
    style.id = 'eliteKeypadLockStyles';
    style.textContent = `
      .elite-lock-backdrop {
        background:
          radial-gradient(circle at 50% 8%, rgba(96, 165, 250, .30), transparent 34%),
          radial-gradient(circle at 12% 88%, rgba(250, 204, 21, .12), transparent 30%),
          radial-gradient(circle at 92% 82%, rgba(220, 38, 38, .12), transparent 28%),
          rgba(0, 0, 0, .82) !important;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        z-index: 120 !important;
      }

      .elite-lock-modal {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        width: min(440px, 100%);
        border-radius: 32px !important;
        padding: 18px !important;
        background:
          radial-gradient(circle at 50% -18%, rgba(147, 197, 253, .28), transparent 34%),
          radial-gradient(circle at 100% 8%, rgba(250, 204, 21, .12), transparent 32%),
          radial-gradient(circle at 0% 90%, rgba(220, 38, 38, .12), transparent 34%),
          linear-gradient(180deg, #07101f, #020817 72%, #01040d) !important;
        border: 1px solid rgba(191, 219, 254, .46) !important;
        box-shadow:
          0 0 72px rgba(37, 99, 235, .42),
          0 34px 110px rgba(0, 0, 0, .76),
          inset 0 1px 0 rgba(255,255,255,.14) !important;
      }

      .elite-lock-modal::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -1;
        background:
          linear-gradient(120deg, transparent 0%, rgba(255,255,255,.12) 36%, transparent 68%),
          linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
        background-size: auto, 34px 34px, 34px 34px;
        opacity: .58;
        animation: eliteLockScan 5.4s ease-in-out infinite;
      }

      .elite-lock-ambient {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        border-radius: inherit;
        z-index: -1;
      }

      .elite-lock-ambient span {
        position: absolute;
        width: 230px;
        height: 230px;
        border-radius: 999px;
        filter: blur(18px);
        opacity: .72;
        animation: eliteMist 7s ease-in-out infinite;
      }

      .elite-lock-ambient span:nth-child(1) {
        left: -110px;
        top: -95px;
        background: radial-gradient(circle, rgba(96, 165, 250, .28), transparent 68%);
      }

      .elite-lock-ambient span:nth-child(2) {
        right: -125px;
        top: 34%;
        background: radial-gradient(circle, rgba(250, 204, 21, .16), transparent 68%);
        animation-delay: 1.7s;
      }

      .elite-lock-ambient span:nth-child(3) {
        left: 28%;
        bottom: -135px;
        background: radial-gradient(circle, rgba(220, 38, 38, .14), transparent 70%);
        animation-delay: 3.1s;
      }

      .elite-lock-hero {
        position: relative;
        display: grid;
        gap: 12px;
        padding: 15px;
        border-radius: 24px;
        background:
          radial-gradient(circle at 14% 0%, rgba(147, 197, 253, .18), transparent 40%),
          linear-gradient(180deg, rgba(15, 23, 42, .86), rgba(2, 6, 23, .62));
        border: 1px solid rgba(147, 197, 253, .26);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.09);
      }

      .elite-lock-brand-row {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: center;
      }

      .elite-lock-emblem {
        width: 62px;
        height: 62px;
        display: grid;
        place-items: center;
        border-radius: 21px;
        background:
          linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.02)),
          #020617;
        border: 1px solid rgba(191, 219, 254, .34);
        color: #facc15;
        font-size: 29px;
        font-weight: 1000;
        text-shadow: 0 0 18px rgba(250, 204, 21, .72);
        box-shadow:
          0 0 28px rgba(96, 165, 250, .24),
          inset 0 1px 0 rgba(255,255,255,.12),
          inset 0 -10px 18px rgba(0,0,0,.70);
      }

      .elite-lock-title {
        color: #f8fafc;
        font-size: 1.38rem;
        line-height: 1;
        font-weight: 1000;
        letter-spacing: -.04em;
        text-shadow:
          0 0 18px rgba(96, 165, 250, .88),
          0 0 42px rgba(37, 99, 235, .42);
      }

      .elite-lock-sub {
        margin-top: 5px;
        color: #bfdbfe;
        font-size: .78rem;
        font-weight: 900;
        line-height: 1.35;
      }

      .elite-lock-pill-row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }

      .elite-lock-pill {
        width: max-content;
        padding: 6px 9px;
        border-radius: 999px;
        border: 1px solid rgba(147, 197, 253, .28);
        background: rgba(37, 99, 235, .14);
        color: #dbeafe;
        font-size: .66rem;
        font-weight: 1000;
        text-transform: uppercase;
        letter-spacing: .07em;
      }

      .elite-lock-pill.gold {
        border-color: rgba(250, 204, 21, .34);
        background: rgba(250, 204, 21, .12);
        color: #fde68a;
      }

      .elite-lock-display {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 9px;
        padding: 12px;
        border-radius: 20px;
        background:
          radial-gradient(circle at 50% 0%, rgba(96, 165, 250, .12), transparent 60%),
          rgba(2, 6, 23, .62);
        border: 1px solid rgba(147, 197, 253, .28);
        box-shadow: inset 0 0 18px rgba(96, 165, 250, .08);
      }

      .elite-lock-dot {
        height: 18px;
        border-radius: 999px;
        background: rgba(15, 23, 42, .96);
        border: 1px solid rgba(148, 163, 184, .22);
        box-shadow: inset 0 3px 8px rgba(0, 0, 0, .76);
        transition: transform .12s ease, background .12s ease, box-shadow .12s ease, border-color .12s ease;
      }

      .elite-lock-dot.filled {
        transform: scaleY(1.18);
        background: linear-gradient(90deg, #2563eb, #93c5fd);
        border-color: rgba(191, 219, 254, .82);
        box-shadow:
          0 0 16px rgba(96, 165, 250, .68),
          0 0 28px rgba(37, 99, 235, .24),
          inset 0 1px 0 rgba(255,255,255,.42);
      }

      .elite-lock-status {
        min-height: 30px;
        display: grid;
        place-items: center;
        padding: 8px 10px;
        border-radius: 999px;
        background: rgba(15, 23, 42, .64);
        border: 1px solid rgba(147, 197, 253, .18);
        color: #93c5fd;
        font-size: .72rem;
        font-weight: 1000;
        line-height: 1.2;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: .08em;
      }

      .elite-lock-status.error {
        color: #fecaca;
        border-color: rgba(248, 113, 113, .32);
        background: rgba(127, 29, 29, .22);
        text-shadow: 0 0 12px rgba(248, 113, 113, .55);
      }

      .elite-lock-status.success {
        color: #bbf7d0;
        border-color: rgba(134, 239, 172, .34);
        background: rgba(22, 101, 52, .22);
        text-shadow: 0 0 12px rgba(34, 197, 94, .55);
      }

      .elite-lock-pad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 9px;
      }

      .elite-lock-pad button,
      #eliteLockCancelBtn {
        position: relative;
        overflow: hidden;
        min-height: 62px;
        display: grid;
        place-items: center;
        gap: 2px;
        padding: 7px;
        border-radius: 19px;
        border: 1px solid rgba(147, 197, 253, .28);
        background:
          radial-gradient(circle at 50% 0%, rgba(96, 165, 250, .16), transparent 54%),
          linear-gradient(180deg, #111827, #050814);
        color: #f8fafc;
        font-weight: 1000;
        cursor: pointer;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.09),
          inset 0 -9px 16px rgba(0,0,0,.68),
          0 10px 20px rgba(0,0,0,.34);
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .elite-lock-pad button::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent, rgba(255,255,255,.10), transparent);
        opacity: .32;
      }

      .elite-lock-pad button b {
        position: relative;
        z-index: 1;
        font-size: 1.35rem;
        line-height: 1;
        color: #f8fafc;
        text-shadow: 0 0 14px rgba(96, 165, 250, .42);
      }

      .elite-lock-pad button small {
        position: relative;
        z-index: 1;
        color: #64748b;
        font-size: .46rem;
        line-height: 1;
        font-weight: 1000;
        letter-spacing: .12em;
        text-transform: uppercase;
      }

      .elite-lock-pad button:active,
      .elite-lock-pad button.elite-hit {
        transform: scale(.92) translateY(2px);
        filter: brightness(1.28);
        box-shadow:
          0 0 22px rgba(96, 165, 250, .34),
          inset 0 4px 14px rgba(0, 0, 0, .92);
      }

      .elite-lock-pad button[data-elite-submit] {
        border-color: rgba(134, 239, 172, .40);
        background:
          radial-gradient(circle at 50% 0%, rgba(134, 239, 172, .20), transparent 54%),
          linear-gradient(180deg, rgba(34, 197, 94, .32), rgba(20, 83, 45, .90));
      }

      .elite-lock-pad button[data-elite-submit] b {
        color: #dcfce7;
      }

      .elite-lock-pad button[data-elite-backspace] {
        border-color: rgba(248, 113, 113, .30);
      }

      .elite-lock-pad button[data-elite-backspace] b {
        color: #fecaca;
      }

      #eliteLockCancelBtn {
        min-height: 46px;
        color: #dbeafe;
        font-size: .85rem;
        text-transform: uppercase;
        letter-spacing: .08em;
      }

      .elite-lock-modal.wrong {
        animation: eliteWrongShake .34s linear;
      }

      .elite-lock-modal.unlocking {
        animation: eliteUnlockGlow .55s cubic-bezier(.16, .84, .24, 1) both;
      }

      @keyframes eliteLockScan {
        0%, 100% { opacity: .42; transform: translateX(-2%); }
        50% { opacity: .78; transform: translateX(2%); }
      }

      @keyframes eliteMist {
        0%, 100% { transform: translate3d(0, 0, 0) scale(.95); opacity: .52; }
        50% { transform: translate3d(16px, -12px, 0) scale(1.08); opacity: .9; }
      }

      @keyframes eliteWrongShake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-10px) rotate(-.7deg); }
        42% { transform: translateX(10px) rotate(.7deg); }
        64% { transform: translateX(-7px); }
        82% { transform: translateX(5px); }
      }

      @keyframes eliteUnlockGlow {
        0% { filter: brightness(1); }
        48% {
          filter: brightness(1.45);
          box-shadow:
            0 0 100px rgba(96, 165, 250, .50),
            0 0 130px rgba(250, 204, 21, .20),
            0 28px 90px rgba(0,0,0,.72) !important;
        }
        100% { filter: brightness(1); }
      }

      @media (max-width: 680px) {
        .elite-lock-backdrop {
          align-items: flex-end;
          padding: 0;
        }

        .elite-lock-modal {
          width: 100%;
          border-radius: 30px 30px 0 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          border-bottom: 0 !important;
          padding-bottom: calc(18px + env(safe-area-inset-bottom)) !important;
        }

        .elite-lock-emblem {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          font-size: 25px;
        }

        .elite-lock-title {
          font-size: 1.22rem;
        }

        .elite-lock-pad button {
          min-height: 58px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .elite-lock-modal::before,
        .elite-lock-ambient span,
        .elite-lock-modal.wrong,
        .elite-lock-modal.unlocking {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    addStyle();

    if (document.getElementById('eliteLockBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'eliteLockBackdrop';
    backdrop.className = 'modal-backdrop elite-lock-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
      <div class="modal elite-lock-modal" role="dialog" aria-modal="true" aria-labelledby="eliteLockTitle">
        <div class="elite-lock-ambient" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>

        <div class="elite-lock-hero">
          <div class="elite-lock-brand-row">
            <div class="elite-lock-emblem" aria-hidden="true">◆</div>
            <div>
              <div class="elite-lock-title" id="eliteLockTitle">Union Elite Access</div>
              <div class="elite-lock-sub">Enter the Elite passkey. After first use, it is requested every 5th Elite opening.</div>
            </div>
          </div>

          <div class="elite-lock-pill-row">
            <div class="elite-lock-pill">Secure tools</div>
            <div class="elite-lock-pill gold" id="eliteLockCounter">Opening check</div>
          </div>
        </div>

        <div class="elite-lock-display" id="eliteLockDisplay" aria-live="polite">
          <span class="elite-lock-dot"></span>
          <span class="elite-lock-dot"></span>
          <span class="elite-lock-dot"></span>
          <span class="elite-lock-dot"></span>
          <span class="elite-lock-dot"></span>
        </div>

        <div class="elite-lock-status" id="eliteLockStatus">Enter 5-digit passkey</div>

        <div class="elite-lock-pad" aria-label="Elite keypad">
          <button type="button" data-elite-pin="1"><small>Alpha</small><b>1</b></button>
          <button type="button" data-elite-pin="2"><small>Bravo</small><b>2</b></button>
          <button type="button" data-elite-pin="3"><small>Charlie</small><b>3</b></button>
          <button type="button" data-elite-pin="4"><small>Delta</small><b>4</b></button>
          <button type="button" data-elite-pin="5"><small>Echo</small><b>5</b></button>
          <button type="button" data-elite-pin="6"><small>Foxtrot</small><b>6</b></button>
          <button type="button" data-elite-pin="7"><small>Elite</small><b>7</b></button>
          <button type="button" data-elite-pin="8"><small>Night</small><b>8</b></button>
          <button type="button" data-elite-pin="9"><small>Ops</small><b>9</b></button>
          <button type="button" data-elite-backspace><small>Back</small><b>⌫</b></button>
          <button type="button" data-elite-pin="0"><small>Zero</small><b>0</b></button>
          <button type="button" data-elite-submit><small>Unlock</small><b>✔</b></button>
        </div>

        <button id="eliteLockCancelBtn" type="button">Cancel access</button>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) closeEliteKeypad();
    });

    document.getElementById('eliteLockCancelBtn')?.addEventListener('click', closeEliteKeypad);

    backdrop.addEventListener('pointerdown', event => {
      const button = event.target.closest?.('.elite-lock-pad button');
      if (!button) return;

      button.classList.remove('elite-hit');
      void button.offsetWidth;
      button.classList.add('elite-hit');
      setTimeout(() => button.classList.remove('elite-hit'), 110);
    }, { passive: true });

    backdrop.addEventListener('click', event => {
      const pinButton = event.target.closest?.('[data-elite-pin]');
      if (pinButton) {
        addPinDigit(pinButton.dataset.elitePin);
        return;
      }

      if (event.target.closest?.('[data-elite-backspace]')) {
        pinInput = pinInput.slice(0, -1);
        updateDisplay();
        return;
      }

      if (event.target.closest?.('[data-elite-submit]')) {
        submitPin();
      }
    });

    document.addEventListener('keydown', event => {
      if (!document.getElementById('eliteLockBackdrop')?.classList.contains('open')) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        addPinDigit(event.key);
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        pinInput = pinInput.slice(0, -1);
        updateDisplay();
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        submitPin();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeEliteKeypad();
      }
    });
  }

  function updateDisplay() {
    const dots = document.querySelectorAll('#eliteLockDisplay .elite-lock-dot');
    dots.forEach((dot, index) => dot.classList.toggle('filled', index < pinInput.length));

    const status = document.getElementById('eliteLockStatus');
    if (status) {
      status.className = 'elite-lock-status';
      status.textContent = pinInput.length ? `${5 - pinInput.length} digits remaining` : 'Enter 5-digit passkey';
    }

    const counter = document.getElementById('eliteLockCounter');
    if (counter) {
      const nextCount = pendingOpenCount || getEliteOpenCount() + 1;
      counter.textContent = `Elite opening ${nextCount}`;
    }
  }

  function addPinDigit(value) {
    if (pinInput.length >= 5) return;
    pinInput += String(value);
    updateDisplay();

    if (pinInput.length === 5) {
      setTimeout(submitPin, 100);
    }
  }

  function submitPin() {
    const status = document.getElementById('eliteLockStatus');
    const modal = document.querySelector('.elite-lock-modal');

    if (pinInput === ELITE_PASSKEY) {
      if (status) {
        status.className = 'elite-lock-status success';
        status.textContent = 'Access granted';
      }

      modal?.classList.add('unlocking');
      setEliteUnlocked();

      const run = pendingAction;
      pendingAction = null;
      pendingOpenCount = 0;

      setTimeout(() => {
        modal?.classList.remove('unlocking');
        closeEliteKeypad();
        if (typeof run === 'function') run();
      }, 320);

      return;
    }

    if (status) {
      status.className = 'elite-lock-status error';
      status.textContent = 'Access denied — try again';
    }

    modal?.classList.remove('wrong');
    void modal?.offsetWidth;
    modal?.classList.add('wrong');
    setTimeout(() => modal?.classList.remove('wrong'), 360);

    pinInput = '';
    setTimeout(updateDisplay, 650);
  }

  function requestEliteAccess(onSuccess) {
    if (window.__eliteBypassNextGate) {
      window.__eliteBypassNextGate = false;
      if (typeof onSuccess === 'function') onSuccess();
      return true;
    }

    const nextCount = getEliteOpenCount() + 1;

    if (shouldAskForPin(nextCount)) {
      openEliteKeypad(onSuccess, nextCount);
      return false;
    }

    markEliteOpen(nextCount);
    if (typeof onSuccess === 'function') onSuccess();
    return true;
  }

  function openEliteKeypad(onSuccess, openCount) {
    ensureModal();
    pendingAction = typeof onSuccess === 'function' ? onSuccess : null;
    pendingOpenCount = openCount || getEliteOpenCount() + 1;
    pinInput = '';
    updateDisplay();

    const backdrop = document.getElementById('eliteLockBackdrop');
    if (!backdrop) return false;

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    return false;
  }

  function closeEliteKeypad() {
    const backdrop = document.getElementById('eliteLockBackdrop');
    if (!backdrop) return;

    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    pinInput = '';
    pendingOpenCount = 0;
    document.querySelector('.elite-lock-modal')?.classList.remove('wrong', 'unlocking');
    updateDisplay();
  }

  function rerunClick(target) {
    window.__eliteAllowNextProtectedClick = true;
    setTimeout(() => {
      target.click();
      setTimeout(() => {
        window.__eliteAllowNextProtectedClick = false;
      }, 50);
    }, 0);
  }

  function protectedClickHandler(event) {
    const target = event.target.closest?.(
      '#appBrandBtn, #openRotaPopupBtn, #openRepOnDemandBtn, #exportWeekCalendarBtn, #allDaysQuickTile, [data-shell-action], .summary-image-card'
    );

    if (!target || target.closest('#eliteLockBackdrop')) return;

    if (window.__eliteAllowNextProtectedClick) {
      window.__eliteAllowNextProtectedClick = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    requestEliteAccess(() => rerunClick(target));
  }

  function wrapProtectedFunction(name) {
    const current = window[name];
    if (typeof current !== 'function' || current.__eliteWrapped) return;

    const original = current;

    const wrapped = function eliteProtectedFunctionWrapper(...args) {
      return requestEliteAccess(() => original.apply(this, args));
    };

    wrapped.__eliteWrapped = true;
    wrapped.__eliteOriginal = original;
    window[name] = wrapped;
  }

  function wrapProtectedFunctions() {
    [
      'openShellMenu',
      'openRates',
      'openPayInTracker',
      'openTracker',
      'openRotaPopup',
      'exportCurrentWeekCalendar',
      'openRepOnDemand',
      'openWeeklySummaryImage'
    ].forEach(wrapProtectedFunction);
  }

  function guardOpenEliteViews() {
    if (hasEverUnlocked()) return;

    [
      'shellMenuBackdrop',
      'trackerModalBackdrop',
      'ratesModalBackdrop',
      'rotaPopupBackdrop',
      'repDemandBackdrop',
      'weeklySummaryImageBackdrop',
      'allDaysQuickModalBackdrop'
    ].forEach(id => {
      const node = document.getElementById(id);
      if (node?.classList.contains('open')) {
        node.classList.remove('open');
        node.setAttribute('aria-hidden', 'true');
        openEliteKeypad(null, 1);
      }
    });
  }

  function init() {
    setEliteLockedClass();
    ensureModal();
    wrapProtectedFunctions();

    if (!window.__eliteProtectedClickBound) {
      window.__eliteProtectedClickBound = true;
      document.addEventListener('click', protectedClickHandler, true);
    }

    if (!window.__eliteLockObserverBound) {
      window.__eliteLockObserverBound = true;

      const observer = new MutationObserver(() => {
        wrapProtectedFunctions();
        guardOpenEliteViews();
      });

      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    setInterval(wrapProtectedFunctions, 500);
    setTimeout(wrapProtectedFunctions, 100);
    setTimeout(wrapProtectedFunctions, 750);
    setTimeout(wrapProtectedFunctions, 1500);
  }

  window.requireEliteAccess = requestEliteAccess;
  window.isEliteAccessUnlocked = hasEverUnlocked;
  window.getEliteAccessOpenCount = getEliteOpenCount;

  window.lockEliteAccess = function lockEliteAccess() {
    localStorage.removeItem(ELITE_EVER_UNLOCKED_KEY);
    localStorage.removeItem(ELITE_OPEN_COUNT_KEY);
    setEliteLockedClass();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();