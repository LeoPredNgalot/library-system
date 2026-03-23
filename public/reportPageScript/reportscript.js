/* ══════════════════════════════════════════════════════
   INVENTORY REPORT — reportscript.js
   Uses /reports/inventory/data (JSON) for all filter /
   paginate updates. Zero full-page reloads.
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     STATE — mirrors what the server accepts
  ───────────────────────────────────────── */
  const state = {
    search:    '',
    genre:     '',
    dateRange: '',
    dateFrom:  '',
    dateTo:    '',
    page:      1,
  };

  /* ─────────────────────────────────────────
     DOM REFERENCES
  ───────────────────────────────────────── */
  const summaryGrid     = document.querySelector('.summary-grid');
  const tableScroll     = document.querySelector('.table-scroll');
  const paginationEl    = document.querySelector('.pagination');
  const filterBadgeWrap = document.querySelector('.table-filter');
  const searchInput     = document.querySelector('input[name="search"]');
  const genreSelect     = document.querySelector('select[name="genre"]');
  const dateFromInput   = document.querySelector('input[name="dateFrom"]');
  const dateToInput     = document.querySelector('input[name="dateTo"]');
  const customRangeWrap = document.getElementById('customRangeWrap');
  const dateRangeInput  = document.getElementById('dateRangeInput');
  const filterForm      = document.getElementById('filterForm');

  /* ─────────────────────────────────────────
     BOOTSTRAP
  ───────────────────────────────────────── */
  function init() {
    state.search    = searchInput?.value    || '';
    state.genre     = genreSelect?.value    || '';
    state.dateRange = dateRangeInput?.value || '';
    state.dateFrom  = dateFromInput?.value  || '';
    state.dateTo    = dateToInput?.value    || '';
    state.page      = 1;

    filterForm?.addEventListener('submit', e => e.preventDefault());
    updateCustomRangeVisibility();
    updateDateRangeBtns();
    wireStaticListeners();
  }

  /* ─────────────────────────────────────────
     BUILD QUERY STRING
  ───────────────────────────────────────── */
  function buildQuery() {
    const q = new URLSearchParams();
    if (state.search)    q.set('search',    state.search);
    if (state.genre)     q.set('genre',     state.genre);
    if (state.dateRange) q.set('dateRange', state.dateRange);
    if (state.dateFrom)  q.set('dateFrom',  state.dateFrom);
    if (state.dateTo)    q.set('dateTo',    state.dateTo);
    q.set('page', state.page);
    return q.toString();
  }

  /* ─────────────────────────────────────────
     FETCH JSON & RENDER
  ───────────────────────────────────────── */
  async function fetchAndRender() {
    setLoadingState(true);
    try {
      const res  = await fetch(`/reports/inventory/data?${buildQuery()}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Unknown error');

      renderSummary(data.summary);
      renderTable(data.books);
      renderPagination(data.pagination);
      renderFilterBadge(data.filters, data.pagination);
      updateBrowserUrl();

    } catch (err) {
      console.error('[Inventory] fetchAndRender error:', err);
    } finally {
      setLoadingState(false);
    }
  }

  /* ─────────────────────────────────────────
     LOADING STATE
  ───────────────────────────────────────── */
  function setLoadingState(loading) {
    [tableScroll, paginationEl].forEach(el => {
      if (!el) return;
      el.style.opacity       = loading ? '0.45' : '';
      el.style.pointerEvents = loading ? 'none'  : '';
      el.style.transition    = 'opacity 0.15s';
    });
  }

  /* ─────────────────────────────────────────
     RENDER — SUMMARY CARDS
  ───────────────────────────────────────── */
  function renderSummary(s) {
    if (!summaryGrid) return;
    summaryGrid.innerHTML = `
      <div class="stat-card"><div class="stat-label">Total Books</div><div class="stat-value accent">${s.total_titles}</div></div>
      <div class="stat-card"><div class="stat-label">Total Copies</div><div class="stat-value">${s.total_copies}</div></div>
      <div class="stat-card"><div class="stat-label">Available</div><div class="stat-value green">${s.total_available}</div></div>
      <div class="stat-card"><div class="stat-label">Borrowed</div><div class="stat-value yellow">${s.total_borrowed}</div></div>
      <div class="stat-card"><div class="stat-label">Lost</div><div class="stat-value red">${s.total_lost}</div></div>
      <div class="stat-card"><div class="stat-label">Damaged</div><div class="stat-value orange">${s.total_damaged}</div></div>
    `;
  }

  /* ─────────────────────────────────────────
     RENDER — TABLE
  ───────────────────────────────────────── */
  function esc(str) {
    return String(str ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtDate(raw) {
    if (!raw) return '—';
    return new Date(raw).toLocaleDateString('en-US', {
      year:'numeric', month:'short', day:'numeric'
    });
  }

  function countBadge(val, cls) {
    const num = Number(val) || 0;
    return `<span class="count-badge ${num > 0 ? cls : 'badge-zero'}">${num}</span>`;
  }

  function renderTable(books) {
    if (!tableScroll) return;

    const thead = `
      <thead><tr>
        <th>ID</th><th>Title</th><th>Author</th><th>Genre</th><th>Year</th>
        <th>Total</th><th>Available</th><th>Borrowed</th><th>Lost</th><th>Damaged</th>
        <th>Location</th><th>Publisher</th><th>ISBN</th><th>Date Added</th>
        <th class="no-print">Action</th>
      </tr></thead>`;

    if (!books.length) {
      tableScroll.innerHTML = `<table>${thead}<tbody>
        <tr class="no-data"><td colspan="15">No books found.</td></tr>
      </tbody></table>`;
      return;
    }

    const rows = books.map(b => `
      <tr>
        <td><span class="cell-id">${esc(b.id)}</span></td>
        <td><span class="cell-title">${esc(b.title)}</span></td>
        <td>${esc(b.author)}</td>
        <td>${esc(b.genre) || '—'}</td>
        <td>${esc(b.year_published) || '—'}</td>
        <td>${countBadge(b.total_copies,    'badge-total')}</td>
        <td>${countBadge(b.available_count, 'badge-avail')}</td>
        <td>${countBadge(b.borrowed_count,  'badge-borrowed')}</td>
        <td>${countBadge(b.lost_count,      'badge-lost')}</td>
        <td>${countBadge(b.damaged_count,   'badge-damaged')}</td>
        <td>${esc(b.book_location) || '—'}</td>
        <td>${esc(b.publisher)     || '—'}</td>
        <td><span class="cell-mono">${esc(b.isbn) || '—'}</span></td>
        <td><span class="cell-mono">${fmtDate(b.date_added)}</span></td>
        <td class="no-print">
          <button class="btn-view view-book-btn" data-id="${esc(b.id)}">
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            View
          </button>
        </td>
      </tr>`).join('');

    tableScroll.innerHTML = `<table>${thead}<tbody>${rows}</tbody></table>`;
  }

  /* ─────────────────────────────────────────
     RENDER — PAGINATION
  ───────────────────────────────────────── */
  function renderPagination(p) {
    if (!paginationEl) return;

    const chevL = `<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`;
    const chevR = `<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;

    const prev = p.hasPrev
      ? `<button class="pg-btn" data-page="${p.prevPage}">${chevL} Prev</button>`
      : `<span class="pg-btn disabled">${chevL} Prev</span>`;

    const next = p.hasNext
      ? `<button class="pg-btn" data-page="${p.nextPage}">Next ${chevR}</button>`
      : `<span class="pg-btn disabled">Next ${chevR}</span>`;

    paginationEl.innerHTML = `
      <p class="page-info">
        Page <span>${p.page}</span> of <span>${p.totalPages}</span>
        &nbsp;·&nbsp; <span>${p.totalBooks}</span> books total
      </p>
      <div class="pg-btns">${prev}${next}</div>`;
  }

  /* ─────────────────────────────────────────
     RENDER — FILTER BADGE
  ───────────────────────────────────────── */
  function renderFilterBadge(filters, pagination) {
    filterBadgeWrap?.querySelector('.filter-badge')?.remove();

    const hasFilter = filters.search || filters.genre || filters.dateRange;
    if (!hasFilter || !filterBadgeWrap) return;

    const parts = [`Showing <strong>${pagination.totalBooks}</strong> books`];
    if (filters.dateRange === 'this_week')  parts.push(`<strong>This Week</strong>`);
    if (filters.dateRange === 'this_month') parts.push(`<strong>This Month</strong>`);
    if (filters.dateRange === 'custom' && (filters.dateFrom || filters.dateTo)) {
      parts.push(`<strong>${esc(filters.dateFrom) || '…'}</strong> to <strong>${esc(filters.dateTo) || '…'}</strong>`);
    }
    if (filters.genre)  parts.push(`Genre: <strong>${esc(filters.genre)}</strong>`);
    if (filters.search) parts.push(`"<strong>${esc(filters.search)}</strong>"`);

    const badge = document.createElement('div');
    badge.className = 'filter-badge';
    badge.innerHTML = parts.join(' · ');
    filterBadgeWrap.appendChild(badge);
  }

  /* ─────────────────────────────────────────
     BROWSER URL
  ───────────────────────────────────────── */
  function updateBrowserUrl() {
    const q = buildQuery();
    history.replaceState(null, '', `/reports/inventory${q ? '?' + q : ''}`);
  }

  /* ─────────────────────────────────────────
     UI HELPERS
  ───────────────────────────────────────── */
  function updateCustomRangeVisibility() {
    if (customRangeWrap) {
      customRangeWrap.style.display = state.dateRange === 'custom' ? 'flex' : 'none';
    }
  }

  function updateDateRangeBtns() {
    document.querySelectorAll('.date-range-btn').forEach(btn => {
      const val = btn.dataset.range
        || (btn.getAttribute('onclick') || '').match(/setDateRange\('([^']+)'\)/)?.[1]
        || '';
      btn.classList.toggle('active', val === state.dateRange);
    });
  }

  /* ─────────────────────────────────────────
     STATIC LISTENERS (filter bar elements)
  ───────────────────────────────────────── */
  function wireStaticListeners() {
    // Search on Enter
    searchInput?.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      state.search = searchInput.value.trim();
      state.page   = 1;
      fetchAndRender();
    });

    // Genre on change
    genreSelect?.addEventListener('change', () => {
      state.genre = genreSelect.value;
      state.page  = 1;
      fetchAndRender();
    });

    // Clear
    document.querySelector('.btn-clear')?.addEventListener('click', e => {
      e.preventDefault();
      state.search = state.genre = state.dateRange = state.dateFrom = state.dateTo = '';
      state.page   = 1;
      if (searchInput)    searchInput.value    = '';
      if (genreSelect)    genreSelect.value    = '';
      if (dateFromInput)  dateFromInput.value  = '';
      if (dateToInput)    dateToInput.value    = '';
      if (dateRangeInput) dateRangeInput.value = '';
      updateCustomRangeVisibility();
      updateDateRangeBtns();
      fetchAndRender();
    });
  }

  /* ─────────────────────────────────────────
     DELEGATED LISTENERS
     (survive table / pagination re-renders)
  ───────────────────────────────────────── */
  document.addEventListener('click', async e => {

    // Pagination
    const pgBtn = e.target.closest('.pg-btn[data-page]');
    if (pgBtn) {
      e.preventDefault();
      state.page = parseInt(pgBtn.dataset.page, 10);
      fetchAndRender();
      document.querySelector('.table-card')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // View Book
    const viewBtn = e.target.closest('.view-book-btn');
    if (viewBtn) {
      setModalSkeletons();
      openModal();
      try {
        const res  = await fetch(`/book/api/${viewBtn.dataset.id}`);
        const data = await res.json();
        if (data.success) renderModal(data.book, data.bookCopies);
        else setModalError('Failed to load book data.');
      } catch {
        setModalError('Error loading book.');
      }
    }

  });

  /* ─────────────────────────────────────────
     GLOBAL FUNCTIONS (called by onclick= in HTML)
  ───────────────────────────────────────── */

  window.setDateRange = function (val) {
    state.dateRange = val;
    state.page      = 1;
    if (dateRangeInput) dateRangeInput.value = val;
    updateCustomRangeVisibility();
    updateDateRangeBtns();

    if (val !== 'custom') {
      state.dateFrom = state.dateTo = '';
      if (dateFromInput) dateFromInput.value = '';
      if (dateToInput)   dateToInput.value   = '';
      fetchAndRender();   // ← AJAX, not form.submit()
    }
    // 'custom' → waits for Apply click
  };

  window.applyFilters = function () {
    state.search   = (searchInput?.value   || '').trim();
    state.genre    =  genreSelect?.value   || '';
    state.dateFrom =  dateFromInput?.value || '';
    state.dateTo   =  dateToInput?.value   || '';
    if ((state.dateFrom || state.dateTo) && !state.dateRange) {
      state.dateRange = 'custom';
      updateCustomRangeVisibility();
      updateDateRangeBtns();
    }
    state.page = 1;
    fetchAndRender();   // ← AJAX, not form.submit()
  };

  window.printReport = () => window.print();

  window.downloadPDF = function () {
    const orig = document.title;
    document.title = 'Inventory-Report-' + new Date().toISOString().slice(0, 10);
    window.print();
    document.title = orig;
  };

  /* ─────────────────────────────────────────
     MODAL
  ───────────────────────────────────────── */
  const modal       = document.getElementById('bookModal');
  const closeBtn    = document.getElementById('closeModal');
  const closeFooter = document.getElementById('closeModalFooter');

  function openModal()  { modal?.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  function closeModal() { modal?.classList.add('hidden');    document.body.style.overflow = ''; }

  closeBtn?.addEventListener('click',  closeModal);
  closeFooter?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function setModalSkeletons() {
    const sk = h => `<div class="skeleton" style="height:${h};border-radius:4px;"></div>`;
    const set = (id, html, text = false) => {
      const el = document.getElementById(id);
      if (!el) return;
      text ? el.textContent = html : el.innerHTML = html;
    };
    set('modalSub',    'Loading…', true);
    set('modalTitle',  sk('18px'));
    set('modalAuthor', sk('14px'));
    const cover = document.getElementById('modalCover');
    if (cover) cover.innerHTML = sk('100%');
    const strip = document.getElementById('modalCopyStrip');
    if (strip) strip.innerHTML = ['Total','Available','Borrowed','Lost','Damaged'].map(l =>
      `<div class="copy-stat">
         <div class="copy-stat-val skeleton" style="height:22px;width:30px;margin:0 auto;"></div>
         <div class="copy-stat-lbl">${l}</div>
       </div>`).join('');
    ['md-genre','md-year','md-publisher','md-location','md-isbn','md-date']
      .forEach(id => set(id, '—', true));
    const list = document.getElementById('modalCopiesList');
    if (list) list.innerHTML =
      `<li style="justify-content:center;color:var(--text-muted);font-size:13px;">Loading copies…</li>`;
  }

  function setModalError(msg) {
    const el = document.getElementById('modalSub');
    if (el) el.textContent = msg;
  }

  function renderModal(book, copies) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '—';
    };

    set('modalSub', `ID: ${book.id}`);

    const cover = document.getElementById('modalCover');
    if (cover) {
      const src = book.book_photo_file_path || book.bookPhotoFilePath;
      cover.innerHTML = src
        ? `<img src="/uploads/${src}" alt="${esc(book.title)}" onerror="this.parentElement.innerHTML='<span class=\\'book-cover-placeholder\\'>No Photo</span>'" />`
        : `<span class="book-cover-placeholder">No Photo</span>`;
    }

    set('modalTitle',  book.title);
    set('modalAuthor', book.author ? `by ${book.author}` : '—');

    const total    = copies.length;
    const avail    = copies.filter(c => c.available === 1 || c.available === true).length;
    const borrowed = copies.filter(c => !c.available && c.status !== 'LOST' && c.status !== 'DAMAGED').length;
    const lost     = copies.filter(c => c.status === 'LOST').length;
    const damaged  = copies.filter(c => c.status === 'DAMAGED').length;

    const strip = document.getElementById('modalCopyStrip');
    if (strip) strip.innerHTML = `
      <div class="copy-stat"><div class="copy-stat-val">${total}</div><div class="copy-stat-lbl">Total</div></div>
      <div class="copy-stat"><div class="copy-stat-val green">${avail}</div><div class="copy-stat-lbl">Available</div></div>
      <div class="copy-stat"><div class="copy-stat-val yellow">${borrowed}</div><div class="copy-stat-lbl">Borrowed</div></div>
      <div class="copy-stat"><div class="copy-stat-val red">${lost}</div><div class="copy-stat-lbl">Lost</div></div>
      <div class="copy-stat"><div class="copy-stat-val orange">${damaged}</div><div class="copy-stat-lbl">Damaged</div></div>`;

    set('md-genre',     book.genre);
    set('md-year',      book.year_published);
    set('md-publisher', book.publisher);
    set('md-location',  book.book_location);
    set('md-isbn',      book.isbn);

    const dateEl = document.getElementById('md-date');
    if (dateEl) dateEl.textContent = fmtDate(book.date_added);

    const list = document.getElementById('modalCopiesList');
    if (!list) return;
    list.innerHTML = !copies.length
      ? `<li style="justify-content:center;color:var(--text-muted);font-size:13px;">No copies found.</li>`
      : copies.map(c => {
          const id      = c.copy_id || c.copyId || c.id || '—';
          const isAvail = c.available === 1 || c.available === true;
          return `<li>
            <span class="copy-id">${esc(id)}</span>
            <span class="copy-badge ${isAvail ? 'copy-available' : 'copy-unavailable'}">
              ${isAvail ? 'Available' : (c.status || 'Unavailable')}
            </span>
          </li>`;
        }).join('');
  }

  /* ─────────────────────────────────────────
     START
  ───────────────────────────────────────── */
  init();

})();