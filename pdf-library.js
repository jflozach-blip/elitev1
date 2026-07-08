'use strict';

(function initElitePdfLibrary() {
  if (window.__elitePdfLibraryLoaded) return;
  window.__elitePdfLibraryLoaded = true;

  const PDF_DOCUMENTS = [
    {
      title: 'Monday - Friday Summer Duties',
      url: 'pdfs/driver-handbook.pdf',
      note: 'Add this PDF file to your project under pdfs/driver-handbook.pdf'
    },
    {
      title: 'Pay Notes',
      url: 'pdfs/pay-notes.pdf',
      note: 'Add this PDF file to your project under pdfs/pay-notes.pdf'
    }
  ];

  let currentPdfUrl = PDF_DOCUMENTS[0]?.url || '';

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
        grid-template-columns: 1fr auto;
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
        border: 1px solid rgba(134,239,172,.40);
        background: linear-gradient(180deg, rgba(34,197,94,.32), rgba(20,83,45,.82));
        color: #dcfce7;
        font-weight: 1000;
        cursor: pointer;
        padding: 8px 12px;
      }

      .pdf-library-frame {
        width: 100%;
        height: 100%;
        min-height: 620px;
        border: 0;
        background: #111827;
      }

      .pdf-library-empty {
        display: grid;
        place-items: center;
        min-height: 620px;
        padding: 18px;
        color: #bfdbfe;
        font-weight: 1000;
        text-align: center;
        line-height: 1.45;
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

        .pdf-library-frame,
        .pdf-library-empty {
          min-height: 58dvh;
        }
      }
    `;
    document.head.appendChild(style);
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
              <button id="openPdfLibraryTabBtn" type="button">Open tab</button>
            </div>
            <div id="pdfLibraryFrameWrap"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('closePdfLibraryBtn')?.addEventListener('click', closePdfLibrary);
    document.getElementById('openPdfLibraryTabBtn')?.addEventListener('click', openCurrentPdfTab);

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
          Add PDF files to the project and list them in pdf-library.js.
        </div>
      `;
      return;
    }

    list.innerHTML = PDF_DOCUMENTS.map((doc, index) => `
      <button class="pdf-library-item ${doc.url === currentPdfUrl ? 'active' : ''}" type="button" data-pdf-index="${index}">
        <strong>${doc.title}</strong>
        <span>${doc.note || doc.url}</span>
      </button>
    `).join('');

    list.querySelectorAll('[data-pdf-index]').forEach(button => {
      button.addEventListener('click', () => {
        const doc = PDF_DOCUMENTS[Number(button.dataset.pdfIndex)];
        if (doc) selectPdf(doc);
      });
    });
  }

  function selectPdf(doc) {
    currentPdfUrl = doc.url;

    const title = document.getElementById('pdfLibraryCurrentTitle');
    const wrap = document.getElementById('pdfLibraryFrameWrap');

    if (title) title.textContent = doc.title;

    if (wrap) {
      wrap.innerHTML = `
        <iframe
          class="pdf-library-frame"
          src="${doc.url}#toolbar=1&navpanes=0"
          title="${doc.title}"
        ></iframe>
      `;
    }

    renderPdfList();
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