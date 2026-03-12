//
// public/transactionPagesScript/viewAllBorrowRecords.js
//

function showToast(msg, duration = 4000) {
  const t = document.getElementById('notificationToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden', 'error', 'success');
  if (msg.startsWith('✗')) t.classList.add('error');
  else if (msg.startsWith('✓')) t.classList.add('success');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

// ── Autocomplete helpers ──
function showDropdown(ddEl, items) {
  ddEl.innerHTML = '';
  if (!items.length) {
    ddEl.innerHTML = '<li class="ac-no-result">No results found</li>';
  } else {
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'ac-item';
      li.textContent = item.label;
      li.dataset.value = item.value;
      ddEl.appendChild(li);
    });
  }
  ddEl.classList.remove('hidden');
}
function hideDropdown(ddEl) { ddEl.classList.add('hidden'); ddEl.innerHTML = ''; }

function showSelected(selectedEl, textEl, text, inputWrapEl) {
  const inp = inputWrapEl.querySelector('input');
  if (inp) inp.style.opacity = '0';
  textEl.textContent = text;
  selectedEl.classList.remove('hidden');
}
function clearSelected(selectedEl, inputWrapEl, hiddenInput) {
  selectedEl.classList.add('hidden');
  const inp = inputWrapEl.querySelector('input');
  if (inp) { inp.style.opacity = '1'; inp.value = ''; }
  if (hiddenInput) hiddenInput.value = '';
}

// ── Elements ──
const borrowPanel       = document.getElementById('borrowPanel');
const openBtn           = document.getElementById('openBorrowFormBtn');
const closeBtn          = document.getElementById('closeBorrowFormBtn');
const clearFormBtn      = document.getElementById('clearBorrowFormBtn');
const borrowForm        = document.getElementById('borrowForm');
const recordBtn         = document.getElementById('recordBtn');

const studentSearch     = document.getElementById('studentSearch');
const studentDropdown   = document.getElementById('studentDropdown');
const studentInputWrap  = document.getElementById('studentInputWrap');
const selectedStudentId = document.getElementById('selectedStudentId');
const studentSelected   = document.getElementById('studentSelected');
const studentSelectedTx = document.getElementById('studentSelectedText');
const clearStudentBtn   = document.getElementById('clearStudent');

const bookSearch        = document.getElementById('bookSearch');
const bookDropdown      = document.getElementById('bookDropdown');
const bookInputWrap     = document.getElementById('bookInputWrap');
const selectedBookId    = document.getElementById('selectedBookId');
const bookSelected      = document.getElementById('bookSelected');
const bookSelectedTx    = document.getElementById('bookSelectedText');
const clearBookBtn      = document.getElementById('clearBook');

const copySelect        = document.getElementById('copySelect');
const selectedCopyId    = document.getElementById('selectedCopyId');
const borrowDueDate     = document.getElementById('borrowDueDate');

function resetBorrowModal() {
  clearSelected(studentSelected, studentInputWrap, selectedStudentId);
  hideDropdown(studentDropdown);
  clearSelected(bookSelected, bookInputWrap, selectedBookId);
  hideDropdown(bookDropdown);
  copySelect.innerHTML = '<option value="">— select a copy —</option>';
  selectedCopyId.value = '';
  borrowDueDate.value = '';
  recordBtn.disabled = true;
}

openBtn?.addEventListener('click', () => { resetBorrowModal(); borrowPanel.classList.remove('hidden'); });
closeBtn?.addEventListener('click', () => borrowPanel.classList.add('hidden'));
clearFormBtn?.addEventListener('click', resetBorrowModal);
borrowPanel?.addEventListener('click', (e) => { if (e.target === borrowPanel) borrowPanel.classList.add('hidden'); });

// ── Student search ──
async function fetchStudents(q) {
  try {
    const res  = await fetch(`/api/students/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return (data.students || []).map(s => ({
      label: `${s.student_id} — ${s.first_name} ${s.last_name}`,
      value: s.student_id,
    }));
  } catch { return []; }
}

studentSearch?.addEventListener('focus', async () => {
  showDropdown(studentDropdown, await fetchStudents(''));
});
let studentTimer;
studentSearch?.addEventListener('input', () => {
  clearTimeout(studentTimer);
  studentTimer = setTimeout(async () => {
    showDropdown(studentDropdown, await fetchStudents(studentSearch.value.trim()));
  }, 200);
});
studentDropdown?.addEventListener('click', (e) => {
  const li = e.target.closest('.ac-item');
  if (!li) return;
  selectedStudentId.value = li.dataset.value;
  showSelected(studentSelected, studentSelectedTx, li.textContent, studentInputWrap);
  hideDropdown(studentDropdown);
  validateForm();
});
clearStudentBtn?.addEventListener('click', () => {
  clearSelected(studentSelected, studentInputWrap, selectedStudentId);
  validateForm();
});

// ── Book search ──
async function fetchBooks(q) {
  try {
    const res  = await fetch(`/book/books?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return (data.books || []).map(b => ({
      label: b.title || b.bookTitle || b.book_title,
      value: String(b.id),
    }));
  } catch { return []; }
}

bookSearch?.addEventListener('focus', async () => {
  showDropdown(bookDropdown, await fetchBooks(''));
});
let bookTimer;
bookSearch?.addEventListener('input', () => {
  clearTimeout(bookTimer);
  bookTimer = setTimeout(async () => {
    showDropdown(bookDropdown, await fetchBooks(bookSearch.value.trim()));
  }, 200);
});

bookDropdown?.addEventListener('click', async (e) => {
  const li = e.target.closest('.ac-item');
  if (!li) return;
  selectedBookId.value = li.dataset.value;
  showSelected(bookSelected, bookSelectedTx, li.textContent, bookInputWrap);
  hideDropdown(bookDropdown);
  validateForm();

  // Load available copies for this book via the JSON API endpoint
  copySelect.innerHTML = '<option value="">Loading copies…</option>';
  selectedCopyId.value = '';
  try {
    const res  = await fetch(`/book/api/copies/${li.dataset.value}`);
    const data = await res.json();
    console.log('Book copies API response:', JSON.stringify(data));
    const allCopies = data.bookCopies || [];
    const available = allCopies.filter(c => c.available === 1 || c.available === true);
    console.log('All copies:', allCopies.length, '| Available:', available.length);
    copySelect.innerHTML = available.length
      ? '<option value="">— select a copy —</option>' + available.map(c => {
          const id = c.copy_id || c.copyId || c.id;
          return `<option value="${id}">${id}</option>`;
        }).join('')
      : '<option value="">No available copies</option>';
  } catch (err) {
    console.error('Error loading copies:', err);
    copySelect.innerHTML = '<option value="">Error loading copies</option>';
  }
});

clearBookBtn?.addEventListener('click', () => {
  clearSelected(bookSelected, bookInputWrap, selectedBookId);
  copySelect.innerHTML = '<option value="">— select a copy —</option>';
  selectedCopyId.value = '';
  validateForm();
});

// ── Validation ──
function validateForm() {
  const ok = !!(selectedStudentId?.value && selectedBookId?.value && copySelect?.value && borrowDueDate?.value);
  if (recordBtn) recordBtn.disabled = !ok;
}

// ── Copy select ──
copySelect?.addEventListener('change', () => {
  selectedCopyId.value = copySelect.value;
  validateForm();
});

// ── Due date ──
borrowDueDate?.addEventListener('change', validateForm);
borrowDueDate?.addEventListener('input', validateForm);

// ── Submit ──
borrowForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!selectedStudentId.value) { showToast('✗ Please select a student.'); return; }
  if (!selectedBookId.value)    { showToast('✗ Please select a book.'); return; }
  if (!selectedCopyId.value)    { showToast('✗ Please select a book copy.'); return; }
  if (!borrowDueDate.value)     { showToast('✗ Please set a due date.'); return; }

  recordBtn.disabled = true;
  recordBtn.textContent = 'Recording…';
  try {
    const res  = await fetch('/transaction/borrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId:  selectedStudentId.value,
        bookCopyId: selectedCopyId.value,
        dueDate:    borrowDueDate.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('✓ ' + (data.message || 'Borrow recorded successfully!'));
      borrowPanel.classList.add('hidden');
      resetBorrowModal();
      setTimeout(() => location.reload(), 900);
    } else {
      showToast('✗ ' + (data.message || 'Please check the details and try again.'));
    }
  } catch {
    showToast('✗ Something went wrong. Please try again.');
  } finally {
    recordBtn.disabled = false;
    recordBtn.innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> Record`;
  }
});

// ── Action buttons ──
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const isReturn  = btn.classList.contains('returnBookBtn');
  const isLost    = btn.classList.contains('lostBookBtn');
  const isDamaged = btn.classList.contains('damagedBookBtn');
  const isSettle  = btn.classList.contains('settlePaymentBtn');
  if (!isReturn && !isLost && !isDamaged && !isSettle) return;

  let url, payload, label;
  if (isReturn)  { url = '/transaction/return-book';         payload = { bookCopyId: btn.dataset.bookCopyId }; label = 'RETURN'; }
  if (isLost)    { url = '/transaction/report-lost-book';    payload = { bookCopyId: btn.dataset.bookCopyId }; label = 'LOST'; }
  if (isDamaged) { url = '/transaction/report-damaged-book'; payload = { bookCopyId: btn.dataset.bookCopyId }; label = 'DAMAGED'; }
  if (isSettle)  { url = '/transaction/settle-payment';      payload = { borrowId: btn.dataset.borrowId };     label = 'SETTLE'; }

  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.textContent = 'Processing…';
  try {
    const res  = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      showToast('✓ ' + (data.message || `${label} recorded successfully!`));
      setTimeout(() => location.reload(), 900);
    } else {
      showToast('✗ ' + (data.message || `Cannot process ${label}. Please try again.`));
    }
  } catch { showToast(`✗ Something went wrong during ${label}.`); }
  finally { btn.disabled = false; btn.innerHTML = orig; }
});

// ── Filters & pagination ──
function updateQuery(params) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, val]) => {
    if (val === null || val === undefined || val === '') url.searchParams.delete(key);
    else url.searchParams.set(key, String(val));
  });
  if ('payment' in params || 'overdue' in params || 'q' in params || 'view' in params) url.searchParams.set('page', '1');
  window.location.href = url.toString();
}
document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { const q = e.target.value.trim(); if (q) updateQuery({ q }); }
});
document.getElementById('paymentFilter')?.addEventListener('change', (e) => updateQuery({ payment: e.target.value }));
document.getElementById('viewFilter')?.addEventListener('change',    (e) => updateQuery({ view: e.target.value }));
document.getElementById('overdueBtn')?.addEventListener('click', () => {
  const el = document.getElementById('overdueBtn');
  updateQuery({ overdue: el.dataset.overdue === '1' ? '0' : '1' });
});
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.page-btn');
  if (btn) updateQuery({ page: btn.dataset.page });
});

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#studentSearch') && !e.target.closest('#studentDropdown')) hideDropdown(studentDropdown);
  if (!e.target.closest('#bookSearch')    && !e.target.closest('#bookDropdown'))    hideDropdown(bookDropdown);
});