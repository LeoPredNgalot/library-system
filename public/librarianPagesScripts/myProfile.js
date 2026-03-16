const form = document.getElementById("form");
const emailInput = document.getElementById("email");
const contactNumberInput = document.getElementById("contactNumber");
const passwordInput = document.getElementById("password");

const librarianId = form.dataset.librarianId;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append("email", emailInput.value.trim());
    formData.append("contact_number", contactNumberInput.value.trim());

    if (passwordInput.value.trim() !== "") {
      formData.append("password", passwordInput.value.trim());
    }

    const request = await fetch(`/librarian/updateMyProfile/${librarianId}`, {
      method: "PUT",
      body: formData,
    });

    const response = await request.json();

    if (response.success === true) {
      alert(response.message || "Profile updated successfully.");
      passwordInput.value = "";
      window.location.href = "/librarian/profile/me";  // ✅ fixed route
    } else {
      alert(response.message || "Failed to update profile.");
    }
  } catch (error) {
    console.log("MY PROFILE SCRIPT ERROR:", error.message);
    alert("Something went wrong while updating your profile.");
  }
});