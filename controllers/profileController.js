// controllers/profileController.js
const db = require('../db');
const bcrypt = require('bcrypt');

exports.showProfile = async (req, res) => {
  const userId = req.session.user.userId;

  try {
    const [rows] = await db.promise().query(
      `SELECT u.userId, u.username, u.email, u.roleId,
              p.fullName, p.bio, p.phone, p.avatar, p.address
       FROM users u
       LEFT JOIN user_profiles p ON u.userId = p.userId
       WHERE u.userId = ?`,
      [userId]
    );

    if (rows.length === 0) {
      req.flash('error', 'User not found.');
      return res.redirect('/login');
    }

    res.render('profile', {
      title: 'My Profile',
      userProfile: rows[0]
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to load profile.');
    res.redirect('/');
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.session.user.userId;
  const { fullName, bio, phone, address, email, username } = req.body;
  const avatarFile = req.file ? req.file.filename : null;

  // ---- BASIC VALIDATION ----
  if (!fullName || !email || !phone || !address || !username) {
    req.flash('error', 'Full name, email, phone, address, and username are required.');
    return res.redirect('/profile');
  }

  const usernameRegex = /^[A-Za-z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    req.flash('error', 'Username must be 3–20 characters with letters, numbers, underscore only.');
    return res.redirect('/profile');
  }

  const phoneRegex = /^[0-9]{8,15}$/;
  if (!phoneRegex.test(phone)) {
    req.flash('error', 'Phone number must be 8–15 digits.');
    return res.redirect('/profile');
  }

  try {
    const [existingUsernames] = await db.promise().query(
      'SELECT userId FROM users WHERE username = ? AND userId <> ?',
      [username, userId]
    );

    if (existingUsernames.length > 0) {
      req.flash('error', 'This username is already taken.');
      return res.redirect('/profile');
    }

    await db
      .promise()
      .query(
        'UPDATE users SET email = ?, username = ? WHERE userId = ?',
        [email, username, userId]
      );

    const [profiles] = await db
      .promise()
      .query('SELECT * FROM user_profiles WHERE userId = ?', [userId]);

    if (profiles.length === 0) {
      await db.promise().query(
        `INSERT INTO user_profiles 
         (userId, fullName, bio, phone, address, avatar) 
         VALUES (?,?,?,?,?,?)`,
        [userId, fullName, bio || null, phone, address, avatarFile || null]
      );
    } else {
      const sql = avatarFile
        ? `UPDATE user_profiles SET fullName=?, bio=?, phone=?, address=?, avatar=? WHERE userId=?`
        : `UPDATE user_profiles SET fullName=?, bio=?, phone=?, address=? WHERE userId=?`;

      const params = avatarFile
        ? [fullName, bio || null, phone, address, avatarFile, userId]
        : [fullName, bio || null, phone, address, userId];

      await db.promise().query(sql, params);
    }

    req.session.user.email = email;
    req.session.user.username = username;

    req.flash('success', 'Profile updated successfully.');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating profile.');
    res.redirect('/profile');
  }
};


// -------------------------------
// FIXED CHANGE PASSWORD FUNCTION
// -------------------------------
exports.updatePassword = async (req, res) => {
  const userId = req.session.user.userId;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const [rows] = await db.promise().query(
      'SELECT password FROM users WHERE userId = ?',
      [userId]
    );

    if (rows.length === 0) {
      req.flash('error', 'User not found.');
      return res.redirect('/profile');
    }

    const currentHash = rows[0].password;

    // 1. Check correct current password
    const match = await bcrypt.compare(currentPassword, currentHash);
    if (!match) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/profile');
    }

    // 2. Prevent using the same password again
    const sameAsOld = await bcrypt.compare(newPassword, currentHash);
    if (sameAsOld) {
      req.flash('error', 'New password cannot be the same as the current password.');
      return res.redirect('/profile');
    }

    // 3. Confirm password check
    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match.');
      return res.redirect('/profile');
    }

    // 4. Password strength validation
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
      req.flash(
        'error',
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
      return res.redirect('/profile');
    }

    // 5. Hash + update password
    const newHash = await bcrypt.hash(newPassword, 10);

    await db
      .promise()
      .query('UPDATE users SET password = ? WHERE userId = ?', [
        newHash,
        userId
      ]);

    req.flash('success', 'Password updated successfully.');
    res.redirect('/profile');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating password.');
    res.redirect('/profile');
  }
};
