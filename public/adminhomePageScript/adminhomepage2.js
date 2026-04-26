// ── Greeting ──
  (function() {
    const h  = new Date().getHours();
    const el = document.getElementById('greetingText');
    if (el) el.textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const now    = new Date();
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('greetingDay').textContent     = now.getDate();
    document.getElementById('greetingDayName').textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getFullYear();
  })();

  // ── Sidebar ──
  function toggleTrans(btn) {
    const sub    = document.getElementById('transSubmenu');
    const isOpen = sub.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
  }
  function toggleProfile() {
    const panel   = document.getElementById('profilePanel');
    const chevron = document.getElementById('profileChevron');
    const isOpen  = panel.classList.toggle('open');
    chevron.style.transform = isOpen ? 'rotate(180deg)' : '';
  }
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#profileWrap')) {
      document.getElementById('profilePanel').classList.remove('open');
      document.getElementById('profileChevron').style.transform = '';
    }
  });

  // ── Modal ──
  function openLogoutModal() {
    document.getElementById('profilePanel').classList.remove('open');
    document.getElementById('profileChevron').style.transform = '';
    document.getElementById('logoutModal').classList.add('open');
  }
  function closeLogoutModal() {
    document.getElementById('logoutModal').classList.remove('open');
  }
  document.getElementById('logoutModal').addEventListener('click', function(e) {
    if (e.target === this) closeLogoutModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLogoutModal();
  });

  // ── Navigation ──
  function setActiveNav(id) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const el = document.getElementById('nav-' + id);
    if (el) el.classList.add('active');
  }
  function showDashboard() {
    setActiveNav('home');
    document.getElementById('dashboardContent').style.display = 'block';
    document.getElementById('contentFrame').style.display     = 'none';
    document.getElementById('contentFrame').src               = '';
    loadStats();
    loadRecommendations();
    loadMostBorrowed('all');
  }
  function navigateTo(id, title, url) {
    setActiveNav(id);
    document.getElementById('dashboardContent').style.display = 'none';
    const frame = document.getElementById('contentFrame');
    frame.style.display = 'block';
    if (frame.src !== window.location.origin + url) frame.src = url;
  }

  // ── Stats ──
  async function loadStats() {
    try {
      const res  = await fetch('/api/dashboard/stats');
      if (!res.ok) return;
      const data = await res.json();
      if (data.totalBooks   !== undefined) document.getElementById('statTotalBooks').textContent   = data.totalBooks;
      if (data.borrowed     !== undefined) document.getElementById('statBorrowed').textContent     = data.borrowed;
      if (data.returned     !== undefined) document.getElementById('statReturned').textContent     = data.returned;
      if (data.overdue      !== undefined) document.getElementById('statOverdue').textContent      = data.overdue;
      if (data.totalUsers   !== undefined) document.getElementById('statUsers').textContent        = data.totalUsers;
      if (data.reservations !== undefined) document.getElementById('statReservations').textContent = data.reservations;
    } catch(e) {}
  }

  // ── Shared card builder ──
  const genreColors = [
    'linear-gradient(135deg,#0e7490,#22d3ee)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#8b5cf6,#6366f1)',
    'linear-gradient(135deg,#ef4444,#dc2626)',
  ];

  function buildBookCards(books) {
    if (!books || books.length === 0) return '<div class="no-data">No books found.</div>';
    return books.map((b, i) => {
      const isAvailable = (b.available_count ?? 0) > 0;
      const isBorrowed  = (b.borrowed_count  ?? 0) > 0;
      const status      = isAvailable ? 'available' : isBorrowed ? 'borrowed' : 'reserved';
      const badgeLabel  = status.charAt(0).toUpperCase() + status.slice(1);
      const coverHtml   = b.book_photo_file_path
        ? `<img src="/uploads/${b.book_photo_file_path}" alt="${b.title}" />`
        : `<div class="rec-cover-placeholder" style="background:${genreColors[i % genreColors.length]}">
             <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1.5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
             </svg>
           </div>`;
      return `
        <div class="rec-card" style="animation-delay:${0.03 + i * 0.03}s">
          <div class="rec-cover">
            ${coverHtml}
            <span class="rec-badge-overlay ${status}">${badgeLabel}</span>
          </div>
          <div class="rec-body">
            <div class="rec-title">${b.title || '—'}</div>
            <div class="rec-author">${b.author || '—'}</div>
            ${b.genre ? `<div class="rec-genre">${b.genre}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  // ── Section 1: Recommended Books (genre-based) ──
  async function loadRecommendations() {
    const body  = document.getElementById('recBooksBody');
    body.innerHTML = '<div class="no-data">Loading recommendations…</div>';
    try {
      const res  = await fetch('/book/recommended-books');
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Support both old array response and new { genre, books } response
      const books = Array.isArray(data) ? data.slice(0, 16) : (data.books || []).slice(0, 16);
      const genre = Array.isArray(data) ? null : data.genre;

      body.innerHTML = buildBookCards(books);
    } catch(e) {
      body.innerHTML = '<div class="no-data">Could not load recommendations.</div>';
    }
  }

  // ── Section 2: Most Borrowed Books with genre filter ──
  // Cache all books once, filter client-side
  let _allMostBorrowed = [];

  async function loadMostBorrowed(genre = 'all') {
    const body = document.getElementById('mostBorrowedBody');

    // First load — fetch all
    if (_allMostBorrowed.length === 0) {
      body.innerHTML = '<div class="no-data">Loading…</div>';
      try {
        const res  = await fetch('/book/most-borrowed-books');
        if (!res.ok) throw new Error();
        _allMostBorrowed = await res.json();
      } catch(e) {
        body.innerHTML = '<div class="no-data">Could not load books.</div>';
        return;
      }
    }

    // Filter client-side
    const filtered = genre === 'all'
      ? _allMostBorrowed
      : _allMostBorrowed.filter(b => (b.genre || '').toUpperCase() === genre.toUpperCase());

    body.innerHTML = buildBookCards(filtered.slice(0, 16));
  }

  function filterByGenre(btn, genre) {
    // Update active tab
    document.querySelectorAll('.genre-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    // Re-render
    loadMostBorrowed(genre);
  }

  // ── Init ──
  loadStats();
  loadRecommendations();
  loadMostBorrowed('all');