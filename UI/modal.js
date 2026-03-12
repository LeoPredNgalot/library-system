// Reusable Modal Logic

// I PREFER THE OTHER FILE NGA LOCATED SA PUBLIC FOLDER
// KAY LESS INTIMIDATING CYA
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalConfirmBtn = document.getElementById("modalConfirmBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");

let onConfirmCallback = null;

/**
 * Opens the modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {Function} onConfirm - Function to run if user confirms
 */
export function openModal({ title, message, onConfirm }) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  onConfirmCallback = onConfirm;

  modal.classList.remove("hidden");
}

/**
 * Closes the modal and resets state
 */
function closeModal() {
  modal.classList.add("hidden");
  onConfirmCallback = null;
}

/* Cancel button */
modalCancelBtn.addEventListener("click", () => {
  closeModal();
});

/* Click outside modal closes it */
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

/* Confirm button */
modalConfirmBtn.addEventListener("click", async () => {
  if (!onConfirmCallback) return;

  modalConfirmBtn.disabled = true;

  try {
    await onConfirmCallback();
  } finally {
    modalConfirmBtn.disabled = false;
    closeModal();
  }
});
