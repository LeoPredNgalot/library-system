//
//
//
const bcrypt = require('bcrypt');
const { pool } = require(`../../DB/pool`);
const { toTitleCase, toNumericOnly } = require("../formatUtils");

const { checkLibrarianEmail, checkLibrarianUserName } = require(
  `./librarian.service.read`,
);

const { getLibrarianById } = require(`./librarian.service.read`);

async function updateLibrarianInDb(payload) {
  const {
    librarianUserName,
    librarianEmail,
    librarianFirstName,
    librarianLastName,
    librarianContactNumber,
    id,
  } = payload;

  try {
    const librarianCurrentInfo = await getLibrarianById(payload);
    const updates = {};

    if (librarianUserName !== librarianCurrentInfo.user_name) {
      const userNameExists = await checkLibrarianUserName(payload);
      if (userNameExists) {
        return { success: false, message: `Username already exists` };
      }
      updates.user_name = librarianUserName;
    }

    if (librarianFirstName !== librarianCurrentInfo.first_name) {
      updates.first_name = toTitleCase(librarianFirstName);
    }

    if (librarianLastName !== librarianCurrentInfo.last_name) {
      updates.last_name = toTitleCase(librarianLastName);
    }

    if (librarianEmail !== librarianCurrentInfo.email) {
      const emailExist = await checkLibrarianEmail(payload);
      if (emailExist) {
        return { success: false, message: `Email already exists` };
      }
      updates.email = librarianEmail;
    }

    if (librarianContactNumber !== librarianCurrentInfo.contact_number) {
      updates.contact_number = librarianContactNumber;
    }

    if (Object.keys(updates).length > 0) {
      const query = `UPDATE library_staffs SET ? WHERE id = ?`;
      await pool.query(query, [updates, id]);
      return { success: true, message: "Librarian updated successfully" };
    }

    return { success: true, message: "No changes detected" };

  } catch (error) {
    console.log(`UPDATE LIBRARIAN ERROR: ${error.message}`);
    throw error;
  }
}




async function updateMyProfileService(payload) {
  const { email, contact_number, password, librarianId } = payload;

  try {
    const librarianCurrentInfo = await getLibrarianById({ id: librarianId });

    const updates = [];
    const values = [];

    if (email && email.trim() !== "" && email !== librarianCurrentInfo.email) {
      const emailExists = await checkLibrarianEmail({
        librarianEmail: email,
      });

      if (emailExists) {
        return {
          success: false,
          message: "Email already exists.",
        };
      }

      updates.push("email = ?");
      values.push(email);
    }

    if (
      contact_number &&
      contact_number.trim() !== "" &&
      contact_number !== librarianCurrentInfo.contact_number
    ) {
      updates.push("contact_number = ?");
      values.push(contact_number);
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return {
        success: true,
        message: "Profile updated successfully.",
      };
    }

    const query = `
      UPDATE library_staffs
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    values.push(librarianId);

    await pool.query(query, values);

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.log(`UPDATE MY PROFILE SERVICE ERROR: ${error.message}`);
    throw error;
  }
}


module.exports = { updateLibrarianInDb,  updateMyProfileService };
