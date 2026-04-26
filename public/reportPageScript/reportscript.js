 // ── Init custom range visibility on page load ──
  (function() {
    const wrap = document.getElementById('customRangeWrap');
    if ('<%= filters.dateRange %>' !== 'custom') wrap.style.display = 'none';
  })();

  // ── Date range logic ──
  function setDateRange(val) {
    document.getElementById('dateRangeInput').value = val;
    document.querySelectorAll('.date-range-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.date-range-btn[onclick="setDateRange('${val}')"]`).classList.add('active');
    document.getElementById('customRangeWrap').style.display = val === 'custom' ? 'flex' : 'none';
    if (val !== 'custom') document.getElementById('filterForm').submit();
  }

  
  function applyFilters() {
    const dr   = document.getElementById("dateRangeInput").value;
    const from = document.querySelector("[name=dateFrom]").value;
    const to   = document.querySelector("[name=dateTo]").value;
    if ((from || to) && !dr) {
      document.getElementById("dateRangeInput").value = "custom";
    }
    document.getElementById("filterForm").submit();
  }

  // ── Print ──
  function printReport() {
    window.print();
  }

  // ── Download PDF ──
  function downloadPDF() {
    const toast = document.createElement('div');
    
    document.body.appendChild(toast);
    setTimeout(() => {
      const original = document.title;
      document.title = 'Inventory-Report-' + new Date().toISOString().slice(0, 10);
      window.print();
      document.title = original;
      setTimeout(() => toast.remove(), 500);
    }, 1200);
  }

  // ── Modal ──
  const modal       = document.getElementById('bookModal');
  const closeBtn    = document.getElementById('closeModal');
  const closeFooter = document.getElementById('closeModalFooter');

  function openModal()  { modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  function closeModal() { modal.classList.add('hidden');    document.body.style.overflow = ''; }

  closeBtn.addEventListener('click', closeModal);
  closeFooter.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function setSkeletons() {
    document.getElementById('modalSub').textContent    = 'Loading…';
    document.getElementById('modalTitle').innerHTML    = '<div class="skeleton" style="height:18px;width:80%;margin-bottom:8px;"></div>';
    document.getElementById('modalAuthor').innerHTML   = '<div class="skeleton" style="height:14px;width:50%;"></div>';
    document.getElementById('modalCover').innerHTML    = '<div class="skeleton" style="width:100%;height:100%;"></div>';
    document.getElementById('modalCopyStrip').innerHTML = ['Total','Available','Borrowed','Lost','Damaged'].map(l =>
      `<div class="copy-stat"><div class="copy-stat-val skeleton" style="height:22px;width:30px;margin:0 auto;"></div><div class="copy-stat-lbl">${l}</div></div>`
    ).join('');
    ['md-genre','md-year','md-publisher','md-location','md-isbn','md-date'].forEach(id => {
      document.getElementById(id).textContent = '—';
    });
    document.getElementById('modalCopiesList').innerHTML = '<li style="justify-content:center;color:var(--text-muted);font-size:13px;">Loading copies…</li>';
  }

  function renderModal(book, bookCopies) {
    document.getElementById('modalSub').textContent = `ID: ${book.id}`;
    const coverEl = document.getElementById('modalCover');
    if (book.book_photo_file_path || book.bookPhotoFilePath) {
      const src = book.book_photo_file_path || book.bookPhotoFilePath;
      coverEl.innerHTML = `<img src="/uploads/${src}" alt="${book.title}" onerror="this.parentElement.innerHTML='<span class=\\'book-cover-placeholder\\'>No Photo</span>'" />`;
    } else {
      coverEl.innerHTML = `<span class="book-cover-placeholder">No Photo</span>`;
    }
    document.getElementById('modalTitle').textContent  = book.title  || '—';
    document.getElementById('modalAuthor').textContent = book.author ? `by ${book.author}` : '—';

    const total    = bookCopies.length;
    const avail    = bookCopies.filter(c => c.available === 1 || c.available === true).length;
    const borrowed = bookCopies.filter(c => !c.available && c.status !== 'LOST' && c.status !== 'DAMAGED').length;
    const lost     = bookCopies.filter(c => c.status === 'LOST').length;
    const damaged  = bookCopies.filter(c => c.status === 'DAMAGED').length;

    document.getElementById('modalCopyStrip').innerHTML = `
      <div class="copy-stat"><div class="copy-stat-val">${total}</div><div class="copy-stat-lbl">Total</div></div>
      <div class="copy-stat"><div class="copy-stat-val green">${avail}</div><div class="copy-stat-lbl">Available</div></div>
      <div class="copy-stat"><div class="copy-stat-val yellow">${borrowed}</div><div class="copy-stat-lbl">Borrowed</div></div>
      <div class="copy-stat"><div class="copy-stat-val red">${lost}</div><div class="copy-stat-lbl">Lost</div></div>
      <div class="copy-stat"><div class="copy-stat-val orange">${damaged}</div><div class="copy-stat-lbl">Damaged</div></div>
    `;
    document.getElementById('md-genre').textContent     = book.genre         || '—';
    document.getElementById('md-year').textContent      = book.year_published || '—';
    document.getElementById('md-publisher').textContent = book.publisher      || '—';
    document.getElementById('md-location').textContent  = book.book_location  || '—';
    document.getElementById('md-isbn').textContent      = book.isbn           || '—';
    document.getElementById('md-date').textContent      = book.date_added
      ? new Date(book.date_added).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
      : '—';

    const list = document.getElementById('modalCopiesList');
    list.innerHTML = !bookCopies.length
      ? '<li style="justify-content:center;color:var(--text-muted);font-size:13px;">No copies found.</li>'
      : bookCopies.map(c => {
          const copyId    = c.copy_id || c.copyId || c.id || '—';
          const isAvail   = c.available === 1 || c.available === true;
          const badgeCls  = isAvail ? 'copy-available' : 'copy-unavailable';
          const badgeTxt  = isAvail ? 'Available' : (c.status || 'Unavailable');
          return `<li><span class="copy-id">${copyId}</span><span class="copy-badge ${badgeCls}">${badgeTxt}</span></li>`;
        }).join('');
  }

  document.addEventListener('click', async e => {
    const btn = e.target.closest('.view-book-btn');
    if (!btn) return;
    setSkeletons();
    openModal();
    try {
      const res  = await fetch(`/book/api/${btn.dataset.id}`);
      const data = await res.json();
      if (data.success) renderModal(data.book, data.bookCopies);
      else document.getElementById('modalSub').textContent = 'Failed to load book data.';
    } catch (err) {
      document.getElementById('modalSub').textContent = 'Error loading book.';
    }
  });