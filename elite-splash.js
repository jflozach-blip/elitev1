'use strict';

(function initEliteWelcomeSplash() {
  if (window.__eliteWelcomeSplashLoaded) return;
  window.__eliteWelcomeSplashLoaded = true;

  let lastSplashAt = 0;
  let observerBound = false;
  let audioCtx = null;

  function addStyle() {
    if (document.getElementById('eliteWelcomeSplashStyles')) return;

    const style = document.createElement('style');
    style.id = 'eliteWelcomeSplashStyles';
    style.textContent = `
      .elite-welcome-splash {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        overflow: hidden;
        background:
          radial-gradient(circle at 50% 46%, rgba(255, 255, 255, .18), transparent 13%),
          radial-gradient(circle at 50% 48%, rgba(96, 165, 250, .38), transparent 28%),
          radial-gradient(circle at 50% 52%, rgba(37, 99, 235, .26), transparent 42%),
          radial-gradient(circle at 50% 58%, rgba(250, 204, 21, .14), transparent 54%),
          linear-gradient(180deg, #000 0%, #020617 48%, #000 100%);
        color: #f8fafc;
      }

      .elite-welcome-splash.show {
        visibility: visible;
        animation: eliteSplashMaster 2.95s cubic-bezier(.16,.84,.24,1) both;
      }

      .elite-welcome-splash::before {
        content: '';
        position: absolute;
        inset: -18%;
        background:
          linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px),
          radial-gradient(circle at 50% 48%, rgba(147,197,253,.18), transparent 34%);
        background-size: 38px 38px, 38px 38px, auto;
        mask-image: radial-gradient(circle at 50% 48%, #000 0%, transparent 70%);
        opacity: 0;
        transform: scale(.86);
      }

      .elite-welcome-splash.show::before {
        animation: eliteGridPunch 2.95s ease both;
      }

      .elite-welcome-splash::after {
        content: '';
        position: absolute;
        left: -10%;
        right: -10%;
        top: -30%;
        height: 28%;
        background:
          linear-gradient(180deg, transparent, rgba(147,197,253,.28), rgba(255,255,255,.18), rgba(96,165,250,.18), transparent);
        filter: blur(2px);
        opacity: 0;
      }

      .elite-welcome-splash.show::after {
        animation: eliteScanPunch 1.35s cubic-bezier(.16,.84,.24,1) .08s both;
      }

      .elite-splash-flash {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 50% 48%, rgba(255,255,255,1), rgba(147,197,253,.78) 16%, rgba(37,99,235,.30) 34%, transparent 62%);
        mix-blend-mode: screen;
        opacity: 0;
        transform: scale(.22);
      }

      .elite-welcome-splash.show .elite-splash-flash {
        animation: eliteFlashBlast .72s cubic-bezier(.12,.74,.18,1) .34s both;
      }

      .elite-splash-core {
        position: relative;
        z-index: 3;
        display: grid;
        place-items: center;
        gap: 14px;
        text-align: center;
        transform: translateY(10px) scale(.92);
        opacity: 0;
      }

      .elite-welcome-splash.show .elite-splash-core {
        animation: eliteCorePunch 1.05s cubic-bezier(.16,.84,.24,1) .18s both;
      }

      .elite-splash-orbit {
        position: absolute;
        width: 310px;
        height: 310px;
        border-radius: 999px;
        border: 1px solid rgba(147,197,253,.28);
        box-shadow:
          0 0 34px rgba(96,165,250,.30),
          inset 0 0 28px rgba(96,165,250,.12);
        opacity: 0;
      }

      .elite-splash-orbit.two {
        width: 420px;
        height: 420px;
        border-color: rgba(250,204,21,.20);
        box-shadow:
          0 0 44px rgba(250,204,21,.14),
          inset 0 0 28px rgba(250,204,21,.08);
      }

      .elite-welcome-splash.show .elite-splash-orbit {
        animation: eliteOrbitBlast 1.45s cubic-bezier(.16,.84,.24,1) .24s both;
      }

      .elite-welcome-splash.show .elite-splash-orbit.two {
        animation-delay: .32s;
      }

      .elite-splash-badge {
        position: relative;
        isolation: isolate;
        width: 140px;
        height: 140px;
        display: grid;
        place-items: center;
        border-radius: 38px;
        background:
          linear-gradient(145deg, rgba(255,255,255,.18), rgba(255,255,255,.03)),
          radial-gradient(circle at 50% 0%, rgba(147,197,253,.18), transparent 48%),
          #020617;
        border: 1px solid rgba(191,219,254,.46);
        box-shadow:
          0 0 42px rgba(96,165,250,.46),
          0 0 100px rgba(37,99,235,.30),
          0 0 120px rgba(250,204,21,.10),
          inset 0 1px 0 rgba(255,255,255,.18),
          inset 0 -20px 30px rgba(0,0,0,.88);
        overflow: hidden;
      }

      .elite-welcome-splash.show .elite-splash-badge {
        animation: eliteBadgeImpact .82s cubic-bezier(.16,.84,.24,1) .12s both;
      }

      .elite-splash-badge::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background:
          conic-gradient(from 0deg, transparent, rgba(147,197,253,.38), transparent, rgba(250,204,21,.22), transparent);
        opacity: .5;
        animation: eliteBadgeSpin 4s linear infinite;
      }

      .elite-splash-badge::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(120deg, transparent 22%, rgba(255,255,255,.28), transparent 72%);
        transform: translateX(-145%);
      }

      .elite-welcome-splash.show .elite-splash-badge::after {
        animation: eliteBadgeSheen .72s ease .52s both;
      }

      .elite-splash-mark {
        position: relative;
        z-index: 2;
        color: #facc15;
        font-size: 62px;
        font-weight: 1000;
        line-height: 1;
        text-shadow:
          0 0 18px rgba(250,204,21,.96),
          0 0 44px rgba(96,165,250,.46);
        transform: rotate(45deg) scaleX(1.18);
      }

      .elite-splash-title {
        position: relative;
        display: grid;
        gap: 4px;
        color: #f8fafc;
        font-size: clamp(2.6rem, 13vw, 5.35rem);
        line-height: .82;
        font-weight: 1000;
        letter-spacing: -.085em;
        text-transform: uppercase;
        text-shadow:
          0 0 18px rgba(147,197,253,.95),
          0 0 62px rgba(37,99,235,.72),
          0 0 110px rgba(250,204,21,.22);
      }

      .elite-welcome-splash.show .elite-splash-title {
        animation: eliteTitlePunch .88s cubic-bezier(.16,.84,.24,1) .36s both;
      }

      .elite-splash-title span {
        display: block;
        color: #93c5fd;
        font-size: .28em;
        letter-spacing: .44em;
        text-indent: .44em;
        text-shadow:
          0 0 16px rgba(147,197,253,.86),
          0 0 42px rgba(37,99,235,.42);
      }

      .elite-splash-status {
        min-width: 190px;
        padding: 9px 14px;
        border-radius: 999px;
        border: 1px solid rgba(134,239,172,.44);
        background:
          radial-gradient(circle at 50% 0%, rgba(134,239,172,.18), transparent 60%),
          rgba(22,101,52,.20);
        color: #bbf7d0;
        font-size: .76rem;
        font-weight: 1000;
        text-transform: uppercase;
        letter-spacing: .18em;
        box-shadow:
          0 0 22px rgba(34,197,94,.24),
          inset 0 1px 0 rgba(255,255,255,.08);
        opacity: 0;
        transform: translateY(8px) scale(.94);
      }

      .elite-welcome-splash.show .elite-splash-status {
        animation: eliteStatusPunch .62s cubic-bezier(.16,.84,.24,1) .84s both;
      }

      .elite-splash-online {
        color: #dbeafe;
        font-size: .66rem;
        font-weight: 1000;
        letter-spacing: .22em;
        text-transform: uppercase;
        opacity: 0;
        text-shadow: 0 0 14px rgba(96,165,250,.56);
      }

      .elite-welcome-splash.show .elite-splash-online {
        animation: eliteOnlinePunch .58s ease 1.04s both;
      }

      .elite-splash-sparks {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 2;
      }

      .elite-splash-spark {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 5px;
        height: 5px;
        border-radius: 999px;
        background: #dbeafe;
        box-shadow:
          0 0 12px rgba(147,197,253,.95),
          0 0 26px rgba(37,99,235,.48);
        opacity: 0;
        transform: translate(-50%, -50%) scale(.4);
      }

      .elite-welcome-splash.show .elite-splash-spark {
        animation: eliteSparkBlast .98s cubic-bezier(.16,.84,.24,1) .42s both;
      }

      .elite-splash-spark.gold {
        background: #fde68a;
        box-shadow:
          0 0 12px rgba(250,204,21,.95),
          0 0 26px rgba(245,158,11,.42);
      }

      @keyframes eliteSplashMaster {
        0% { opacity: 0; visibility: visible; filter: brightness(.6); }
        8% { opacity: 1; filter: brightness(1.25); }
        18% { opacity: 1; filter: brightness(1); }
        82% { opacity: 1; filter: brightness(1); }
        100% { opacity: 0; visibility: hidden; filter: brightness(.72); }
      }

      @keyframes eliteGridPunch {
        0% { opacity: 0; transform: scale(.86) rotate(-1deg); }
        25% { opacity: .75; transform: scale(1); }
        100% { opacity: 0; transform: scale(1.16) rotate(1deg); }
      }

      @keyframes eliteScanPunch {
        0% { transform: translateY(-26vh); opacity: 0; }
        18% { opacity: .95; }
        100% { transform: translateY(156vh); opacity: 0; }
      }

      @keyframes eliteFlashBlast {
        0% { opacity: 0; transform: scale(.18); filter: blur(8px); }
        12% { opacity: 1; transform: scale(.44); filter: blur(0); }
        42% { opacity: .85; transform: scale(1.1); }
        100% { opacity: 0; transform: scale(3.2); filter: blur(12px); }
      }

      @keyframes eliteCorePunch {
        0% { opacity: 0; transform: translateY(18px) scale(.78); filter: blur(14px); }
        58% { opacity: 1; transform: translateY(0) scale(1.045); filter: blur(0); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes eliteOrbitBlast {
        0% { opacity: 0; transform: scale(.28) rotate(0deg); }
        26% { opacity: 1; }
        100% { opacity: 0; transform: scale(1.55) rotate(58deg); }
      }

      @keyframes eliteBadgeImpact {
        0% { opacity: 0; transform: scale(.42) translateY(26px); filter: blur(12px); }
        56% { opacity: 1; transform: scale(1.12) translateY(0); filter: blur(0); }
        74% { transform: scale(.98); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes eliteBadgeSpin {
        to { transform: rotate(360deg); }
      }

      @keyframes eliteBadgeSheen {
        from { transform: translateX(-145%); }
        to { transform: translateX(145%); }
      }

      @keyframes eliteTitlePunch {
        0% { opacity: 0; transform: translateY(20px) scale(.88); filter: blur(14px); letter-spacing: .02em; }
        62% { opacity: 1; transform: translateY(0) scale(1.045); filter: blur(0); letter-spacing: -.085em; }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes eliteStatusPunch {
        0% { opacity: 0; transform: translateY(10px) scale(.9); }
        70% { opacity: 1; transform: translateY(0) scale(1.05); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes eliteOnlinePunch {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: .95; transform: translateY(0); }
      }

      @keyframes eliteSparkBlast {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(.25);
        }
        18% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform:
            translate(
              calc(-50% + var(--spark-x)),
              calc(-50% + var(--spark-y))
            )
            scale(1.1);
        }
      }

      @media (max-width: 680px) {
        .elite-splash-badge {
          width: 112px;
          height: 112px;
          border-radius: 31px;
        }

        .elite-splash-mark {
          font-size: 48px;
        }

        .elite-splash-orbit {
          width: 230px;
          height: 230px;
        }

        .elite-splash-orbit.two {
          width: 310px;
          height: 310px;
        }

        .elite-splash-status {
          min-width: 168px;
          font-size: .68rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .elite-welcome-splash,
        .elite-welcome-splash::before,
        .elite-welcome-splash::after,
        .elite-welcome-splash *,
        .elite-welcome-splash.show,
        .elite-welcome-splash.show * {
          animation: none !important;
          transition: none !important;
        }

        .elite-welcome-splash.show {
          opacity: 1;
          visibility: visible;
        }

        .elite-splash-core {
          opacity: 1;
          transform: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureSplash() {
    addStyle();

    if (document.getElementById('eliteWelcomeSplash')) return;

    const splash = document.createElement('div');
    splash.id = 'eliteWelcomeSplash';
    splash.className = 'elite-welcome-splash';
    splash.setAttribute('aria-hidden', 'true');
    splash.innerHTML = `
      <div class="elite-splash-flash" aria-hidden="true"></div>
      <div class="elite-splash-sparks" id="eliteSplashSparks" aria-hidden="true"></div>

      <div class="elite-splash-core">
        <div class="elite-splash-orbit" aria-hidden="true"></div>
        <div class="elite-splash-orbit two" aria-hidden="true"></div>

        <div class="elite-splash-badge" aria-hidden="true">
          <div class="elite-splash-mark">◆</div>
        </div>

        <div class="elite-splash-title">
          Union
          <span>Elite</span>
        </div>

        <div class="elite-splash-status">Access granted</div>
        <div class="elite-splash-online">Tools online</div>
      </div>
    `;

    document.body.appendChild(splash);
    buildSparks();
  }

  function buildSparks() {
    const holder = document.getElementById('eliteSplashSparks');
    if (!holder || holder.children.length) return;

    const points = [
      [-170, -96], [170, -96], [-210, 8], [210, 8], [-150, 126], [150, 126],
      [-78, -176], [78, -176], [-58, 184], [58, 184], [-250, -62], [250, -62],
      [-230, 104], [230, 104], [-18, -230], [18, 230], [-300, 0], [300, 0]
    ];

    holder.innerHTML = points.map(([x, y], index) => `
      <span
        class="elite-splash-spark ${index % 3 === 0 ? 'gold' : ''}"
        style="--spark-x:${x}px;--spark-y:${y}px;animation-delay:${0.36 + index * 0.018}s"
      ></span>
    `).join('');
  }

  function playAudioHit() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;

      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const master = audioCtx.createGain();
      const compressor = audioCtx.createDynamicsCompressor();

      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      compressor.threshold.value = -22;
      compressor.knee.value = 24;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.006;
      compressor.release.value = 0.18;

      master.connect(compressor);
      compressor.connect(audioCtx.destination);

      function tone(freq, start, duration, gain, type = 'sine', endFreq = null) {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + start);
        if (endFreq) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + start + duration);
        }

        g.gain.setValueAtTime(0.0001, now + start);
        g.gain.exponentialRampToValueAtTime(gain, now + start + 0.018);
        g.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

        osc.connect(g);
        g.connect(master);
        osc.start(now + start);
        osc.stop(now + start + duration + 0.05);
      }

      tone(54, 0.00, 0.52, 0.32, 'sine', 34);
      tone(108, 0.02, 0.36, 0.10, 'triangle', 72);
      tone(440, 0.36, 0.24, 0.055, 'triangle', 880);
      tone(880, 0.52, 0.16, 0.04, 'sine', 1320);
    } catch {}
  }

  function playEliteWelcomeSplash() {
    const now = Date.now();
    if (now - lastSplashAt < 1700) return;

    lastSplashAt = now;
    ensureSplash();
    buildSparks();

    const splash = document.getElementById('eliteWelcomeSplash');
    if (!splash) return;

    splash.classList.remove('show');
    void splash.offsetWidth;
    splash.classList.add('show');
    splash.setAttribute('aria-hidden', 'false');

    playAudioHit();

    try {
      navigator.vibrate?.([18, 36, 62, 96, 18, 42, 24]);
    } catch {}

    setTimeout(() => {
      splash.classList.remove('show');
      splash.setAttribute('aria-hidden', 'true');
    }, 3050);
  }

  function observeEliteUnlock() {
    if (observerBound) return;
    observerBound = true;

    const observer = new MutationObserver(() => {
      const status = document.getElementById('eliteLockStatus');
      const modal = document.querySelector('.elite-lock-modal');

      if (status?.classList.contains('success') || modal?.classList.contains('unlocking')) {
        playEliteWelcomeSplash();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function init() {
    ensureSplash();
    observeEliteUnlock();
  }

  window.showEliteWelcomeSplash = playEliteWelcomeSplash;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();