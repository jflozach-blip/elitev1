'use strict';

(function initSimplePdfLibrary() {
  if (window.__simplePdfLibraryLoaded) return;
  window.__simplePdfLibraryLoaded = true;

  const PDF_DOCUMENTS = [
    {
      title: 'Driver Handbook',
      file: 'driver-handbook.pdf'
    },
    {
      title: 'Pay Notes',
      file: 'pay-notes.pdf'
    }
  ];

  const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';

  let selectedPdf = PDF_DOCUMENTS[0] || null;
  let pdfJsPromise = null;
  let renderId = 0;
  let zoom = 1;

  function pdfUrl(doc) {
    return `./${doc.file}`;
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

  function addStyle() {
    if (document.getElementById('simplePdfLibraryStyles')) return;

    const style = document.createElement('style');
    style.id = 'simplePdfLibraryStyles';
    style.textContent = `
      .pdf-library-modal {
        width: min(1100px, 100%);
        height: min(94dvh, 900px);
        background: linear-gradient(180deg, #07101f, #020817) !important;
        border: 1px solid rgba(147,197,253,.38) !important;
      }

      .pdf-library-body {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 12px;
        min-height: 0;
        height: 100%;
      }

      .pdf-library-list,
      .pdf-library-view {
        min-height: 0;
        border-radius: 18px;
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
        padding: 12px;
        min-height: 62px;
        border-radius: 14px;
        border: 1px solid rgba(147,197,253,.22);
        background: #071225;
        color: #f8fafc;
        font-weight: 1000;
        text-align: left;
        cursor: pointer;
      }

      .pdf-library-item.active {
        border-color: rgba(34,197,94,.55);
        background: rgba(20,83,45,.35);
      }

      .pdf-library-view {
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .pdf-library-toolbar {
        display: grid;
        grid-template-columns: 1fr auto auto auto auto;
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

      .pdf-library-toolbar button,
      .pdf-library-toolbar a {
        min-height: 40px;
        border-radius: 12px;
        border: 1px solid rgba(147,197,253,.30);
        background: rgba(37,99,235,.28);
        color: #dbeafe;
        font-weight: 1000;
        cursor: pointer;
        padding: 9px 12px;
        text-decoration: none;
      }

      .pdf-pages {
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
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 12px 28px rgba(0,0,0,.38);
      }

      .pdf-message {
        min-height: 54dvh;
        display: grid;
        place-items: center;
        text-align: center;
        color: #bfdbfe;
        font-weight: 1000;
        line-height: 1.45;
        padding: 18px;
      }

      .pdf-error {
        color: #fecaca;
      }

      @media (max-width: 760px) {
        #pdfLibraryBackdrop {
          align-items: flex-end;
          padding: 0;
        }

        .pdf-library-modal {
          width: 100%;
          height: 92dvh;
          border-radius: 26px 26px 0 0 !important;
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
          grid-auto-columns: minmax(190px, 1fr);
          overflow-x: auto;
          overflow-y: hidden;
        }

        .pdf-library-toolbar {
          grid-template-columns: 1fr auto auto;
        }

        #pdfOpenLink,
        #pdfDownloadLink {
          grid-column: span 1;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfJsPromise) return pdfJsPromise;

    pdfJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = PDFJS_URL;
      script.onload = () => {
        if (!window.pdfjsLib) {
          reject(new Error('PDF.js did not load'));
          return;
        }

        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('Could not load PDF.js'));
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
          <div class="modal-title" id="pdfLibraryTitle">PDF Library</div>
          <button id="closePdfLibraryBtn" type="button">✕</button>
        </div>

        <div class="pdf-library-body">
          <div class="pdf-library-list" id="pdfLibraryList"></div>

          <div class="pdf-library-view">
            <div class="pdf-library-toolbar">
              <div class="pdf-library-title" id="pdfCurrentTitle">Select a PDF</div>
              <button id="pdfZoomOutBtn" type="button">−</button>
              <button id="pdfZoomInBtn" type="button">+</button>
              <a id="pdfOpenLink" href="#" target="_blank" rel="noopener">Open</a>
              <a id="pdfDownloadLink" href="#" download>Download</a>
            </div>

            <div id="pdfPages" class="pdf-pages">
              <div class="pdf-message">Select a PDF to view it here.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('closePdfLibraryBtn')?.addEventListener('click', closePdfLibrary);
    document.getElementById('pdfZoomOutBtn')?.addEventListener('click', () => changeZoom(-0.15));
    document.getElementById('pdfZoomInBtn')?.addEventListener('click', () => changeZoom(0.15));

    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) closePdfLibrary();
    });
  }

  function renderList() {
    const list = document.getElementById('pdfLibraryList');
    if (!list) return;

    list.innerHTML = PDF_DOCUMENTS.map((doc, index) => `
      <button class="pdf-library-item ${selectedPdf === doc ? 'active' : ''}" type="button" data-pdf-index="${index}">
        ${escapeHtml(doc.title)}
      </button>
    `).join('');

    list.querySelectorAll('[data-pdf-index]').forEach(button => {
      button.addEventListener('click', () => {
        selectedPdf = PDF_DOCUMENTS[Number(button.dataset.pdfIndex)];
        renderList();
        renderSelectedPdf();
      });
    });
  }

  async function fetchPdfBytes(url) {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`File not found or not served: ${url}`);
    }

    const buffer = await response.arrayBuffer();
    const firstBytes = new Uint8Array(buffer.slice(0, 4));
    const signature = String.fromCharCode(...firstBytes);

    if (signature !== '%PDF') {
      throw new Error(`This file is not being served as a PDF: ${url}`);
    }

    return buffer;
  }

  async function renderSelectedPdf() {
    const pages = document.getElementById('pdfPages');
    const title = document.getElementById('pdfCurrentTitle');
    const openLink = document.getElementById('pdfOpenLink');
    const downloadLink = document.getElementById('pdfDownloadLink');

    if (!pages || !selectedPdf) return;

    const url = pdfUrl(selectedPdf);
    const currentRender = ++renderId;

    if (title) title.textContent = selectedPdf.title;
    if (openLink) openLink.href = url;
    if (downloadLink) {
      downloadLink.href = url;
      downloadLink.download = selectedPdf.file;
    }

    pages.innerHTML = `<div class="pdf-message">Loading PDF…</div>`;

    try {
      const [pdfjsLib, pdfBytes] = await Promise.all([
        loadPdfJs(),
        fetchPdfBytes(url)
      ]);

      if (currentRender !== renderId) return;

      const pdf = await pdfjsLib.getDocument({
        data: pdfBytes,
        disableWorker: true
      }).promise;

      if (currentRender !== renderId) return;

      pages.innerHTML = '';

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        if (currentRender !== renderId) return;

        const page = await pdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(280, pages.clientWidth - 32);
        const scale = Math.min(2.4, Math.max(0.5, (availableWidth / baseViewport.width) * zoom));
        const viewport = page.getViewport({ scale });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-page';

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

        wrapper.appendChild(label);
        wrapper.appendChild(canvas);
        pages.appendChild(wrapper);

        await page.render({ canvasContext: context, viewport }).promise;
      }
    } catch (error) {
      pages.innerHTML = `
        <div class="pdf-message pdf-error">
          Could not display this PDF inside the app.<br><br>
          Checked file:<br>
          <strong>${escapeHtml(url)}</strong><br><br>
          Use <strong>Open</strong> above to test the file directly.
        </div>
      `;
    }
  }

  function changeZoom(amount) {
    zoom = Math.max(0.65, Math.min(2.2, zoom + amount));
    renderSelectedPdf();
  }

  function openPdfLibrary() {
    ensureModal();

    document.getElementById('shellMenuBackdrop')?.classList.remove('open');

    const backdrop = document.getElementById('pdfLibraryBackdrop');
    if (!backdrop) return;

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');

    renderList();
    renderSelectedPdf();
  }

  function closePdfLibrary() {
    const backdrop = document.getElementById('pdfLibraryBackdrop');
    if (!backdrop) return;

    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  function addMenuButton() {
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
        <span class="shell-note">View PDFs stored in main directory</span>
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
    addMenuButton();

    setTimeout(addMenuButton, 250);
    setTimeout(addMenuButton, 750);
    setTimeout(addMenuButton, 1200);
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
