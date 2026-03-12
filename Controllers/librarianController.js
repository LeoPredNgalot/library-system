const { registerLibrarianToDb, resetLibrarianPasswordService } = require(
  `../Services/librarian.service.Folder/librarian.service.create`,
);

const {
  getAllLibrariansFromDb,
  getLibrarianById,
} = require("../Services/librarian.service.Folder/librarian.service.read");

const {
  deleteLibrarianFromDb,
} = require("../Services/librarian.service.Folder/librarian.service.delete");

const { authenticateStaff } = require(
  `../Services/librarian.service.Folder/librarian.service.authenticate`,
);

const { updateLibrarianInDb, updateMyProfileService } = require(
  `../Services/librarian.service.Folder/librarian.service.update`,
);

//------------------------
// CREATE
//------------------------

async function librarianRegistrationForm(req, res) {
  res.render(`librarianViews/librarianRegistration`, {});
}

async function registerLibrarian(req, res) {
  try {
    const serviceResult = await registerLibrarianToDb(req.body);

    if (!serviceResult.success) {
      return res.status(400).json(serviceResult);
    }

    return res.status(201).json(serviceResult);
  } catch (error) {
    console.error("REGISTER LIBRARIAN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
}

async function viewAllLibrarians(req, res) {
  console.log(`VIEW ALL LIBRARIAN REQ WAS RECEIVED`);

  try {
    const result = await getAllLibrariansFromDb();
    console.log(result);

    res.render(`librarianViews/viewAllLibrarians`, { librarians: result });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

//------------------------
// DELETE
//------------------------
async function deleteLibrarian(req, res) {
  console.log(`DELETE LIBRARIAN REQ WAS RECEIVED`);

  try {
    const { id } = req.params;
    await deleteLibrarianFromDb(id);
    res.json({ success: true, message: "Librarian deleted successfully." });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

//-----------------------------
// SEND LOGIN FORM
//----------------------------
async function staffLoginForm(req, res) {
  res.render("userAuthentication/loginPage", {});
}

async function staffLogin(req, res) {
  try {
    const result = await authenticateStaff(req.body);

    if (result.success === true) {
      req.session.user = {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
      };

      if (result.user.role === "admin") {
        res.json({ success: true, redirectUrl: "/librarian/admin/homepage" });
      } else if (result.user.role === "librarian") {
        res.json({ success: true, redirectUrl: "/librarian/homepage" });
      }
    } else {
      res.json({
        success: false,
        message: "Invalid username or password.",
      });
    }
  } catch (error) {
    console.log(`Librarian Controller: ERROR @ staffLogin()`);
    res.json({ success: false, message: error.message });
  }
}

//-----------------------------
// SEND HOMEPAGE
//----------------------------

async function librarianHomePage(req, res) {
  res.render("librarianViews/librarianHomepage.ejs", {
    activeNav: "home",
    librarian: req.session.user, // ✅ passes logged-in user to librarian sidebar
  });
}

async function adminHomepage(req, res) {
  res.render("adminViews/adminHomepage.ejs", {
    activeNav: "home",
    user: req.session.user, // ✅ passes logged-in user to admin sidebar
  });
}

async function updateLibrarian(req, res) {
  req.body.id = Number(req.params.id);

  try {
    const updateResult = await updateLibrarianInDb(req.body);
    if (updateResult.success === true) {
      res.status(200).json({ success: true, message: `Update successful` });
    } else {
      res.status(201).json({
        success: false,
        message: updateResult.message,
      });
    }
  } catch (error) {
    console.log(`UPDATE_LIBRARIAN() ERROR: ${error.message}`);
  }
}

//------------------------
// MY PROFILE
//------------------------
async function myProfile(req, res) {
  try {
    if (!req.session.user) {
      return res.redirect("/librarian/login");
    }

    const result = await getLibrarianById({ id: req.session.user.id });

    if (!result) {
      return res.send("Profile not found.");
    }

    res.render("librarianViews/librarian.MyProfile.ejs", {
      librarian: result,
    });
  } catch (error) {
    console.log(`MYPROFILE() ERROR: ${error.message}`);
    res.send("SOMETHING WENT WRONG");
  }
}

// ----------------------------
//  UPDATING THEIR PERSONAL DETAILS
// ----------------------------
async function updateMyProfile(req, res) {
  try {
    const payload = {
      ...req.body,
      librarianId: Number(req.params.id),
    };

    const result = await updateMyProfileService(payload);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log(`UPDATE MY PROFILE ERROR: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
}

//------------------------
// PASSWORD RESET
//------------------------

async function resetLibrarianPassword(req, res) {
  try {
    const id = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const result = await resetLibrarianPasswordService(id, newPassword.trim());

    if (!result.success) return res.status(400).json(result);

    return res.status(200).json(result);
  } catch (error) {
    console.error("RESET LIBRARIAN PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Reset password failed. Please try again later.",
    });
  }
}

//------------------------
// LOGOUT
//------------------------

async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ success: false, message: "Logout failed." });
    }
    res.clearCookie("library-session");
    res.redirect("/librarian/login");
  });
}

//------------------------
// ADMIN SETTINGS
//------------------------

const adminSettings = async (req, res) => {
  try {
    const embed = req.query.embed === 'true';
    res.render('adminViews/adminSettings', { embed });
  } catch (error) {
    console.error('Admin settings error:', error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  librarianHomePage,
  librarianRegistrationForm,
  registerLibrarian,
  viewAllLibrarians,
  deleteLibrarian,
  staffLoginForm,
  staffLogin,
  adminHomepage,
  updateLibrarian,
  resetLibrarianPassword,
  myProfile,
  logout,
  updateMyProfile,
  adminSettings,
};