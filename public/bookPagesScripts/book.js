//
//
// LATER: RENAME THIS TO ADD BOOK.JS
const bookTitle = document.getElementById("bookTitle");
const bookAuthor = document.getElementById("bookAuthor");
const bookIsbn = document.getElementById("bookIsbn");
const bookGenre = document.getElementById("bookGenre");
const bookpublisher = document.getElementById("bookPublisher");
const bookLocation = document.getElementById("bookLocation");

const cancelBtn = document.getElementById("cancelBtn");

const form = document.getElementById("form");
const notification = document.getElementById("notification");

const bookCountViewer = document.getElementById("bookCountContainer");
const addBookIdBtn = document.getElementById("addBookIdBtn");

// REMOVE THIS LATER
// MU INCREMENT NI CYA IF MAG CREATE TAG
// NEW BOOK COPY
let bookQty = 0;

const bookIdSectionScrollArea = document.getElementById(
  "bookIdSectionScrollArea"
);

//---------
// HELPERS
//---------

// TO COUNT THE NUMBER OF BOOK COPY ID INPUTS
function getCopyIdCount() {
  const x = bookIdSectionScrollArea.querySelectorAll(
    'input[name="bookCopyIds[]"]'
  );
  return x.length;
}

// ---------------------------
// function openConfirmModal({ title, message, onConfirm }) {
//   modalTitle.textContent = title;
//   modalMessage.textContent = message;

//   modal.classList.remove("hidden");

//   Clean previous handler
//   modalConfirmBtn.onclick = null;

//   modalConfirmBtn.onclick = async () => {
//     modalConfirmBtn.disabled = true;

//     try {
//       await onConfirm();
//     } finally {
//       modalConfirmBtn.disabled = false;
//       modal.classList.add("hidden");
//     }
//   };
// }

// modalCancelBtn.addEventListener("click", () => {
//   modal.classList.add("hidden");
// });

// modal.addEventListener("click", (e) => {
//   if (e.target === modal) {
//     modal.classList.add("hidden");
//   }
// });

// -----------------------------

// --------WHEN THE SUBMIT BTN IS CLICKED THIS WILL RUN---------

form.addEventListener("submit", (e) => {
  e.preventDefault();

  openConfirmModal({
    title: "Confirm book addition",
    message: "Are you sure you want to add this book?",

    // THIS FUNCTION CAN BE REFACTOR

    onConfirm: async () => {
      const formData = new FormData(form);

      const request = await fetch("/book/add", {
        method: "POST",
        body: formData,
      });

      const response = await request.json();
      console.log(`THIS IS THE RESPONSE IN JSON FORM`);
      console.log(response);
      if (response.success) {
        console.log(`----------SUCESS`);
        console.log(response.message);
        console.log(response.failedCopies);
      } else {
        console.log(`----------FAILED TEMPRORARILY`);
        console.log(response.message);
      }

      // I NEED TO REFRESH THE PAGE AFTER SUBMISSION
      // OR THE FORM CLEARED

      const book = Object.fromEntries(formData.entries());
      console.log(`THIS IS FE, THIS IS OUR BOOK`);
      console.log(book);
    },
  });
});

//-----------------THIS IS MY OWN CODE

// TEMPORARY COMMENTING THIS OUT

// form.addEventListener("submit", async (e) => {
//   //
//   e.preventDefault();

//   const formData = new FormData(form);

//   let response;
//   try {
//     response = await fetch("http://localhost:8000/book/add", {
//       method: "POST",
//       body: formData,
//     });
//   } catch (error) {
//     console.log(`FETCH ERROR MESSAGE: `);
//     console.log(error.message);
//   }

//   const result = await response.json();
//   console.log(`THIS IS THE RESULT IN JSON FORM`);
//   console.log(result);
//   if (result.success) {
//     console.log("SUBMISSION SUCCESSFUL");
//     console.log(`RESULT MESSAGE: ${result.message}`);
//   } else {
//     // IF MU ERROR MAN GAE WE HAVE TO IDENTIFY
//     // IF UNSA NGA ERROR, TITLE BA OR ISBN OR BOTH
//     // WE NEED TO  CHECK THE ERROR PROPERTY
//     // LIKE FOR SUMFIN LIKE title exist, isbn exist

//     console.log("SUBMISSION FAILED");
//     console.log(result.error);

//     if (result.error.isbnExist && result.error.titleExist) {
//       console.log(`TITLE & ISBN EXIST`);
//     } else if (result.error.isbnExist) {
//       console.log(`ISBN EXIST`);
//     } else {
//       console.log(`TITLE EXIST`);
//     }
//   }

//   //-------THIS IS FOR THE CONSOLE LOG ONLY -----
//   const book = Object.fromEntries(formData.entries());
//   console.log(`THIS IS FE, THIS IS OUR BOOK`);
//   console.log(book);
// });

cancelBtn.addEventListener("click", () => {
  window.location.href = "/book/get-all-books";
});

//--------------
// DOM CREATION
// -------------

function createBookIdInput() {
  const wrapper = document.createElement("span");
  wrapper.classList.add("scrollAreaSpan");

  // REMEMBER, THE NAME 'bookCopyIds[]'
  // IS TIED TO SCHEME, CONTROLLER, SERVICES FILES
  const input = document.createElement("input");
  input.name = "bookCopyIds[]";
  input.required = true;
  input.placeholder = "Book Copy ID must at least be 4  characters";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.innerText = "remove";

  // ADDING EVENLIS TO REMOVE BTN
  removeBtn.addEventListener("click", () => {
    wrapper.remove();
    bookCountViewer.innerText = getCopyIdCount();
  });

  wrapper.appendChild(input);
  wrapper.appendChild(removeBtn);

  bookIdSectionScrollArea.appendChild(wrapper);

  bookCountViewer.innerText = getCopyIdCount();
}

addBookIdBtn.addEventListener("click", () => {
  createBookIdInput();
});
