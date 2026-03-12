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
    document.getElementById('transBtn').classList.remove('active');
    // Update topbar title
    const titles = { home: 'Dashboard', books: 'Books', users: 'Users' };
    document.getElementById('pageTitle').textContent = titles[id] || 'Dashboard';
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
    document.getElementById('transBtn').classList.add('active');
    const titles = { borrow: 'Borrow', reserve: 'Reservations' };
    document.getElementById('pageTitle').textContent = titles[sub] || 'Transactions';
  }

  // Transactions submenu toggle
  function toggleTrans() {
    const submenu = document.getElementById('transSubmenu');
    const chevron = document.getElementById('transChevron');
    const btn     = document.getElementById('transBtn');
    const isOpen  = submenu.classList.contains('open');
    submenu.classList.toggle('open', !isOpen);
    btn.classList.toggle('open', !isOpen);
    chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
  }

  // Profile dropdown
  document.getElementById('profileBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    const panel   = document.getElementById('profilePanel');
    const chevron = document.getElementById('profileChevron');
    const isOpen  = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
      if (!e.target.closest('#profileDropdownWrap')) {
      document.getElementById('profilePanel').classList.remove('open');
      document.getElementById('profileChevron').style.transform = '';
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
      document.getElementById('stat-totalBooks').textContent   = data.totalBooks;
      document.getElementById('stat-borrowed').textContent     = data.borrowed;
      document.getElementById('stat-returned').textContent     = data.returned;
      document.getElementById('stat-overdue').textContent      = data.overdue;
      document.getElementById('stat-totalUsers').textContent   = data.totalUsers;
      document.getElementById('stat-reservations').textContent = data.reservations;
    }
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

loadDashboardStats();