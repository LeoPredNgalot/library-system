 // Greeting & date
  (function() {
    const h = new Date().getHours();
    const el = document.getElementById('greetingText');
    if (el) el.textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('greetingDay').textContent = now.getDate();
    document.getElementById('greetingDayName').textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getFullYear();
  })();

  // Sidebar toggles
  function toggleTrans(btn) {
    const sub = document.getElementById('transSubmenu');
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

  // Navigation
  function setActiveNav(id) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const el = document.getElementById('nav-' + id);
    if (el) el.classList.add('active');
  }
  function showDashboard() {
    setActiveNav('home');
    document.getElementById('dashboardContent').style.display = 'block';
    document.getElementById('contentFrame').style.display = 'none';
    document.getElementById('contentFrame').src = '';
  }
  function navigateTo(id, title, url) {
    setActiveNav(id);
    document.getElementById('dashboardContent').style.display = 'none';
    const frame = document.getElementById('contentFrame');
    frame.style.display = 'block';
    if (frame.src !== window.location.origin + url) {
      frame.src = url;
    }
  }

  // Calendar
  var calYear, calMonth;
  var today = new Date();
  function renderCalendar(y, m) {
    calYear = y; calMonth = m;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('calMonthLabel').textContent = months[m] + ' ' + y;
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();
    const grid = document.getElementById('calGrid');
    grid.innerHTML = '';
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = document.createElement('div'); d.className = 'cal-day other'; d.textContent = prevDays - i; grid.appendChild(d);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = document.createElement('div');
      d.className = 'cal-day' + (day === today.getDate() && m === today.getMonth() && y === today.getFullYear() ? ' today' : '');
      d.textContent = day; grid.appendChild(d);
    }
    const total = firstDay + daysInMonth;
    const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let n = 1; n <= rem; n++) {
      const d = document.createElement('div'); d.className = 'cal-day other'; d.textContent = n; grid.appendChild(d);
    }
  }
  renderCalendar(today.getFullYear(), today.getMonth());
  document.getElementById('calPrev').addEventListener('click', function() {
    let m = calMonth - 1, y = calYear; if (m < 0) { m = 11; y--; } renderCalendar(y, m);
  });
  document.getElementById('calNext').addEventListener('click', function() {
    let m = calMonth + 1, y = calYear; if (m > 11) { m = 0; y++; } renderCalendar(y, m);
  });

  // Stats
  async function loadStats() {
    try {
      const res = await fetch('/api/dashboard/stats');
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

  // Recommendations
  async function loadRecommendations() {
    const body = document.getElementById('recBooksBody');
    const genreColors = [
      'linear-gradient(135deg,#0e7490,#22d3ee)',
      'linear-gradient(135deg,#10b981,#059669)',
      'linear-gradient(135deg,#f59e0b,#d97706)',
      'linear-gradient(135deg,#8b5cf6,#6366f1)',
      'linear-gradient(135deg,#ef4444,#dc2626)',
      'linear-gradient(135deg,#ec4899,#db2777)',
    ];
    try {
      const res = await fetch('/api/recommended-books');
      if (!res.ok) throw new Error();
      const books = await res.json();
      if (!books || books.length === 0) {
        body.innerHTML = '<div class="no-data">No recommendations available.</div>';
        return;
      }
      body.innerHTML = books.map((b, i) => {
        const isAvailable = b.available_count > 0;
        const isBorrowed  = b.borrowed_count > 0;
        const status = isAvailable ? 'available' : isBorrowed ? 'borrowed' : 'reserved';
        const badgeClass = status === 'available' ? 'available' : status === 'borrowed' ? 'borrowed' : 'reserved';
        const badgeLabel = status.charAt(0).toUpperCase() + status.slice(1);
        const coverHtml = b.book_photo_file_path
          ? `<img src="/uploads/${b.book_photo_file_path}" alt="${b.title}" />`
          : `<div class="rec-cover-placeholder" style="background:${genreColors[i % genreColors.length]}">
               <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
             </div>`;
        return `<div class="rec-item">
          <div class="rec-cover">${coverHtml}</div>
          <div class="rec-info">
            <div class="rec-title">${b.title || '—'}</div>
            <div class="rec-meta">${b.author || '—'}${b.genre ? ' · ' + b.genre : ''}</div>
          </div>
          <span class="rec-badge ${badgeClass}">${badgeLabel}</span>
        </div>`;
      }).join('');
    } catch(e) {
      body.innerHTML = '<div class="no-data">Could not load recommendations.</div>';
    }
  }

  loadStats();
  loadRecommendations();