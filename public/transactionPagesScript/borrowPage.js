//
//
//
const form      = document.getElementById('form');
const recordBtn = document.getElementById('recordBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  recordBtn.disabled = true;
  recordBtn.textContent = 'Recording…';

  const formData = new FormData(form);

  try {
    const serverResponse = await fetch('/transaction/borrow', {
      method: 'POST',
      body: formData,
    });

    const result = await serverResponse.json();

    console.log('SERVER RESPONSE:', result);
    console.log(Object.fromEntries(formData.entries()));

    if (result.success === true) {
      showToast('✓ Book borrowed successfully!');
      form.reset();
    } else {
      showToast('✗ Borrow failed! ' + (result.message || 'Please check your inputs.'));
    }

  } catch (err) {
    console.error('Borrow error:', err);
    showToast('✗ Something went wrong. Please try again.');
  } finally {
    recordBtn.disabled = false;
    recordBtn.innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> Record Borrow`;
  }
});
