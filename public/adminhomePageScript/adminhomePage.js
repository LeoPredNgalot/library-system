const navItems = ['home', 'books', 'users'];
  const subItems = ['borrow', 'reserve'];

  function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

  function setActive(id) {
    [...navItems].forEach(n => {
      const el = document.getElementById('nav-' + n);
      if (el) el.classList.toggle('active', n === id);
    });
    subItems.forEach(n => {
      const el = document.getElementById('nav-' + n);
      if (el) el.classList.remove('active');
    });
    const transBtn = document.getElementById('transBtn');
    if (transBtn) transBtn.classList.remove('active');
    // Update topbar title
    const titles = { home: 'Dashboard', books: 'Books', users: 'Users' };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[id] || 'Dashboard';
  }

  function setActiveSub(sub) {
    navItems.forEach(n => {
      const el = document.getElementById('nav-' + n);
      if (el) el.classList.remove('active');
    });
    subItems.forEach(n => {
      const el = document.getElementById('nav-' + n);
      if (el) el.classList.toggle('active', n === sub);
    });
    const transBtn = document.getElementById('transBtn');
    if (transBtn) transBtn.classList.add('active');
    const titles = { borrow: 'Borrow', reserve: 'Reservations' };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[sub] || 'Transactions';
  }

  // Transactions submenu toggle
  function toggleTrans() {
    const submenu = document.getElementById('transSubmenu');
    const chevron = document.getElementById('transChevron');
    const btn     = document.getElementById('transBtn');
    if (!submenu || !chevron || !btn) return;
    const isOpen  = submenu.classList.contains('open');
    submenu.classList.toggle('open', !isOpen);
    btn.classList.toggle('open', !isOpen);
    chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
  }

  // Profile dropdown
  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn) {
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const panel   = document.getElementById('profilePanel');
      const chevron = document.getElementById('profileChevron');
      if (!panel || !chevron) return;
      const isOpen  = panel.classList.contains('open');
      panel.classList.toggle('open', !isOpen);
      chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
    });
  }

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#profileDropdownWrap')) {
      const panel   = document.getElementById('profilePanel');
      const chevron = document.getElementById('profileChevron');
      if (panel)   panel.classList.remove('open');
      if (chevron) chevron.style.transform = '';
    }
  });

  // ── Greeting time ──
  (function() {
    const hour = new Date().getHours();
    let greet = 'Good morning';
    if (hour >= 12 && hour < 17) greet = 'Good afternoon';
    else if (hour >= 17) greet = 'Good evening';
    const el = document.getElementById('greetingText');
    if (el) el.textContent = greet;

    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dateEl = document.getElementById('greetingDate');
    if (dateEl) {
      dateEl.innerHTML =
        '<div class="date-day">' + now.getDate() + '</div>' +
        '<div class="date-rest">' + days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getFullYear() + '</div>';
    }
  })();

  // ── Calendar ──
  var calYear, calMonth;
  var today = new Date();

  function renderCalendar(year, month) {
    calYear = year; calMonth = month;
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var label = document.getElementById('calMonthLabel');
    if (label) label.textContent = months[month] + ' ' + year;

    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var daysInPrev = new Date(year, month, 0).getDate();
    var container = document.getElementById('calDays');
    if (!container) return;
    container.innerHTML = '';

    for (var i = firstDay - 1; i >= 0; i--) {
      var d = document.createElement('div');
      d.className = 'cal-day other-month';
      d.textContent = daysInPrev - i;
      container.appendChild(d);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var el = document.createElement('div');
      el.className = 'cal-day';
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        el.classList.add('today');
      }
      el.textContent = day;
      container.appendChild(el);
    }

    var total = firstDay + daysInMonth;
    var remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (var n = 1; n <= remaining; n++) {
      var el2 = document.createElement('div');
      el2.className = 'cal-day other-month';
      el2.textContent = n;
      container.appendChild(el2);
    }
  }

  renderCalendar(today.getFullYear(), today.getMonth());

  var prevBtn = document.getElementById('calPrev');
  var nextBtn = document.getElementById('calNext');
  if (prevBtn) prevBtn.addEventListener('click', function() {
    var m = calMonth - 1, y = calYear;
    if (m < 0) { m = 11; y--; }
    renderCalendar(y, m);
  });
  if (nextBtn) nextBtn.addEventListener('click', function() {
    var m = calMonth + 1, y = calYear;
    if (m > 11) { m = 0; y++; }
    renderCalendar(y, m);
  });

  // ── Dashboard Stats ──
async function loadDashboardStats() {
  try {
    const res = await fetch('/dashboard/stats');
    const data = await res.json();

    if (data.success) {
      const totalBooks   = document.getElementById('stat-totalBooks');
      const borrowed     = document.getElementById('stat-borrowed');
      const returned     = document.getElementById('stat-returned');
      const overdue      = document.getElementById('stat-overdue');
      const totalUsers   = document.getElementById('stat-totalUsers');
      const reservations = document.getElementById('stat-reservations');

      if (totalBooks)   totalBooks.textContent   = data.totalBooks;
      if (borrowed)     borrowed.textContent     = data.borrowed;
      if (returned)     returned.textContent     = data.returned;
      if (overdue)      overdue.textContent      = data.overdue;
      if (totalUsers)   totalUsers.textContent   = data.totalUsers;
      if (reservations) reservations.textContent = data.reservations;
    }
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

loadDashboardStats();