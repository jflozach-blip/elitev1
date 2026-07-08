'use strict';

(function initElitePdfLibrary() {
  if (window.__elitePdfLibraryLoaded) return;
  window.__elitePdfLibraryLoaded = true;

  const PDF_DOCUMENTS = [
    {
      title: 'Summer Duties - Monday to Friday',
      url: './M - F Summer holidays.pdf',
      note: 'Stored in the main project directory'
    },
    {
      title: 'Pay Notes',
      url: './pay-notes.pdf',
      note: 'Stored in the main project directory'
    }
  ];

  const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  let currentPdfUrl = PDF_DOCUMENTS[0]?.url || '';
  let currentPdfTitle = PDF_DOCUMENTS[0]?.title || '';
  let pdfJsPromise = null;
  let renderToken = 0;
  let zoom = 1.15;

  function addStyle() {
    if (document.getElementById('elitePdfLibraryStyles')) return;

    const style = document.createElement('style');
    style.id = 'elitePdfLibraryStyles';
    style.textContent = `
      .pdf-library-modal {
        width: min(1100px, 100%);
        height: min(94dvh, 900px);
        background:
          radial-gradient(circle at 12% 0%, rgba(96,165,250,.28), transparent 36%),
          radial-gradient(circle at 92% 10%, rgba(250,204,21,.12), transparent 34%),
          linear-gradient(180deg, #07101f, #020817) !important;
        border: 1px solid rgba(147,197,253,.40) !important;
        box-shadow: 0 0 52px rgba(37,99,235,.34), inset 0 1px 0 rgba(255,255,255,.08) !important;
      }

      .pdf-library-body {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 12px;
        min-height: 0;
        height: 100%;
      }

      .pdf-library-list,
      .pdf-library-viewer {
        min-height: 0;
        border-radius: 22px;
        background: rgba(15,23,42,.72);
        border: 1px solid rgba(147,197,253,.18);
        overflow: hidden;
      }

      .pdf-library-list {
        display: grid;
        align-content: start;
        gap: 8px;
        padding: 10px;
        overflow: auto;
      }

      .pdf-library-item {
        display: grid;
        gap: 5px;
        width: 100%;
        min-height: 70px;
        padding: 11px;
        border-radius: 16px;
        border: 1px solid rgba(147,197,253,.22);
        background: linear-gradient(180deg, rgba(15,23,42,.96), rgba(2,6,23,.88));
        color: #f8fafc;
        cursor: pointer;
        text-align: left;
      }

      .pdf-library-item.active {
        border-color: rgba(134,239,172,.48);
        background: linear-gradient(180deg, rgba(20,83,45,.38), rgba(2,6,23,.88));
      }

      .pdf-library-item strong {
        font-weight: 1000;
      }

      .pdf-library-item span {
        color: #93c5fd;
        font-size: .74rem;
        font-weight: 850;
        line-height: 1.3;
      }

      .pdf-library-viewer {
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .pdf-library-toolbar {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        gap: 8px;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid rgba(147,197,253,.16);
      }

      .pdf-library-title {
        color: #dbeafe;
        font-weight: 1000;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .pdf-library-toolbar button {
        min-height: 40px;
        border-radius: 14px;
        border: 1px solid rgba(147,197,253,.30);
        background: linear-gradient(180deg, rgba(37,99,235,.32), rgba(15,23,42,.86));
        color: #dbeafe;
        font-weight: 1000;
        cursor: pointer;
        padding: 8px 12px;
      }

      #openPdfLibraryTabBtn {
        border-color: rgba(134,239,172,.40);
        background: linear-gradient(180deg, rgba(34,197,94,.32), rgba(20,83,45,.82));
        color: #dcfce7;
      }

      .pdf-library-canvas-viewer {
        min-height: 0;
        height: 100%;
        overflow: auto;
        padding: 14px;
        background: rgba(2,6,23,.45);
        -webkit-overflow-scrolling: touch;
      }

      .pdf-page {
        display: grid;
        gap: 8px;
        justify-items: center;
        margin: 0 auto 16px;
      }

      .pdf-page-label {
        color: #93c5fd;
        font-size: .72rem;
        font-weight: 1000;
      }

      .pdf-page canvas {
        max-width: 100%;
        height: auto !important;
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 14px 34px rgba(0,0,0,.38);
      }

      .pdf-library-empty {
        display: grid;
        place-items: center;
        min-height: 560px;
        padding: 18px;
        color: #bfdbfe;
        font-weight: 1000;
        text-align: center;
        line-height: 1.45;
      }

      .pdf-library-error {
        color: #fecaca;
      }

      #openPdfLibraryBtn .shell-icon {
        background: rgba(37,99,235,.18) !important;
        border-color: rgba(147,197,253,.34) !important;
      }

      @media (max-width: 760px) {
        #pdfLibraryBackdrop {
          align-items: flex-end;
          padding: 0;
        }

        .pdf-library-modal {
          width: 100%;
          height: 92dvh;
          border-radius: 28px 28px 0 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          border-bottom: 0 !important;
        }

        .pdf-library-body {
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr;
        }

        .pdf-library-list {
          grid-auto-flow: column;
          grid-auto-columns: minmax(210px, 1fr);
          overflow-x: auto;
          overflow-y: hidden;
        }

        .pdf-library-toolbar {
          grid-template-columns: 1fr auto auto;
        }

        #openPdfLibraryTabBtn {
          grid-column: 1 / -1;
        }

        .pdf-library-canvas-viewer,
        .pdf-library-empty {
          min-height: 58dvh;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function loadPdfJs() {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return Promise.resolve(window.pdfjsLib);
    }

    if (pdfJsPromise) return pdfJsPromise;

    pdfJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = PDFJS_URL;
      script.onload = () => {
        if (!window.pdfjsLib) {
          reject(new Error('PDF.js failed to load'));
          return;
        }

        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('PDF.js could not be loaded'));
      document.head.appendChild(script);
    });

    return pdfJsPromise;
  }

  function ensureModal() {
    addStyle();

    if (document.getElementById('pdfLibraryBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'pdfLibraryBackdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
      <div class="modal pdf-library-modal" role="dialog" aria-modal="true" aria-labelledby="pdfLibraryTitle">
        <div class="modal-head">
          <div class="modal-title" id="pdfLibraryTitle">Elite PDF Library</div>
          <button id="closePdfLibraryBtn" type="button">✕</button>
        </div>

        <div class="pdf-library-body">
          <div class="pdf-library-list" id="pdfLibraryList"></div>

          <div class="pdf-library-viewer">
            <div class="pdf-library-toolbar">
              <div class="pdf-library-title" id="pdfLibraryCurrentTitle">Select a PDF</div>
              <button id="pdfZoomOutBtn" type="button">−</button>
              <button id="pdfZoomInBtn" type="button">+</button>
              <button id="openPdfLibraryTabBtn" type="button">Open tab</button>
            </div>
            <div id="pdfLibraryFrameWrap" class="pdf-library-canvas-viewer">
              <div class="pdf-library-empty">Select a PDF to view it here.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('closePdfLibraryBtn')?.addEventListener('click', closePdfLibrary);
    document.getElementById('openPdfLibraryTabBtn')?.addEventListener('click', openCurrentPdfTab);
    document.getElementById('pdfZoomOutBtn')?.addEventListener('click', () => changeZoom(-0.15));
    document.getElementById('pdfZoomInBtn')?.addEventListener('click', () => changeZoom(0.15));

    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) closePdfLibrary();
    });
  }

  function renderPdfList() {
    const list = document.getElementById('pdfLibraryList');
    if (!list) return;

    if (!PDF_DOCUMENTS.length) {
      list.innerHTML = `
        <div class="pdf-library-empty">
          No PDFs configured yet.<br>
          Add PDF files beside index.html and list them in pdf-library.js.
        </div>
      `;
      return;
    }

    list.innerHTML = PDF_DOCUMENTS.map((doc, index) => `
      <button class="pdf-library-item ${doc.url === currentPdfUrl ? 'active' : ''}" type="button" data-pdf-index="${index}">
        <strong>${escapeHtml(doc.title)}</strong>
        <span>${escapeHtml(doc.note || doc.url)}</span>
      </button>
    `).join('');

    list.querySelectorAll('[data-pdf-index]').forEach(button => {
      button.addEventListener('click', () => {
        const doc = PDF_DOCUMENTS[Number(button.dataset.pdfIndex)];
        if (doc) selectPdf(doc);
      });
    });
  }

  async function renderPdfDocument(doc) {
    const wrap = document.getElementById('pdfLibraryFrameWrap');
    if (!wrap) return;

    const token = ++renderToken;
    wrap.innerHTML = `<div class="pdf-library-empty">Loading PDF…</div>`;

    try {
      const pdfjsLib = await loadPdfJs();
      const pdf = await pdfjsLib.getDocument(doc.url).promise;

      if (token !== renderToken) return;

      wrap.innerHTML = '';

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        if (token !== renderToken) return;

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: zoom });
        const dpr = window.devicePixelRatio || 1;

        const pageWrap = document.createElement('div');
        pageWrap.className = 'pdf-page';

        const label = document.createElement('div');
        label.className = 'pdf-page-label';
        label.textContent = `Page ${pageNumber} of ${pdf.numPages}`;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        pageWrap.appendChild(label);
        pageWrap.appendChild(canvas);
        wrap.appendChild(pageWrap);

        await page.render({ canvasContext: context, viewport }).promise;
      }
    } catch (error) {
      wrap.innerHTML = `
        <div class="pdf-library-empty pdf-library-error">
          This PDF could not be rendered inside the mobile viewer.<br><br>
          Check that the file exists in the main directory:<br>
          <strong>${escapeHtml(doc.url)}</strong><br><br>
          You can still use <strong>Open tab</strong>.
        </div>
      `;
    }
  }

  function selectPdf(doc) {
    currentPdfUrl = doc.url;
    currentPdfTitle = doc.title;

    const title = document.getElementById('pdfLibraryCurrentTitle');
    if (title) title.textContent = doc.title;

    renderPdfList();
    renderPdfDocument(doc);
  }

  function changeZoom(amount) {
    zoom = Math.max(0.65, Math.min(2.2, zoom + amount));

    const selected = PDF_DOCUMENTS.find(doc => doc.url === currentPdfUrl);
    if (selected) renderPdfDocument(selected);
  }

  function openCurrentPdfTab() {
    if (!currentPdfUrl) {
      if (typeof setStatus === 'function') setStatus('Select a PDF first');
      return;
    }

    window.open(currentPdfUrl, '_blank', 'noopener,noreferrer');
  }

  function openPdfLibrary() {
    ensureModal();

    document.getElementById('shellMenuBackdrop')?.classList.remove('open');

    const backdrop = document.getElementById('pdfLibraryBackdrop');
    if (!backdrop) return;

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');

    renderPdfList();

    if (PDF_DOCUMENTS.length) {
      const selected = PDF_DOCUMENTS.find(doc => doc.url === currentPdfUrl) || PDF_DOCUMENTS[0];
      selectPdf(selected);
    }
  }

  function closePdfLibrary() {
    const backdrop = document.getElementById('pdfLibraryBackdrop');
    if (!backdrop) return;

    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  function addPdfLibraryButton() {
    addStyle();

    const shellGrid = document.querySelector('#shellHomeView .shell-grid');
    if (!shellGrid) return;

    let button = document.getElementById('openPdfLibraryBtn');

    if (!button) {
      button = document.createElement('button');
      button.id = 'openPdfLibraryBtn';
      button.className = 'shell-action';
      button.type = 'button';
      button.innerHTML = `
        <span class="shell-icon">📄</span>
        <span class="shell-label">PDF Library</span>
        <span class="shell-note">View uploaded app PDFs</span>
      `;
      button.addEventListener('click', openPdfLibrary);
    }

    const repButton = document.getElementById('openRepOnDemandBtn');
    const rotaButton = document.getElementById('openRotaPopupBtn');

    if (repButton?.parentElement === shellGrid) {
      repButton.insertAdjacentElement('afterend', button);
    } else if (rotaButton?.parentElement === shellGrid) {
      rotaButton.insertAdjacentElement('afterend', button);
    } else {
      shellGrid.prepend(button);
    }
  }

  function init() {
    ensureModal();
    addPdfLibraryButton();

    setTimeout(addPdfLibraryButton, 250);
    setTimeout(addPdfLibraryButton, 750);
    setTimeout(addPdfLibraryButton, 1200);
  }

  window.openPdfLibrary = openPdfLibrary;
  window.closePdfLibrary = closePdfLibrary;

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePdfLibrary();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
