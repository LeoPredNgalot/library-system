//
//
//

const form = document.getElementById("form");

const registerBtn = document.getElementById("registerBtn");
const cancelBtn = document.getElementById(`cancelBtn`);

const gradeSelect = document.getElementById("studentGrade");
const sectionSelect = document.getElementById("studentSection");

// ------------------------------
// INLINE ERROR HELPERS
// ------------------------------
function showError(fieldId, message) {
  const el = document.getElementById(`err-${fieldId}`);
  const input = document.getElementById(fieldId);
  if (el) { el.textContent = message; el.style.display = 'block'; }
  if (input) input.style.borderColor = '#f87171';
}

function clearError(fieldId) {
  const el = document.getElementById(`err-${fieldId}`);
  const input = document.getElementById(fieldId);
  if (el) { el.textContent = ''; el.style.display = 'none'; }
  if (input) input.style.borderColor = '';
}

function clearAllErrors() {
  ['studentId','studentFirstName','studentLastName','studentGrade','studentSection','studentEmail'].forEach(clearError);
}

// Clear error on input
['studentId','studentFirstName','studentLastName','studentEmail'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => clearError(id));
});
gradeSelect?.addEventListener('change', () => clearError('studentGrade'));
sectionSelect?.addEventListener('change', () => clearError('studentSection'));

// ------------------------------
// GRADE AND SECTION SELECTION
// ------------------------------
const grade11Sections = [
  "HYDROGEN - ABM", "BORON - COMP. PROG.", "CARBON - CSS", "CARBON - EIM",
  "HYDROGEN - GAS", "NEON - HUMMS", "CARBON - ILL/ANM", "HELIUM - STEM",
];

const grade12Sections = [
  "PEARL - ABM", "AMETHYST - COMP. PROG.", "DIAMOND - CSS", "DIAMOND - EIM",
  "PEARL - GAS", "EMERALD - HUMMS", "DIAMOND - ILL/ANM", "GOLD - STEM",
];

if (!gradeSelect || !sectionSelect) {
  console.error("Grade or Section select element not found in the DOM.");
} else {
  gradeSelect.addEventListener("change", function () {
    sectionSelect.innerHTML = '<option value="">Select Section</option>';
    let sections = [];
    if (this.value === "11") sections = grade11Sections;
    if (this.value === "12") sections = grade12Sections;
    sections.forEach((section) => {
      const option = document.createElement("option");
      option.value = section;
      option.textContent = section;
      sectionSelect.appendChild(option);
    });
  });
});

// ------------------------------
// CANCEL BUTTON
// ------------------------------
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => window.history.back());
} else {
  console.warn("Cancel button not found.");
}

// ------------------------------
// FORM SUBMIT
// ------------------------------
if (!form) {
  console.error("Registration form not found in the DOM.");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const formData = new FormData(form);
    const user = Object.fromEntries(formData.entries());

    // ✅ Client-side validation with inline errors
    let hasError = false;

    if (!/^\d{7}$/.test(user.studentId)) {
      showError('studentId', 'Student ID must be exactly 7 numeric digits.');
      hasError = true;
    }

    if (!user.studentFirstName || user.studentFirstName.trim().length < 2) {
      showError('studentFirstName', 'First name must be at least 2 characters.');
      hasError = true;
    }

    if (!user.studentLastName || user.studentLastName.trim().length < 2) {
      showError('studentLastName', 'Last name must be at least 2 characters.');
      hasError = true;
    }

    if (!gradeSelect.value) {
      showError('studentGrade', 'Please select a grade.');
      hasError = true;
    }

    if (!sectionSelect.value) {
      showError('studentSection', 'Please select a section.');
      hasError = true;
    }

    if (!user.studentEmail) {
      showError('studentEmail', 'Email address is required.');
      hasError = true;
    }

    if (hasError) return; // ⛔ Stop if any errors

    console.log("THIS IS THE USER DETAILS", user);

    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";

    try {
      const request = await fetch("/user/registration", {
        method: "POST",
        body: formData,
      });

      if (!request.ok) {
        throw new Error(`Server returned status ${request.status}: ${request.statusText}`);
      }

      const serverResponse = await request.json();
      console.log("THIS IS THE SERVER'S RESPONSE", serverResponse);

      if (serverResponse.success === true) {
        alert("Registration Successful! Please wait for account approval.");
        form.reset();
        sectionSelect.innerHTML = '<option value="">Select Section</option>';
        clearAllErrors();
      } else {
        // ✅ Show server-side errors inline if available
        if (serverResponse.message && typeof serverResponse.message === 'object') {
          Object.entries(serverResponse.message).forEach(([field, val]) => {
            if (val?._errors?.[0]) showError(field, val._errors[0]);
          });
        } else {
          alert(`Registration Failed! ${serverResponse.message || "Unknown error. Please try again."}`);
        }
      }

    } catch (error) {
      console.error("Registration error:", error);
      alert(`Something went wrong. Please try again.\n\nDetails: ${error.message}`);
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = "Register";
    }
  });
}
