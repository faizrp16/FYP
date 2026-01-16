// controllers/authController.js
const bcrypt = require('bcrypt');
const db = require('../db');

// GET /register
exports.showRegister = (req, res) => {
  console.log("DEBUG: showRegister() CALLED");
  res.render('register', { title: 'Register' });
};

// POST /register
exports.register = async (req, res) => {
  console.log("DEBUG: POST /register hit");
  console.log("DEBUG: BODY =", req.body);

  const { username, email, password, confirmPassword, fullName } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    console.log("DEBUG: Missing required fields");
    req.flash('error', 'Please fill in all required fields.');
    return res.redirect('/register');
  }

  if (password !== confirmPassword) {
    console.log("DEBUG: Passwords do not match");
    req.flash('error', 'Passwords do not match.');
    return res.redirect('/register');
  }

  try {
    console.log("DEBUG: Checking existing user");
    const [existing] = await db
      .promise()
      .query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

    if (existing.length > 0) {
      console.log("DEBUG: User or email already exists");
      req.flash('error', 'Username or email already taken.');
      return res.redirect('/register');
    }

    console.log("DEBUG: Hashing password...");
    const hashed = await bcrypt.hash(password, 10);

    console.log("DEBUG: Inserting new user...");
    const [result] = await db
      .promise()
      .query(
        'INSERT INTO users (username, email, password, roleId) VALUES (?,?,?,1)',
        [username, email, hashed]
      );

    const userId = result.insertId;

    console.log("DEBUG: Creating user profile...");
    await db
      .promise()
      .query(
        'INSERT INTO user_profiles (userId, fullName, bio) VALUES (?,?,?)',
        [userId, fullName || null, null]
      );

    console.log("DEBUG: Registration complete, redirecting to login");
    req.flash('success', 'Registration successful. Please login.');
    res.redirect('/login');

  } catch (err) {
    console.error("DEBUG: ERROR in register():", err);
    req.flash('error', 'Something went wrong during registration.');
    res.redirect('/register');
  }
};

// GET /login
exports.showLogin = (req, res) => {
  console.log("DEBUG: showLogin() CALLED");
  res.render('login', { title: 'Login' });
};

// POST /login
exports.login = async (req, res) => {
  console.log("DEBUG: POST /login hit");
  console.log("DEBUG: BODY =", req.body);

  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    console.log("DEBUG: Missing fields for login");
    req.flash('error', 'Please fill in all fields.');
    return res.redirect('/login');
  }

  try {
    console.log("DEBUG: Fetching user from DB...");
    const [rows] = await db
      .promise()
      .query(
        `SELECT u.*, r.roleName
         FROM users u
         JOIN roles r ON u.roleId = r.roleId
         WHERE u.username = ? OR u.email = ?`,
        [emailOrUsername, emailOrUsername]
      );

    if (rows.length === 0) {
      console.log("DEBUG: No user found");
      req.flash('error', 'Invalid credentials.');
      return res.redirect('/login');
    }

    const user = rows[0];
    console.log("DEBUG: User found:", user.username);

    console.log("DEBUG: Comparing passwords...");
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log("DEBUG: Invalid password");
      req.flash('error', 'Invalid credentials.');
      return res.redirect('/login');
    }

    console.log("DEBUG: Password matched, creating session...");
    req.session.user = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName
    };

    req.flash('success', 'Logged in successfully.');

    if (user.roleId === 2) {
      console.log("DEBUG: Admin detected → redirecting to dashboard");
      return res.redirect('/admin/dashboard');
    }

    console.log("DEBUG: Normal user → redirecting to profile");
    return res.redirect('/profile');

  } catch (err) {
    console.error("DEBUG: ERROR in login():", err);
    req.flash('error', 'Something went wrong during login.');
    res.redirect('/login');
  }
};

// GET /logout
exports.logout = (req, res) => {
  console.log("DEBUG: logout() CALLED");
  req.session.destroy((err) => {
    if (err) {
      console.error("DEBUG: Error destroying session:", err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
