//
//
//
const form = document.getElementById(`form`);

form.addEventListener(`submit`, async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const librarian = Object.fromEntries(formData.entries());

  console.log(librarian);

  // ✅ Password Validation - minimum 6 characters only
  if (librarian.password.length < 6) {
    alert(`Password must be at least 6 characters long.`);
    return; // ⛔ Stop submission
  }

  const request = await fetch("/librarian/register", {
    method: "POST",
    body: formData,
  });

  const respond = await request.json();

  console.log(`THIS IS THE SERVER'S RESPOND `);
  console.log(respond);

  if (respond.success) {
    alert(`REGISTRATION SUCCESSFULL`);
  } else {
    alert(`REGISTRATION FAILED: \n REASON: ${respond.message}`);
  }
});