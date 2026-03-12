//
//
//
const booksList = document.querySelector(".books-list");
const updateBtn = document.querySelectorAll(".updateBtn");
const deleteBtn = document.querySelectorAll(".deleteBtn");
const addBookBtn = document.getElementById("AddBookBtn");
const bookSearchBtn = document.getElementById("bookSearchBtn");
const bookSearchInput = document.getElementById("bookSearchInput");

bookSearchBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const query = bookSearchInput.value.trim();

  const res = await fetch(`/api/books?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  console.log(data);

  //--------------TRY
  renderBooks(data.books);
});

addBookBtn.addEventListener("click", () => {
  window.location.href = "/book/add";
});

updateBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.id;

    window.location.href = `/book/update/${id}`;
  });
});

// deleteBtn.forEach((btn) => {
//   btn.addEventListener("click", async () => {
//     const id = btn.dataset.id;
//     try {
//       const response = await fetch(`/book/delete/${id}`, {
//         method: "DELETE",
//       });
//       if (response.ok) {
//         window.location.reload();
//       }
//     } catch (error) {
//       console.error("Error deleting book:", error);
//     }
//   });
// });
/* ===== Modal Logic ===== */
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalConfirmBtn = document.getElementById("modalConfirmBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");

// -----------------------------------------------------------------

const sortSelect = document.getElementById("sortSelect");
const genreFilter = document.getElementById("genreFilter");

function applyFilters() {
  const sort = sortSelect.value;
  const genre = genreFilter.value;

  const params = new URLSearchParams();
  params.set("sort", sort);
  if (genre) params.set("genre", genre);

  window.location.href = `/book/get-all-books?${params.toString()}`;
}
sortSelect.addEventListener("change", applyFilters);
genreFilter.addEventListener("change", applyFilters);
// -----------------------------------------------------------------

let onConfirmAction = null;

function openModal({ title, message, onConfirm }) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  onConfirmAction = onConfirm;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  onConfirmAction = null;
}

modalCancelBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

modalConfirmBtn.addEventListener("click", async () => {
  if (!onConfirmAction) return;

  modalConfirmBtn.disabled = true;
  await onConfirmAction();
  modalConfirmBtn.disabled = false;

  closeModal();
});

/* ===== Notification ===== */
const toast = document.getElementById("notificationToast");

function showNotification(message, duration = 2000) {
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

deleteBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.id;

    openModal({
      title: "Confirm deletion",
      message: "This action cannot be undone. Delete this book?",
      onConfirm: async () => {
        const response = await fetch(`/book/delete/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showNotification("Book deleted successfully");
          setTimeout(() => window.location.reload(), 800);
        } else {
          showNotification("Failed to delete book");
        }
      },
    });
  });
});

// -------------------------------------
// VIEW BOOK FUNCTIONALITY
// -------------------------------------

const viewBookBtn = document.querySelectorAll(".viewBookBtn");

viewBookBtn.forEach((viewBtn) => {
  viewBtn.addEventListener("click", () => {
    window.location.href = `/book/get/viewBook/${viewBtn.dataset.id}`;
  });
});

const template = document.getElementById("bookCardTemplate");

function renderBooks(books) {
  booksList.innerHTML = "";

  if (!books.length) {
    booksList.textContent = "No books found.";
    return;
  }

  books.forEach((b) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector(".book-title").textContent = b.title;
    clone.querySelector(".author").textContent = `Author: ${b.author}`;
    clone.querySelector(".isbn").textContent = `ISBN: ${b.isbn}`;
    clone.querySelector(".publisher").textContent = `Publisher: ${b.publisher}`;
    clone.querySelector(".genre").textContent = `Genre: ${b.genre}`;
    clone.querySelector(".location").textContent =
      `Location: ${b.book_location}`;
    clone.querySelector(".total").textContent =
      `Total Copies: ${b.total_copies}`;
    clone.querySelector(".available").textContent =
      `Available Count: ${b.available_count}`;

    const updateBtn = clone.querySelector(".updateBtn");
    const deleteBtn = clone.querySelector(".deleteBtn");
    const viewBtn = clone.querySelector(".viewBookBtn");

    viewBtn.dataset.id = b.id;

    updateBtn.dataset.id = b.id;
    deleteBtn.dataset.id = b.id;

    const photoSlot = clone.querySelector(".photo-slot");
    if (b.book_photo_file_path) {
      const img = document.createElement("img");
      img.src = `/uploads/${b.book_photo_file_path}`;
      img.alt = b.title;
      photoSlot.appendChild(img);
    } else {
      photoSlot.textContent = "No Photo";
    }

    booksList.appendChild(clone);
  });

  rebindActionButtons();
}

function rebindActionButtons() {
  document.querySelectorAll(".updateBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = `/book/update/${btn.dataset.id}`;
    });
  });

  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      openModal({
        title: "Confirm deletion",
        message: "This action cannot be undone. Delete this book?",
        onConfirm: async () => {
          const response = await fetch(`/book/delete/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            showNotification("Book deleted successfully");
            btn.closest(".book-card").remove();
          } else {
            showNotification("Failed to delete book");
          }
        },
      });
    });
  });

  document.querySelectorAll(".viewBookBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = `/book/get/viewBook/${btn.dataset.id}`;
    });
  });
}


function renderBooks(books) {
  booksList.innerHTML = "";

  if (!books || books.length === 0) {
    booksList.innerHTML = '<tr><td colspan="9" class="no-data-row">No books found.</td></tr>';
    return;
  }

  books.forEach((b) => {
    const clone = template.content.cloneNode(true);

    // Title
    clone.querySelector(".book-title").textContent = b.title || "—";

    // === FIXED THUMBNAIL LOGIC (this is the important part) ===
    const thumbDiv = clone.querySelector(".book-thumb");
    thumbDiv.innerHTML = "";                    // clear anything old

    if (b.book_photo_file_path && b.book_photo_file_path.trim() !== "") {
      const img = document.createElement("img");
      img.src = `/uploads/${b.book_photo_file_path}`;
      img.alt = b.title || "Book cover";
      img.style.cssText = "width:100%; height:100%; object-fit:cover; display:block;";
      thumbDiv.appendChild(img);
    } else {
      thumbDiv.innerHTML = `<span class="no-photo-text">NO PHOTO</span>`;
    }

    // Other columns (updated to match your current table)
    clone.querySelector(".author").textContent    = b.author || "—";
    clone.querySelector(".isbn").textContent      = b.isbn || "—";
    clone.querySelector(".publisher").textContent = b.publisher || "—";
    clone.querySelector(".genre").textContent     = b.genre || "—";
    clone.querySelector(".location").textContent  = b.book_location || "—";
    clone.querySelector(".total").textContent     = b.total_copies ?? "0";
    clone.querySelector(".available").textContent = b.available_count ?? "0";

    // Buttons
    const viewBtn   = clone.querySelector(".viewBookBtn");
    const updateBtn = clone.querySelector(".updateBtn");
    const deleteBtn = clone.querySelector(".deleteBtn");

    if (viewBtn)   viewBtn.dataset.id   = b.id;
    if (updateBtn) updateBtn.dataset.id = b.id;
    if (deleteBtn) deleteBtn.dataset.id = b.id;

    booksList.appendChild(clone);
  });

  rebindActionButtons();
}