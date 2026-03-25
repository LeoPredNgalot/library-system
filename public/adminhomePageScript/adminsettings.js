 /* ─────────────────────────────────────────
     TOAST HELPER
  ───────────────────────────────────────── */
  const toast = document.getElementById('toast');
  function showToast(msg, type = '') {
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    setTimeout(() => { toast.className = 'toast'; }, 3500);
  }

  /* ─────────────────────────────────────────
     MODAL HELPERS
  ───────────────────────────────────────── */
  function openModal(id)  { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('open');
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  /* ─────────────────────────────────────────
     RESET LIBRARIAN PASSWORD
  ───────────────────────────────────────── */
  document.getElementById('clearResetBtn').addEventListener('click', () => {
    document.getElementById('resetLibrarianId').value = '';
    document.getElementById('resetNewPassword').value = '';
  });

  document.getElementById('submitResetBtn').addEventListener('click', () => {
    const id  = document.getElementById('resetLibrarianId').value.trim();
    const pwd = document.getElementById('resetNewPassword').value;

    if (!id) {
      showToast('Please enter a Librarian ID.', 'error');
      return;
    }
    if (!pwd || pwd.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    document.getElementById('confirmLibrarianId').textContent = id;
    openModal('resetConfirmModal');
  });

  document.getElementById('cancelResetBtn').addEventListener('click', () => closeModal('resetConfirmModal'));

  document.getElementById('proceedResetBtn').addEventListener('click', async () => {
    closeModal('resetConfirmModal');
    const id  = document.getElementById('resetLibrarianId').value.trim();
    const pwd = document.getElementById('resetNewPassword').value;

    try {
      const res  = await fetch(`/librarian/reset-password/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: pwd }),
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('resetLibrarianId').value = '';
        document.getElementById('resetNewPassword').value = '';
        showToast('Password reset successfully.', 'success');
      } else {
        showToast(data.message || 'Failed to reset password.', 'error');
      }
    } catch (err) {
      showToast('Server error. Please try again.', 'error');
    }
  });

  /* ─────────────────────────────────────────
     DANGER ZONE — DELETE MODAL
  ───────────────────────────────────────── */
  const actionNames = {
    reservations:  'all reservation records',
    borrows:       'all borrow records',
    students:      'all student records',
    'book-copies': 'all book copies',
    books:         'all book records',
  };

  document.querySelectorAll('.deleteLink').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const action = this.dataset.action;
      document.getElementById('deleteAction').value           = action;
      document.getElementById('modalActionLabel').textContent = actionNames[action] || action;
      document.getElementById('adminPassword').value          = '';
      openModal('passwordModal');
    });
  });

  document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('passwordModal'));

  document.getElementById('adminDeleteForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const action   = document.getElementById('deleteAction').value;
    const password = document.getElementById('adminPassword').value;

    try {
      const res  = await fetch('/librarian/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, password }),
      });
      const data = await res.json();
      closeModal('passwordModal');
      if (data.success) {
        showToast('Records deleted successfully.', 'success');
      } else {
        showToast(data.message || 'Failed to delete records.', 'error');
      }
    } catch (err) {
      closeModal('passwordModal');
      showToast('Server error. Please try again.', 'error');
    }
  });