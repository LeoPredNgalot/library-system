//
// public/usersScripts/viewAllUsers.js
//

// ------------------------------
// TOAST SYSTEM
// ------------------------------
function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;`;
    document.body.appendChild(container);
  }
  const colors = {
    success: { bg:"rgba(34,211,238,0.12)",  border:"rgba(34,211,238,0.3)",  icon:"#22d3ee" },
    error:   { bg:"rgba(248,113,113,0.12)", border:"rgba(248,113,113,0.3)", icon:"#f87171" },
    warning: { bg:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.3)",  icon:"#fbbf24" },
  };
  const icons = {
    success: `<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
    error:   `<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    warning: `<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01"/></svg>`,
  };
  if (!document.getElementById("toastStyle")) {
    const style = document.createElement("style");
    style.id = "toastStyle";
    style.textContent = `
      @keyframes toastIn  { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0);} to{opacity:0;transform:translateY(10px);} }
      .field-inline-error { font-size:11px; color:#f87171; margin-top:4px; display:none; font-family:'DM Sans',sans-serif; }
      .field-inline-error.visible { display:block; }
      .input-error { border-color:rgba(248,113,113,0.5) !important; }
    `;
    document.head.appendChild(style);
  }
  const c = colors[type] || colors.success;
  const toast = document.createElement("div");
  toast.style.cssText = `display:flex;align-items:flex-start;gap:10px;background:#0d1e30;border:1px solid ${c.border};border-radius:10px;padding:12px 14px;box-shadow:0 8px 32px rgba(0,0,0,0.4);font-family:'DM Sans',sans-serif;font-size:13px;color:#ddeeff;min-width:280px;max-width:380px;pointer-events:all;animation:toastIn 0.25s cubic-bezier(0.22,1,0.36,1) both;`;
  toast.innerHTML = `<div style="width:28px;height:28px;border-radius:7px;background:${c.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${c.icon};">${icons[type]||icons.success}</div><div style="flex:1;padding-top:2px;line-height:1.5;">${message}</div><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#3d5a73;padding:2px;flex-shrink:0;"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = "toastOut 0.2s ease forwards"; setTimeout(() => toast.remove(), 200); }, 4000);
}

// ------------------------------
// INLINE FIELD ERROR HELPERS
// ------------------------------
function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.add("input-error");
  errorEl.textContent = message;
  errorEl.classList.add("visible");
}
function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove("input-error");
  errorEl.textContent = "";
  errorEl.classList.remove("visible");
}

// ------------------------------
// SECTION DATA
// ------------------------------
const grade11Sections = [
  "Jupiter", "Mars", "Venus", "Earth",
];
const grade12Sections = [
  "Pluto", "Saturn", "Neptune", "Mercury",
];

function populateSections(gradeSelectEl, sectionSelectEl, keepSelectedValue = null) {
  sectionSelectEl.innerHTML = '<option value="">-- Select Section --</option>';
  let sections = [];
  if (gradeSelectEl.value === "11") sections = grade11Sections;
  if (gradeSelectEl.value === "12") sections = grade12Sections;
  sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    if (keepSelectedValue && keepSelectedValue === section) option.selected = true;
    sectionSelectEl.appendChild(option);
  });
}

// ------------------------------
// TABLE REFERENCE
// ------------------------------
const table = document.getElementById("studentsTable");
if (!table) console.error("Students table not found in the DOM.");

// ==============================
// EDIT MODAL
// ==============================
const editBackdrop      = document.getElementById("editBackdrop");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const cancelEditBtn     = document.getElementById("cancelEditBtn");
const editForm          = document.getElementById("editForm");
const editGrade         = document.getElementById("editGrade");
const editSection       = document.getElementById("editSection");
const editCurrentStudentId = document.getElementById("editCurrentStudentId");
const editStudentId     = document.getElementById("editStudentId");
const editFirstName     = document.getElementById("editFirstName");
const editLastName      = document.getElementById("editLastName");
const editEmail         = document.getElementById("editEmail");
const editContact       = document.getElementById("editContact");

function showEditModal() { editBackdrop.classList.remove("hidden"); }
function hideEditModal()  { editBackdrop.classList.add("hidden"); }

closeEditModalBtn.addEventListener("click", hideEditModal);
cancelEditBtn.addEventListener("click", hideEditModal);
editBackdrop.addEventListener("click", (e) => { if (e.target === editBackdrop) hideEditModal(); });
editGrade.addEventListener("change", () => { populateSections(editGrade, editSection); });

function openEditModalFromRow(tr) {
  editCurrentStudentId.value = tr.dataset.studentId;
  editStudentId.value  = tr.dataset.studentId || "";
  editFirstName.value  = tr.dataset.firstName || "";
  editLastName.value   = tr.dataset.lastName  || "";
  editGrade.value      = String(tr.dataset.grade || "");
  editEmail.value      = tr.dataset.email     || "";
  editContact.value    = tr.dataset.contact   || "";
  populateSections(editGrade, editSection, tr.dataset.section || "");
  showEditModal();
}

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const currentId     = editCurrentStudentId.value;
  const editSubmitBtn = editForm.querySelector("[type='submit']");
  editSubmitBtn.disabled    = true;
  editSubmitBtn.textContent = "Updating...";
  try {
    const response = await fetch(`/user/update/${currentId}`, { method: "PATCH", body: new FormData(editForm) });
    let result;
    try { result = await response.json(); } catch(_) { result = { success: false, message: `Server error ${response.status}` }; }
    if (result.success) {
      hideEditModal();
      showToast("Student updated successfully.", "success");
      setTimeout(() => window.location.reload(), 1200);
    } else {
      showToast("Failed to update: " + (typeof result.message === "string" ? result.message : "Validation error."), "error");
    }
  } catch (error) {
    showToast("Something went wrong: " + error.message, "error");
  } finally {
    editSubmitBtn.disabled    = false;
    editSubmitBtn.textContent = "Update";
  }
});

// ------------------------------
// ADD MODAL
// ------------------------------
const openAddModalBtn  = document.getElementById("openAddModalBtn");
const addBackdrop      = document.getElementById("addBackdrop");
const closeAddModalBtn = document.getElementById("closeAddModalBtn");
const cancelAddBtn     = document.getElementById("cancelAddBtn");
const addForm          = document.getElementById("addForm");
const addGrade         = document.getElementById("addGrade");
const addSection       = document.getElementById("addSection");
const addSubmitBtn     = document.getElementById("addSubmitBtn");

const addFields = {
  studentId:            { inputId: "addStudentId",  errorId: "addStudentIdErr" },
  studentFirstName:     { inputId: "addFirstName",  errorId: "addFirstNameErr" },
  studentLastName:      { inputId: "addLastName",   errorId: "addLastNameErr"  },
  studentEmail:         { inputId: "addEmail",      errorId: "addEmailErr"     },
  studentContactNumber: { inputId: "addContact",    errorId: "addContactErr"   },
};

function showAddModal() { addBackdrop.classList.remove("hidden"); }
function hideAddModal() {
  addBackdrop.classList.add("hidden");
  addForm.reset();
  addSection.innerHTML = '<option value="">-- Select Section --</option>';
  Object.values(addFields).forEach(({ inputId, errorId }) => {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (inp && err) clearFieldError(inp, err);
  });
}

openAddModalBtn.addEventListener("click", showAddModal);
closeAddModalBtn.addEventListener("click", hideAddModal);
cancelAddBtn.addEventListener("click", hideAddModal);
addBackdrop.addEventListener("click", (e) => { if (e.target === addBackdrop) hideAddModal(); });
addGrade.addEventListener("change", () => { populateSections(addGrade, addSection); });

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  Object.values(addFields).forEach(({ inputId, errorId }) => {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (inp && err) clearFieldError(inp, err);
  });

  const idInput  = document.getElementById("addStudentId");
  const idErr    = document.getElementById("addStudentIdErr");
  const gradeErr = document.getElementById("addGradeErr");
  const sectErr  = document.getElementById("addSectionErr");

  let hasError = false;

  if (!/^\d{7}$/.test(idInput.value.trim())) {
    showFieldError(idInput, idErr, "Student ID must be exactly 7 numeric digits.");
    hasError = true;
  }
  if (!addGrade.value) {
    showFieldError(addGrade, gradeErr, "Please select a grade.");
    hasError = true;
  }
  if (!addSection.value) {
    showFieldError(addSection, sectErr, "Please select a section.");
    hasError = true;
  }
  if (hasError) return;

  addSubmitBtn.disabled    = true;
  addSubmitBtn.textContent = "Registering...";

  try {
    const request = await fetch("/user/registration", { method: "POST", body: new FormData(addForm) });
    let serverResponse;
    try { serverResponse = await request.json(); } catch(_) { serverResponse = { success: false, message: `Server error ${request.status}` }; }

    if (serverResponse.success === true) {
      hideAddModal();
      showToast("Student registered successfully.", "success");
      setTimeout(() => window.location.reload(), 1200);
    } else if (serverResponse.message && typeof serverResponse.message === "object") {
      const zod = serverResponse.message;
      let anyInline = false;
      Object.entries(addFields).forEach(([fieldName, { inputId, errorId }]) => {
        const errs = zod?.[fieldName]?._errors || [];
        if (errs.length) {
          const inp = document.getElementById(inputId);
          const err = document.getElementById(errorId);
          if (inp && err) { showFieldError(inp, err, errs[0]); anyInline = true; }
        }
      });
      if (!anyInline) showToast("Validation failed. Please check your inputs.", "error");
    } else {
      showToast("Registration failed: " + (typeof serverResponse.message === "string" ? serverResponse.message : "Unknown error."), "error");
    }
  } catch (error) {
    showToast("Something went wrong: " + error.message, "error");
  } finally {
    addSubmitBtn.disabled    = false;
    addSubmitBtn.textContent = "Register";
  }
});

// ------------------------------
// DELETE MODAL
// ------------------------------
const deleteBackdrop      = document.getElementById("deleteBackdrop");
const closeDeleteModalBtn = document.getElementById("closeDeleteModalBtn");
const cancelDeleteBtn     = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn    = document.getElementById("confirmDeleteBtn");
const deleteModalMessage  = document.getElementById("deleteModalMessage");

let pendingDeleteId = null;

function showDeleteModal(studentId) {
  pendingDeleteId = studentId;
  deleteModalMessage.textContent = `Student ${studentId} will be permanently deleted. This cannot be undone.`;
  deleteBackdrop.classList.remove("hidden");
}
function hideDeleteModal() {
  pendingDeleteId = null;
  deleteBackdrop.classList.add("hidden");
}

closeDeleteModalBtn.addEventListener("click", hideDeleteModal);
cancelDeleteBtn.addEventListener("click", hideDeleteModal);
deleteBackdrop.addEventListener("click", (e) => { if (e.target === deleteBackdrop) hideDeleteModal(); });

confirmDeleteBtn.addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  confirmDeleteBtn.disabled    = true;
  confirmDeleteBtn.textContent = "Deleting...";
  try {
    const result         = await fetch(`/user/delete/${pendingDeleteId}`, { method: "DELETE" });
    const serverResponse = await result.json();
    if (serverResponse.success === true) {
      hideDeleteModal();
      showToast("Student deleted successfully.", "success");
      setTimeout(() => window.location.reload(), 1200);
    } else {
      showToast("Cannot delete — this student has existing borrow or reservation records.", "error");
    }
  } catch (error) {
    showToast("Something went wrong: " + error.message, "error");
  } finally {
    confirmDeleteBtn.disabled    = false;
    confirmDeleteBtn.textContent = "Delete";
  }
});

// ------------------------------
// TABLE BUTTON CLICKS
// ------------------------------
if (table) {
  table.addEventListener("click", (e) => {
    const editBtn   = e.target.closest(".editBtn");
    const deleteBtn = e.target.closest(".deleteBtn");
    if (!editBtn && !deleteBtn) return;
    const tr = e.target.closest("tr");
    if (!tr) return;
    if (editBtn)   openEditModalFromRow(tr);
    if (deleteBtn) showDeleteModal(tr.dataset.studentId);
  });
}