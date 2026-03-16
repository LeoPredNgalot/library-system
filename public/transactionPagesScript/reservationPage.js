//
//
//
const form = document.getElementById("reserveForm");
const bookInput = document.getElementById("bookTitle");
const bookIdInput = document.getElementById("bookId");
const datalist = document.getElementById("booksList");
const errorMsg = document.getElementById("errorMsg");

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modal = document.getElementById("reservationModal");

const gradeFilter = document.getElementById("gradeFilter");
const sectionFilter = document.getElementById("sectionFilter");

const grade11Sections = ["Mercury", "Venus", "Earth", "Mars", "Jupiter"];
const grade12Sections = ["Hydrogen", "Oxygen", "Gold", "Silver"];

function populateSections(selectedGrade, selectedSection = "") {
  sectionFilter.innerHTML = `<option value="">All Sections</option>`;

  let sections = [];

  if (selectedGrade === "11") {
    sections = grade11Sections;
  } else if (selectedGrade === "12") {
    sections = grade12Sections;
  } else {
    sections = [...grade11Sections, ...grade12Sections];
  }

  sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;

    if (section === selectedSection) {
      option.selected = true;
    }

    sectionFilter.appendChild(option);
  });
}

if (gradeFilter && sectionFilter) {
  populateSections(gradeFilter.value, sectionFilter.dataset.selected || "");

  gradeFilter.addEventListener("change", () => {
    populateSections(gradeFilter.value, "");
  });
}

openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

document.querySelectorAll(".cancelBtn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const reservationId = btn.dataset.id;

    if (!confirm("Cancel this reservation?")) return;

    try {
      const request = await fetch(
        `/transaction/reservation/cancel/${reservationId}`,
        { method: "POST" },
      );

      const response = await request.json();

      if (response.success === true) {
        alert("Reservation cancelled successfully.");
        location.reload();
      } else {
        alert(`Cancel failed: ${response.message}`);
      }
    } catch (err) {
      alert(`Cancel failed: ${err.message}`);
    }
  });
});

document.querySelectorAll(".fulfillBtn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const reservationId = btn.dataset.id;

    const confirmFulfill = confirm("Fulfill this reservation?");
    if (!confirmFulfill) return;

    const request = await fetch(
      `/transaction/reservation/fulfill/${reservationId}`,
      { method: "POST" },
    );

    const response = await request.json();

    if (response.success) {
      alert("Reservation fulfilled successfully.");
      location.reload();
    } else {
      alert(`Fulfill failed: ${response.message}`);
    }
  });
});

//---------------------------------------
bookInput.addEventListener("input", () => {
  const inputValue = bookInput.value.trim();
  const options = Array.from(datalist.options);

  const matchedOption = options.find((option) => option.value === inputValue);

  if (matchedOption) {
    bookIdInput.value = matchedOption.dataset.bookId;
    errorMsg.style.display = "none";
  } else {
    bookIdInput.value = "";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputValue = bookInput.value.trim();
  const options = Array.from(datalist.options);

  const matchedOption = options.find((option) => option.value === inputValue);

  if (!matchedOption) {
    errorMsg.style.display = "block";
    bookInput.focus();
    return;
  }

  errorMsg.style.display = "none";
  bookIdInput.value = matchedOption.dataset.bookId;

  const formData = new FormData(form);

  const request = await fetch(`/transaction/reservation`, {
    method: "POST",
    body: formData,
  });

  const response = await request.json();

  if (response.success === true) {
    alert("RESERVATION SUCCESS");
    form.reset();
    bookIdInput.value = "";
  } else {
    alert(`RESERVATION FAILED: ${response.message}`);
  }
});



