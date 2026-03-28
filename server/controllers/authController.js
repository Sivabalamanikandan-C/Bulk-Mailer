import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// ================= VERIFY TOKEN =================
export const verifyToken = async (req, res) => {
  try {
    // protect middleware already verified token and set req.user
    res.status(200).json({ 
      success: true, 
      user: req.user 
    });
  } catch (error) {
    res.status(401).json({ message: "Token verification failed" });
  }
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "secretkey";
    const token = jwt.sign(
      { id: user._id },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= FORGOT PASSWORD =================
// import nodemailer from "nodemailer";

// export const forgotPassword = async (req, res) => {
//   try {

//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         message: "Email is required"
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString("hex");

//     // Hash token for DB security
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     user.resetToken = hashedToken;
//     user.resetTokenExpire = Date.now() + 10 * 60 * 1000;

//     await user.save();

//     // Reset link
//     const resetLink =
//       `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

//     // Email transporter
//     const transporter = nodemailer.createTransporter({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

//     // Email template
//     const mailOptions = {
//       from: `"Bulk Mail App" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: "Reset Your Password",
//       html: `
//         <div style="font-family: Arial; padding:20px">
//           <h2>Password Reset</h2>
//           <p>You requested to reset your password.</p>
//           <p>Click the button below:</p>

//           <a href="${resetLink}"
//             style="
//               background:#4CAF50;
//               color:white;
//               padding:10px 20px;
//               text-decoration:none;
//               border-radius:5px;
//               display:inline-block;
//             ">
//             Reset Password
//           </a>

//           <p style="margin-top:20px;">
//             This link will expire in 10 minutes.
//           </p>
//         </div>
//       `
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({
//       success: true,
//       message: "Password reset email sent"
//     });

//   } catch (error) {

//     console.error("Forgot Password Error:", error);

//     res.status(500).json({
//       message: "Server error"
//     });

//   }
// };

// ================= RESET PASSWORD =================
// export const resetPassword = async (req, res) => {

//   try {

//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         message: "User not found"
//       });
//     }

//     const salt = await bcrypt.genSalt(10);

//     user.password = await bcrypt.hash(password, salt);

//     await user.save();

//     res.json({
//       message: "Password updated successfully"
//     });

//   } catch (error) {

//     res.status(500).json({
//       message: "Server error"
//     });

//   }
// };
