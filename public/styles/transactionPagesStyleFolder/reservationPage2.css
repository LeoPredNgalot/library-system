// ── Sidebar toggles ──
function toggleTrans() {
  const s = document.getElementById('transSubmenu');
  const c = document.getElementById('transChevron');
  s.classList.toggle('open');
  c.style.transform = s.classList.contains('open') ? 'rotate(180deg)' : '';
}
function toggleProfile() {
  document.getElementById('profilePanel').classList.toggle('open');
  document.getElementById('profileChevron').style.transform =
    document.getElementById('profilePanel').classList.contains('open') ? 'rotate(180deg)' : '';
}
document.addEventListener('click', e => {
  if (!e.target.closest('#profileWrap')) {
    document.getElementById('profilePanel').classList.remove('open');
    document.getElementById('profileChevron').style.transform = '';
  }
});

// ── Toast ──
function showToast(msg, duration = 4000) {
  const t = document.getElementById('notificationToast');
  t.textContent = msg;
  t.classList.remove('hidden','error','success');
  if (msg.startsWith('✗')) t.classList.add('error');
  else if (msg.startsWith('✓')) t.classList.add('success');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

// ── Autocomplete helpers ──
function showDropdown(dd, items) {
  dd.innerHTML = '';
  if (!items.length) { dd.innerHTML = '<li class="ac-no-result">No results found</li>'; }
  else items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'ac-item'; li.textContent = item.label; li.dataset.value = item.value;
    dd.appendChild(li);
  });
  dd.classList.remove('hidden');
}
function hideDropdown(dd) { dd.classList.add('hidden'); dd.innerHTML = ''; }
function showSelected(selEl, textEl, text, wrapEl) {
  const inp = wrapEl.querySelector('input[type="text"]');
  if (inp) inp.style.opacity = '0';
  textEl.textContent = text;
  selEl.classList.remove('hidden');
}
function clearSelected(selEl, wrapEl, hiddenInput) {
  selEl.classList.add('hidden');
  const inp = wrapEl.querySelector('input[type="text"]');
  if (inp) { inp.style.opacity = '1'; inp.value = ''; }
  if (hiddenInput) hiddenInput.value = '';
}

// ── Add Reservation Modal ──
const reservePanel  = document.getElementById('reservePanel');
const openBtn       = document.getElementById('openModalBtn');
const closeBtn      = document.getElementById('closeModalBtn');
const clearFormBtn  = document.getElementById('clearFormBtn');
const reserveForm   = document.getElementById('reserveForm');
const reserveBtn    = document.getElementById('reserveBtn');
const errorNotice   = document.getElementById('errorNotice');

const studentSearch    = document.getElementById('studentSearch');
const studentDropdown  = document.getElementById('studentDropdown');
const studentInputWrap = document.getElementById('studentInputWrap');
const selectedStudentId  = document.getElementById('selectedStudentId');
const studentSelected  = document.getElementById('studentSelected');
const studentSelectedTx  = document.getElementById('studentSelectedText');
const clearStudentBtn  = document.getElementById('clearStudent');

const bookSearch    = document.getElementById('bookSearch');
const bookDropdown  = document.getElementById('bookDropdown');
const bookInputWrap = document.getElementById('bookInputWrap');
const selectedBookId  = document.getElementById('selectedBookId');
const bookSelected  = document.getElementById('bookSelected');
const bookSelectedTx  = document.getElementById('bookSelectedText');
const clearBookBtn  = document.getElementById('clearBook');

function resetModal() {
  clearSelected(studentSelected, studentInputWrap, selectedStudentId);
  hideDropdown(studentDropdown);
  clearSelected(bookSelected, bookInputWrap, selectedBookId);
  hideDropdown(bookDropdown);
  errorNotice.style.display = 'none';
}

openBtn?.addEventListener('click', () => { resetModal(); reservePanel.classList.remove('hidden'); });
closeBtn?.addEventListener('click', () => reservePanel.classList.add('hidden'));
clearFormBtn?.addEventListener('click', resetModal);
reservePanel?.addEventListener('click', e => { if (e.target === reservePanel) reservePanel.classList.add('hidden'); });

async function fetchStudents(q) {
  try {
    const res = await fetch(`/api/students/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return (data.students || []).map(s => ({
      label: `${s.student_id} — ${s.first_name} ${s.last_name}`,
      value: s.student_id,
    }));
  } catch { return []; }
}
studentSearch?.addEventListener('focus', async () => showDropdown(studentDropdown, await fetchStudents('')));
let stTimer;
studentSearch?.addEventListener('input', () => {
  clearTimeout(stTimer);
  stTimer = setTimeout(async () => showDropdown(studentDropdown, await fetchStudents(studentSearch.value.trim())), 200);
});
studentDropdown?.addEventListener('click', e => {
  const li = e.target.closest('.ac-item'); if (!li) return;
  selectedStudentId.value = li.dataset.value;
  showSelected(studentSelected, studentSelectedTx, li.textContent, studentInputWrap);
  hideDropdown(studentDropdown);
});
clearStudentBtn?.addEventListener('click', () => clearSelected(studentSelected, studentInputWrap, selectedStudentId));

async function fetchBooks(q) {
  try {
    const res = await fetch(`/book/books?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return (data.books || []).map(b => ({
      label: b.title || b.bookTitle || b.book_title,
      value: String(b.id),
    }));
  } catch { return []; }
}
bookSearch?.addEventListener('focus', async () => showDropdown(bookDropdown, await fetchBooks('')));
let bkTimer;
bookSearch?.addEventListener('input', () => {
  clearTimeout(bkTimer);
  bkTimer = setTimeout(async () => showDropdown(bookDropdown, await fetchBooks(bookSearch.value.trim())), 200);
});
bookDropdown?.addEventListener('click', e => {
  const li = e.target.closest('.ac-item'); if (!li) return;
  selectedBookId.value = li.dataset.value;
  showSelected(bookSelected, bookSelectedTx, li.textContent, bookInputWrap);
  hideDropdown(bookDropdown);
  errorNotice.style.display = 'none';
});
clearBookBtn?.addEventListener('click', () => { clearSelected(bookSelected, bookInputWrap, selectedBookId); errorNotice.style.display='none'; });

reserveForm?.addEventListener('submit', async e => {
  e.preventDefault();
  errorNotice.style.display = 'none';
  if (!selectedStudentId.value) { showToast('✗ Please select a student.'); return; }
  if (!selectedBookId.value)    { showToast('✗ Please select a book.'); return; }
  reserveBtn.disabled = true;
  reserveBtn.textContent = 'Reserving…';
  try {
    const res  = await fetch('/transaction/reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: selectedStudentId.value, bookId: selectedBookId.value }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('✓ ' + (data.message || 'Reservation recorded!'));
      reservePanel.classList.add('hidden');
      resetModal();
      setTimeout(() => location.reload(), 900);
    } else {
      errorNotice.textContent = data.message || 'Could not complete reservation.';
      errorNotice.style.display = 'block';
    }
  } catch {
    showToast('✗ Something went wrong. Please try again.');
  } finally {
    reserveBtn.disabled = false;
    reserveBtn.innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg> Reserve`;
  }
});

// ── Cancel button ──
document.addEventListener('click', async e => {
  const cancelBtn = e.target.closest('.cancelBtn');
  if (!cancelBtn) return;
  const id = cancelBtn.dataset.id;
  cancelBtn.disabled = true;
  const orig = cancelBtn.innerHTML;
  cancelBtn.textContent = 'Cancelling…';
  try {
    const res  = await fetch(`/transaction/reservation/cancel/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();
    if (data.success) {
      showToast('✓ ' + (data.message || 'Reservation cancelled.'));
      setTimeout(() => location.reload(), 900);
    } else {
      showToast('✗ ' + (data.message || 'Could not cancel reservation.'));
    }
  } catch { showToast('✗ Something went wrong.'); }
  finally { cancelBtn.disabled = false; cancelBtn.innerHTML = orig; }
});

// ── Remove button (fulfilled / expired / cancelled) ──
document.addEventListener('click', async e => {
  const removeBtn = e.target.closest('.removeBtn');
  if (!removeBtn) return;
  if (!confirm('Remove this reservation record? This cannot be undone.')) return;
  const id = removeBtn.dataset.id;
  removeBtn.disabled = true;
  const orig = removeBtn.innerHTML;
  removeBtn.textContent = 'Removing…';
  try {
    const res  = await fetch(`/transaction/reservation/remove/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();
    if (data.success) {
      showToast('✓ ' + (data.message || 'Reservation removed.'));
      // Fade out and remove the row without a full reload
      const row = removeBtn.closest('tr');
      row.style.transition = 'opacity 0.3s ease';
      row.style.opacity = '0';
      setTimeout(() => row.remove(), 300);
    } else {
      showToast('✗ ' + (data.message || 'Could not remove reservation.'));
      removeBtn.disabled = false;
      removeBtn.innerHTML = orig;
    }
  } catch {
    showToast('✗ Something went wrong.');
    removeBtn.disabled = false;
    removeBtn.innerHTML = orig;
  }
});

// ── Fulfill button → open modal ──
let _fulfillReservationId = null;

document.addEventListener('click', e => {
  const fulfillBtn = e.target.closest('.fulfillBtn');
  if (!fulfillBtn) return;

  _fulfillReservationId = fulfillBtn.dataset.id;

  document.getElementById('fulfillStudentName').textContent = fulfillBtn.dataset.student   || '—';
  document.getElementById('fulfillStudentId').textContent   = fulfillBtn.dataset.studentId || '—';
  document.getElementById('fulfillBookTitle').textContent   = fulfillBtn.dataset.book       || '—';

  const due = new Date();
  due.setDate(due.getDate() + 7);
  document.getElementById('fulfillDueDate').value = due.toISOString().split('T')[0];
  document.getElementById('fulfillDueDate').min   = new Date().toISOString().split('T')[0];

  document.getElementById('fulfillErrorNotice').style.display = 'none';
  document.getElementById('fulfillPanel').classList.remove('hidden');
});

// ── Fulfill modal close ──
document.getElementById('closeFulfillBtn')?.addEventListener('click',  () => document.getElementById('fulfillPanel').classList.add('hidden'));
document.getElementById('cancelFulfillBtn')?.addEventListener('click', () => document.getElementById('fulfillPanel').classList.add('hidden'));
document.getElementById('fulfillPanel')?.addEventListener('click', e => {
  if (e.target === document.getElementById('fulfillPanel')) document.getElementById('fulfillPanel').classList.add('hidden');
});

// ── Confirm & Borrow ──
document.getElementById('confirmFulfillBtn')?.addEventListener('click', async () => {
  const dueDate = document.getElementById('fulfillDueDate').value;
  const errEl   = document.getElementById('fulfillErrorNotice');
  errEl.style.display = 'none';

  if (!dueDate) {
    errEl.textContent = 'Please select a due date.';
    errEl.style.display = 'block';
    return;
  }
  if (!_fulfillReservationId) {
    errEl.textContent = 'Reservation ID missing. Please close and try again.';
    errEl.style.display = 'block';
    return;
  }

  const confirmBtn = document.getElementById('confirmFulfillBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Processing…';

  try {
    const res  = await fetch(`/transaction/reservation/fulfill/${_fulfillReservationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate }),
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('fulfillPanel').classList.add('hidden');
      showToast('✓ ' + (data.message || 'Reservation fulfilled and borrow record created!'));
      setTimeout(() => location.reload(), 900);
    } else {
      errEl.textContent = data.message || 'Could not fulfill reservation.';
      errEl.style.display = 'block';
    }
  } catch {
    errEl.textContent = 'Something went wrong. Please try again.';
    errEl.style.display = 'block';
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Confirm &amp; Borrow`;
  }
});

// ── Client-side filter ──
document.getElementById('searchInput')?.addEventListener('input', filterTable);
document.getElementById('statusFilter')?.addEventListener('change', filterTable);
function filterTable() {
  const q  = document.getElementById('searchInput').value.toLowerCase();
  const st = document.getElementById('statusFilter').value.toLowerCase();
  document.querySelectorAll('tbody tr:not(.no-data-row)').forEach(row => {
    const text  = row.textContent.toLowerCase();
    const badge = row.querySelector('.badge');
    const rowSt = badge ? badge.textContent.toLowerCase().trim() : '';
    row.style.display = (!q || text.includes(q)) && (!st || rowSt === st) ? '' : 'none';
  });
}

// ── Close dropdowns outside ──
document.addEventListener('click', e => {
  if (!e.target.closest('#studentSearch') && !e.target.closest('#studentDropdown')) hideDropdown(studentDropdown);
  if (!e.target.closest('#bookSearch')    && !e.target.closest('#bookDropdown'))    hideDropdown(bookDropdown);
});