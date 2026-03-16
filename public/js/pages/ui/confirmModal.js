//
//
// THIS FILE IS SUPPOSED TO BE REUSABLE
// I THINK MAO NIY JS NGA MU ATTACH SA HTML MODAL

function openConfirmModal({ title, message, onConfirm }) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  modal.classList.remove("hidden");

  // Reset confirm handler
  modalConfirmBtn.onclick = null;

  modalConfirmBtn.onclick = async () => {
    modalConfirmBtn.disabled = true;

    try {
      await onConfirm();
    } finally {
      modalConfirmBtn.disabled = false;
      modal.classList.add("hidden");
    }
  };

  modalCancelBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  };
}
