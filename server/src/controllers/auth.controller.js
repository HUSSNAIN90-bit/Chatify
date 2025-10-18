import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import e from "express";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import "dotenv/config";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, phoneNumber, region, password } = req.body;
  try {
    if (!fullName || !email || !password || !region || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (region === "israel")
      return res.status(400).json({ message: "Israel is not allowed" });
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ phoneNumber });
    const userEmail = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "PhoneNumber already in use" });
    }
    if (userEmail) {
      return res.status(400).json({
        message: "Email already Exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      phoneNumber,
      region,
      password: hashedPassword,
    });

    if (newUser) {
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        region: newUser.region,
        profilePic: newUser.profilePic || "",
      });

      // Send welcome email
      try {
        await sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          process.env.CLIENT_URL
        );
      } catch (error) {}
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    console.error("Error in Signup controller", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { phoneNumber, region, password } = req.body;

  // 1️⃣ Basic validation
  if (!password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 2️⃣ Find user
    const { phoneNumber, password, region } = req.body;

    const user = await User.findOne({ phoneNumber, region });
    if (!user) {
      return res
        .status(400)
        .json({ message: "No user found for this country and number" });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid phone number or password" });
    }

    // 4️⃣ Generate JWT token and set cookie
    generateToken(user._id, res);

    // 5️⃣ Send response
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      region: user.region || "", // ✅ include region (from signup)
      profilePic: user.profilePic || "",
    });
  } catch (err) {
    console.error("Error in Login controller:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }
    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
