
// updateBook.js

// ===============================================
// ELEMENT DECLARATIONS
// ===============================================
const bookTitle       = document.getElementById("bookTitle");
const bookAuthor      = document.getElementById("bookAuthor");
const bookIsbn        = document.getElementById("bookIsbn");
const bookGenre       = document.getElementById("bookGenre");
const bookpublisher   = document.getElementById("bookPublisher");
const bookLocation    = document.getElementById("bookLocation");
const backBtn         = document.getElementById("backBtn");
const updateBookBtn   = document.getElementById("updateBook");
const form            = document.getElementById("form");
const bookGenreInput  = document.getElementById("bookGenre");

// ===============================================
// TOAST NOTIFICATION SYSTEM
// ===============================================
function showToast(message, type = "info", duration = 3500) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    Object.assign(container.style, {
      position: "fixed", top: "24px", left: "50%",
      transform: "translateX(-50%)", display: "flex",
      flexDirection: "column", alignItems: "center", gap: "10px", zIndex: "9999",
    });
    document.body.appendChild(container);
  }

  const colors = {
    success: { bg: "#22c55e", icon: "✓" },
    error:   { bg: "#ef4444", icon: "✕" },
    warning: { bg: "#f59e0b", icon: "⚠" },
    info:    { bg: "#3b82f6", icon: "ℹ" },
  };
  const { bg, icon } = colors[type] || colors.info;

  const toast = document.createElement("div");
  Object.assign(toast.style, {
    background: bg, color: "#fff", padding: "12px 18px", borderRadius: "8px",
    fontSize: "14px", fontWeight: "500", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    display: "flex", alignItems: "center", gap: "10px", maxWidth: "320px",
    opacity: "0", transform: "translateY(-20px)",
    transition: "opacity 0.3s ease, transform 0.3s ease",
  });
  toast.innerHTML = `<span style="font-size:16px;font-weight:bold;">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }));

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}

// ===============================================
// ERROR MESSAGES MAP
// ===============================================
const errorMessages = {
  DUPLICATE_COPY_ID:
    "That copy ID already exists in another book. Each physical copy must have a unique ID.",
  COPY_HAS_BORROW_RECORD:
    "Some copies cannot be removed because they are currently borrowed. " +
    "Please make sure all borrowed copies have been returned before trying to remove them.",
  COPY_HAS_RESERVATION:
    "Some copies cannot be removed because they have an active reservation. " +
    "Please cancel the reservation first, then try again.",
  COPY_HAS_LINKED_RECORD:
    "Some copies cannot be removed because they are still linked to existing records. " +
    "Please resolve those records first before removing these copies.",
  INVALID_INPUT:
    "One or more fields are missing or invalid. Please check all fields and try again.",
  BOOK_NOT_FOUND:
    "This book no longer exists in the system. Please go back and refresh.",
  SERVER_ERROR:
    "The server encountered an unexpected error. Please try again.",
};

// ===============================================
// STATE
// ===============================================
const bookCopyActions = {
  toRemove:         [],
  toMarkAsFound:    [],
  toMarkAsRepaired: [],
  toMarkAsLost:     [],
  toMarkAsDamage:   [],
};

// ===============================================
// BOOK ID — read from the data attribute on the title input
// ===============================================
const bookId = bookTitle ? bookTitle.dataset.bookId : null;

// ===============================================
// BOOK QUANTITY COUNTER
// ===============================================
const bookCountEl = document.getElementById("bookCount");
let bookQty = Number(bookCountEl ? bookCountEl.textContent : 0);

function updateBookCount(delta) {
  bookQty += delta;
  if (bookCountEl) bookCountEl.innerText = bookQty;
}

// -----------------------------------------------
// GENRE — force uppercase
// -----------------------------------------------
if (bookGenreInput) {
  bookGenreInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
  });
}

const bookIdSectionScrollArea = document.getElementById("bookIdSectionScrollArea");

// ===============================================
// REMOVE LISTENER (for dynamically added new copies)
// ===============================================
function attachRemoveListener(btn) {
  btn.addEventListener("click", () => {
    const container = btn.parentElement;
    if (!container) {
      showToast("Could not find the book copy to remove.", "error");
      return;
    }
    container.remove();
    updateBookCount(-1);
  });
}

// -----------------------------------------------
// ADD NEW BOOK COPY
// -----------------------------------------------
const addBookIdBtn = document.getElementById("addBookIdBtn");
if (addBookIdBtn) {
  addBookIdBtn.addEventListener("click", () => createBookCopyInput());
}

function createBookCopyInput() {
  const span = document.createElement("span");
  span.classList.add("bookIdContainer");
  Object.assign(span.style, {
    display: "flex", alignItems: "center", gap: "6px",
    background: "rgba(34,211,238,0.04)", border: "1px solid rgba(34,211,238,0.25)",
    borderRadius: "8px", padding: "8px 10px",
  });

  const bookCopyIdInput = document.createElement("input");
  bookCopyIdInput.setAttribute("name", "newBookCopies[]");
  bookCopyIdInput.setAttribute("required", "");
  bookCopyIdInput.setAttribute("type", "text");
  bookCopyIdInput.placeholder = "Enter copy ID (min. 4 characters)";
  Object.assign(bookCopyIdInput.style, {
    flex: "1", background: "transparent", border: "none", outline: "none",
    boxShadow: "none", padding: "0", fontSize: "13px",
    fontFamily: "'DM Mono', monospace", color: "#ddeeff",
  });

  bookCopyIdInput.addEventListener("focus", () => {
    bookCopyIdInput.style.color = "#ddeeff";
    bookCopyIdInput.style.background = "transparent";
    span.style.borderColor = "rgba(34,211,238,0.55)";
    span.style.boxShadow = "0 0 0 3px rgba(34,211,238,0.18)";
  });
  bookCopyIdInput.addEventListener("blur", () => {
    span.style.borderColor = "rgba(34,211,238,0.25)";
    span.style.boxShadow = "none";
  });

  const removeBtn = document.createElement("button");
  removeBtn.setAttribute("type", "button");
  removeBtn.classList.add("copy-action-btn", "remove-new-btn");
  Object.assign(removeBtn.style, {
    display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 9px",
    borderRadius: "6px", fontSize: "11px", fontWeight: "600",
    fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
    background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
    color: "#f87171", whiteSpace: "nowrap",
  });
  removeBtn.innerHTML = `
    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg> Remove`;
  removeBtn.addEventListener("mouseenter", () => removeBtn.style.background = "rgba(248,113,113,0.16)");
  removeBtn.addEventListener("mouseleave", () => removeBtn.style.background = "rgba(248,113,113,0.08)");

  span.appendChild(bookCopyIdInput);
  span.appendChild(removeBtn);
  if (bookIdSectionScrollArea) bookIdSectionScrollArea.appendChild(span);

  updateBookCount(+1);
  attachRemoveListener(removeBtn);
  bookCopyIdInput.focus();
}

// ===============================================
// EXISTING COPIES — action buttons
// ===============================================
if (bookIdSectionScrollArea) {
  bookIdSectionScrollArea.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const copyId = btn.dataset.copyId;
    const container = btn.closest(".bookIdContainer");

    if (btn.classList.contains("updateRemoveBtn")) {
      if (!copyId) { showToast("Missing copy ID.", "error"); return; }
      if (bookCopyActions.toRemove.includes(copyId)) {
        showToast(`Copy #${copyId} is already queued for removal.`, "warning"); return;
      }
      bookCopyActions.toRemove.push(copyId);
      if (container) container.remove();
      updateBookCount(-1);
      showToast(`Copy #${copyId} queued for removal.`, "info");
      return;
    }

    if (btn.classList.contains("markAsLostBtn")) {
      if (!copyId) { showToast("Missing copy ID.", "error"); return; }
      if (bookCopyActions.toMarkAsLost.includes(copyId)) {
        showToast(`Copy #${copyId} is already marked as Lost.`, "warning"); return;
      }
      bookCopyActions.toMarkAsLost.push(copyId);
      btn.style.background = "#ef4444"; btn.style.color = "#fff"; btn.disabled = true;
      showToast(`Copy #${copyId} marked as Lost.`, "success");
      return;
    }

    if (btn.classList.contains("foundBtn")) {
      if (!copyId) { showToast("Missing copy ID.", "error"); return; }
      if (bookCopyActions.toMarkAsFound.includes(copyId)) {
        showToast(`Copy #${copyId} is already marked as Found.`, "warning"); return;
      }
      bookCopyActions.toMarkAsFound.push(copyId);
      btn.style.background = "#22c55e"; btn.style.color = "#fff"; btn.disabled = true;
      showToast(`Copy #${copyId} marked as Found.`, "success");
      return;
    }

    if (btn.classList.contains("markAsDamageBtn")) {
      if (!copyId) { showToast("Missing copy ID.", "error"); return; }
      if (bookCopyActions.toMarkAsDamage.includes(copyId)) {
        showToast(`Copy #${copyId} is already marked as Damaged.`, "warning"); return;
      }
      bookCopyActions.toMarkAsDamage.push(copyId);
      btn.style.background = "#f59e0b"; btn.style.color = "#fff"; btn.disabled = true;
      showToast(`Copy #${copyId} marked as Damaged.`, "success");
      return;
    }

    if (btn.classList.contains("repairedBtn")) {
      if (!copyId) { showToast("Missing copy ID.", "error"); return; }
      if (bookCopyActions.toMarkAsRepaired.includes(copyId)) {
        showToast(`Copy #${copyId} is already marked as Repaired.`, "warning"); return;
      }
      bookCopyActions.toMarkAsRepaired.push(copyId);
      btn.style.background = "#22c55e"; btn.style.color = "#fff"; btn.disabled = true;
      showToast(`Copy #${copyId} marked as Repaired.`, "success");
      return;
    }
  });
}

// ===============================================
// UPDATE BUTTON — confirm modal then submit
// ===============================================
if (updateBookBtn) {
  updateBookBtn.addEventListener("click", () => {
    openConfirmModal({
      title: "Confirm update",
      message: "Are you sure you want to update this book?",
      onConfirm: async () => { await submitUpdate(); },
    });
  });
}

async function submitUpdate() {
  if (!form.checkValidity()) {
    form.reportValidity();
    showToast("Please fill in all required fields before updating.", "warning");
    return;
  }

  if (!bookId) {
    showToast("Cannot submit: book ID is missing.", "error");
    return;
  }

  // ✅ CLIENT-SIDE DUPLICATE CHECK — catches duplicates before hitting the server
  const existingCopyIds = [...document.querySelectorAll('input[name="bookIds[]"]')]
    .map(i => i.value.trim().toLowerCase());

  const newCopyInputs = [...document.querySelectorAll('input[name="newBookCopies[]"]')];
  const newCopyIds = newCopyInputs.map(i => i.value.trim().toLowerCase()).filter(Boolean);

  // Check new copies against existing copies on this book
  for (const id of newCopyIds) {
    if (existingCopyIds.includes(id)) {
      showToast(`Copy ID "${id}" already exists in this book. Please use a unique ID.`, "error");
      return;
    }
  }

  // Check new copies against each other
  const uniqueNewIds = new Set(newCopyIds);
  if (uniqueNewIds.size !== newCopyIds.length) {
    showToast("You have duplicate copy IDs in your new entries. Each copy ID must be unique.", "error");
    return;
  }

  const formData = new FormData(form);
  formData.append("bookId", bookId);

  bookCopyActions.toMarkAsFound.forEach(id   => formData.append("listOfCopyToBeMarkAsFound[]",    id));
  bookCopyActions.toMarkAsRepaired.forEach(id => formData.append("listOfCopyToBeMarkAsRepaired[]", id));
  bookCopyActions.toRemove.forEach(id         => formData.append("listOfCopyToRemove[]",           id));
  bookCopyActions.toMarkAsLost.forEach(id     => formData.append("listOfCopyToBeMarkAsLost[]",     id));
  bookCopyActions.toMarkAsDamage.forEach(id   => formData.append("listOfCopyToBeMarkAsDamage[]",   id));

  updateBookBtn.disabled    = true;
  updateBookBtn.textContent = "Updating...";

  try {
    const response = await fetch(`/book/update/${bookId}`, {
      method: "PATCH",
      body: formData,
    });

    let responseContent;
    try { responseContent = await response.json(); } catch { responseContent = {}; }

    // ✅ check BOTH response.ok AND success field
    if (!response.ok || responseContent.success === false) {
      const friendlyMessage =
        errorMessages[responseContent?.errorCode] ||
        responseContent?.message ||
        "The book could not be updated. Please try again or contact support.";
      showToast(friendlyMessage, "error");
      console.error("Update failed:", response.status, responseContent);
      return;
    }

    showToast("Book updated successfully!", "success");
    setTimeout(() => {
  window.parent.navigateTo('books', 'Books', '/book/get-all-books?embed=true');
}, 1500);


  } catch (err) {
    if (err instanceof SyntaxError) {
      showToast("Unexpected response from server. Check console for details.", "error");
      console.error("JSON parse error:", err);
    } else {
      showToast("Network error. Please check your connection and try again.", "error");
      console.error("Fetch error:", err);
    }
  } finally {
    updateBookBtn.disabled  = false;
    updateBookBtn.innerHTML = `<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Save Changes`;
  }
}

// -----------------------------------------------
// BACK BUTTON
// -----------------------------------------------
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "/book/get-all-books";
  });
}


// -----------------------------------------------
// CANCEL BUTTON (backBtn2)
// -----------------------------------------------
const backBtn2 = document.getElementById("backBtn2");
if (backBtn2) {
  backBtn2.addEventListener("click", () => {
    window.location.reload();
  });
}