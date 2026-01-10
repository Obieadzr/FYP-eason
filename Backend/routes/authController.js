import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    console.log("Register request body:", req.body);

    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) 
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword, role });

    const savedUser = await newUser.save();
    console.log("User saved:", savedUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Fetch fresh user from DB (exclude password)
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ 
  token, 
  user: { 
    id: user._id, 
    fullName: user.fullName, 
    role: user.role ,
    verified: user.verified
  } 
});

  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ error: error.message });
  }
};
