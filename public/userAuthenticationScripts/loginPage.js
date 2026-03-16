//
//
//

const loginBtn = document.getElementById("loginBtn");
const form = document.getElementById("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const request = await fetch("/librarian/login", {
    method: "POST",
    body: formData,
  });

  const serverResponse = await request.json();

  if (serverResponse.success === true) {
    window.location.href = serverResponse.redirectUrl;
  } else {
    alert("Login failed: " + serverResponse.message);
  }

  console.log(serverResponse);
});
