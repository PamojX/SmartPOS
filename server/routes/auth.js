// server/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/init");
const { sendEmail } = require("../utils/mailer");

const router = express.Router();

const SECRET = process.env.JWT_SECRET || "my_secret_key";
const OWNER_EMAIL = process.env.OWNER_EMAIL; // must be set in .env
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// In-memory pending users (replace with DB if needed)
const pendingUsers = Object.create(null);

// ✅ Step 1: Request Access & Send OTP to Owner
router.post("/request-access", async (req, res) => {
  try {
    const { firstName, lastName, nic, phone, gender, address, role } = req.body;

    if (![firstName, lastName, nic, phone, gender, address, role].every(Boolean)) {
      return res.status(400).json({ error: "All fields required" });
    }
    if (!OWNER_EMAIL) {
      console.error("[AUTH] OWNER_EMAIL env missing");
      return res.status(500).json({ error: "Email is not configured on the server" });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Save to pending storage with timestamp for TTL
    pendingUsers[nic] = {
      firstName,
      lastName,
      nic,
      phone,
      gender,
      address,
      role,
      otp,
      createdAt: Date.now(),
    };

    // Send email
    await sendEmail({
      to: OWNER_EMAIL,
      subject: "SmartPOS — New Access Request (OTP)",
      html: `
        <h3>New Account Request</h3>
        <p><b>Name:</b> ${firstName} ${lastName}</p>
        <p><b>NIC:</b> ${nic}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Gender:</b> ${gender}</p>
        <p><b>Requested Role:</b> ${role}</p>
        <h2>OTP: ${otp}</h2>
        <p>Provide this OTP to the requester if you approve.</p>
      `,
      text: `New account request: ${firstName} ${lastName} (${nic}), role: ${role}. OTP: ${otp}`,
    });

    return res.json({ message: "OTP sent to owner for verification" });
  } catch (e) {
    console.error("[AUTH] OTP email error:", e.cause || e);
    return res.status(500).json({ error: e.message || "Failed to send OTP email" });
  }
});

// ✅ Step 2: Verify OTP & Create Account
router.post("/verify-otp", (req, res) => {
  const { nic, otp, username, password, confirmPassword } = req.body;

  const pending = pendingUsers[nic];
  if (!pending) return res.status(400).json({ error: "No pending request found" });

  // TTL check
  if (Date.now() - pending.createdAt > OTP_TTL_MS) {
    delete pendingUsers[nic];
    return res.status(400).json({ error: "OTP expired. Please request a new one." });
  }

  if (pending.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
  if (!username || !password || !confirmPassword)
    return res.status(400).json({ error: "Username and passwords are required" });
  if (password !== confirmPassword)
    return res.status(400).json({ error: "Passwords do not match" });

  // Check if username exists
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (row) return res.status(400).json({ error: "Username already exists" });

    // Hash password and insert
    bcrypt.hash(password, 10, (hashErr, hash) => {
      if (hashErr) return res.status(500).json({ error: "Hashing failed" });

      const userData = pendingUsers[nic];
      delete pendingUsers[nic];

      db.run(
        `INSERT INTO users (username, password, role, firstName, lastName, nic, phone, gender, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          username,
          hash,
          userData.role,
          userData.firstName,
          userData.lastName,
          userData.nic,
          userData.phone,
          userData.gender,
          userData.address,
        ],
        function (insertErr) {
          if (insertErr) return res.status(500).json({ error: "Insert failed" });

          const token = jwt.sign(
            { id: this.lastID, username, role: userData.role },
            SECRET,
            { expiresIn: "1h" }
          );
          res.json({ message: "Account created successfully", token, role: userData.role });
        }
      );
    });
  });
});

// ✅ Step 3: Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1h" });
    res.json({ token, role: user.role });
  });
});

module.exports = router;
