//
// public/librarianPagesScripts/viewAllLibrarian.js
//

// ==============================
// TOAST
// ==============================
function showToast(msg, duration = 4000) {
  const t = document.getElementById('notificationToast');
  if (!t) { alert(msg); return; }
  t.textContent = msg;
  t.classList.remove('hidden', 'error', 'success');
  if (msg.startsWith('✗')) t.classList.add('error');
  else if (msg.startsWith('✓')) t.classList.add('success');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

// ==============================
// MODAL HELPERS
// ==============================
function openModal(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

// Close on overlay click
['addModal','editModal','deleteModal','resetModal'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', function(e) {
    if (e.target === this) closeModal(id);
  });
});

// ==============================
// ADD LIBRARIAN
// ==============================
document.getElementById('openAddModal')?.addEventListener('click', () => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  document.getElementById('addDateRegistered').value = today;
  openModal('addModal');
});
document.getElementById('closeAddModal')?.addEventListener('click', () => closeModal('addModal'));
document.getElementById('cancelAddModal')?.addEventListener('click', () => closeModal('addModal'));

document.getElementById('addForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering…';

  try {
    const res  = await fetch('/librarian/register', { method: 'POST', body: new FormData(this) });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast('✓ Librarian registered successfully.');
      closeModal('addModal');
      this.reset();
      setTimeout(() => location.reload(), 900);
    } else {
      let errMsg = 'Registration failed. Please check your inputs.';
      if (data.message && typeof data.message === 'string') {
        errMsg = data.message;
      } else if (data.message && typeof data.message === 'object') {
        const msgs = Object.entries(data.message)
          .filter(([key]) => key !== '_errors')
          .map(([field, val]) => val?._errors?.[0] ? `${field}: ${val._errors[0]}` : null)
          .filter(Boolean);
        if (msgs.length) errMsg = msgs.join(' · ');
      }
      showToast('✗ ' + errMsg);
    }
  } catch (err) {
    showToast('✗ Something went wrong. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> Register`;
  }
});

// ==============================
// EDIT LIBRARIAN
// ==============================
document.querySelectorAll('.editBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('editId').value               = btn.dataset.id             || '';
    document.getElementById('editUsername').value         = btn.dataset.username        || '';
    document.getElementById('editEmail').value            = btn.dataset.email           || '';
    document.getElementById('editFirstName').value        = btn.dataset.firstname       || '';
    document.getElementById('editLastName').value         = btn.dataset.lastname        || '';
    document.getElementById('editContact').value          = btn.dataset.contact         || '';
    document.getElementById('editDateRegistered').value   = btn.dataset.dateregistered  || '—'; // ✅ NEW
    openModal('editModal');
  });
});

document.getElementById('cancelEditTop')?.addEventListener('click',    () => closeModal('editModal'));
document.getElementById('cancelEditBottom')?.addEventListener('click', () => closeModal('editModal'));

document.getElementById('editForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  if (!id) { showToast('✗ Cannot update: librarian ID is missing.'); return; }

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating…';

  try {
    const res  = await fetch(`/librarian/update/${id}`, { method: 'PUT', body: new FormData(this) });
    const data = await res.json();

    if (data.success) {
      showToast('✓ Librarian updated successfully.');
      closeModal('editModal');
      setTimeout(() => location.reload(), 900);
    } else {
      showToast('✗ ' + (data.message || 'Update failed. The username or email may already be taken.'));
    }
  } catch (err) {
    showToast('✗ Something went wrong while updating.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Update`;
  }
});

// ==============================
// DELETE LIBRARIAN
// ==============================
let pendingDeleteId = null;

document.querySelectorAll('.deleteBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    pendingDeleteId = btn.dataset.librarianId;
    openModal('deleteModal');
  });
});

document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));

document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Deleting…';

  try {
    const res  = await fetch(`/librarian/delete/${pendingDeleteId}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      showToast('✓ Librarian deleted successfully.');
      closeModal('deleteModal');
      setTimeout(() => location.reload(), 900);
    } else {
      showToast('✗ ' + (data.message || 'Cannot delete. They may have existing transaction records.'));
      closeModal('deleteModal');
    }
  } catch (err) {
    showToast('✗ Something went wrong while deleting.');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Delete`;
  }
});

// ==============================
// RESET PASSWORD
// ==============================
let pendingResetId = null;

document.querySelectorAll('.resetBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    pendingResetId = btn.dataset.librarianId;
    document.getElementById('newPassword').value = '';
    openModal('resetModal');
  });
});

document.getElementById('closeResetModal')?.addEventListener('click',  () => closeModal('resetModal'));
document.getElementById('cancelResetBtn')?.addEventListener('click',   () => closeModal('resetModal'));

document.getElementById('confirmResetBtn')?.addEventListener('click', async () => {
  const pw = document.getElementById('newPassword').value.trim();
  if (!pw) { showToast('✗ Please enter a new password.'); return; }

  // ✅ 8 character minimum check
  if (pw.length < 8) { showToast('✗ Password must be at least 8 characters long.'); return; }

  const confirmBtn = document.getElementById('confirmResetBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Resetting…';

  try {
    const res  = await fetch(`/librarian/reset-password/${pendingResetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: pw }),
    });
    const data = await res.json();

    if (data.success) {
      showToast('✓ Password reset successfully.');
      closeModal('resetModal');
    } else {
      showToast('✗ ' + (data.message || 'Reset failed. Please try again.'));
    }
  } catch (err) {
    showToast('✗ Something went wrong while resetting the password.');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Reset Password`;
  }
});

// ==============================
// CLIENT-SIDE SEARCH
// ==============================
document.getElementById('libSearchBtn')?.addEventListener('click', filterTable);
document.getElementById('libSearchInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') filterTable(); });

function filterTable() {
  const q = document.getElementById('libSearchInput').value.toLowerCase().trim();
  document.querySelectorAll('#libTableBody tr').forEach(row => {
    if (row.classList.contains('no-data-row')) return;
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}



window.addEventListener('load', () => {
  const input = document.getElementById('libSearchInput');
  if (input) {
    input.value = '';
    filterTable(); // re-run filter so all rows show
  }
});