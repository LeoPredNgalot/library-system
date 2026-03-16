function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// MODAL ELEMENTS
const modal = document.getElementById("passwordModal");
const deleteActionInput = document.getElementById("deleteAction");
const form = document.getElementById("adminDeleteForm");

// OPEN MODAL
document.querySelectorAll(".deleteLink").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const action = this.dataset.action;
    deleteActionInput.value = action;
    modal.classList.add("open");
  });
});

// CANCEL BUTTON
document.getElementById("cancelBtn").addEventListener("click", () => {
  modal.classList.remove("open");
});

// CLOSE ON BACKDROP CLICK
modal.addEventListener("click", function(e) {
  if (e.target === this) modal.classList.remove("open");
});

// CLOSE ON ESCAPE KEY
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") modal.classList.remove("open");
});

// SUBMIT USING FETCH
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const payload = {
    action: formData.get("action"),
    password: formData.get("password"),
  };
  try {
    const response = await fetch("/librarian/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (result.success) {
      modal.classList.remove("open");
      form.reset();
      showToast(result.message || "Deleted successfully.", "success");
    } else {
      showToast(result.message || "Delete failed.", "error");
    }
  } catch (error) {
    console.error(error);
    showToast("Server error. Please try again.", "error");
  }
});