//
//
//

const updateBtn = document.getElementById("updateBtn");
const backBtn = document.getElementById("backBtn");

const form = document.getElementById("form");

const gradeSelect = document.getElementById("studentGrade");
const sectionSelect = document.getElementById("studentSection");

//------------------------------
// GRADE AND SECTION SELECTION
//------------------------------
const grade11Sections = ["Mercury", "Venus", "Earth", "Mars", "Jupiter"];
const grade12Sections = ["Hydrogen", "Oxygen", "Gold", "Silver"];

gradeSelect.addEventListener("change", function () {
  sectionSelect.innerHTML = '<option value="">-- Select Section --</option>';

  let sections = [];

  if (this.value === "11") {
    sections = grade11Sections;
  }

  if (this.value === "12") {
    sections = grade12Sections;
  }

  sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    sectionSelect.appendChild(option);
  });
});

form.addEventListener("submit", async (e) => {
  //
  e.preventDefault();
  const studentId = form.dataset.studentId;

  const formData = new FormData(form);

  console.log(`STUDENT ID: ${studentId}`);

  const student = Object.fromEntries(formData.entries());
  console.log(student);

  const serverResponse = await fetch(`/user/update/${studentId}`, {
    method: `PATCH`,
    body: formData,
  });

  const result = await serverResponse.json();

  if (result.success === true) {
    alert(`User has been successfully updated.`);
    window.location.href = `/user/view-all-users`;
  } else {
    alert(`There was a problem updating the user: ${result.message}`);
  }
});

backBtn.addEventListener(`click`, () => {
  //
  //
  window.location.href = `/user/view-all-users`;
});
