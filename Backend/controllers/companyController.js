import User from "../models/User.js";
import Company from "../models/Company.js";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Invite a user to the company
export const inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (req.user.companyRole !== 'admin') {
      return res.status(403).json({ message: "Only admins can invite members." });
    }

    if (!['admin', 'approver', 'buyer'].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Create invite token (expires in 24h)
    const token = jwt.sign(
      { email, companyId: req.user.companyId, companyRole: role, action: 'invite' },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${token}`;
    
    console.log(`\n=========================================`);
    console.log(`✉️ [DEV MODE] INVITE LINK FOR ${email}: ${inviteLink}`);
    console.log(`=========================================\n`);

    res.json({ message: "Invite sent successfully.", inviteLink });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Accept invitation
export const acceptInvite = async (req, res) => {
  try {
    const { token, password, firstName, lastName } = req.body;
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invite link is invalid or has expired. Please ask your admin to re-send the invite." });
    }

    if (decoded.action !== 'invite') return res.status(400).json({ message: "Invalid token type." });

    const existing = await User.findOne({ email: decoded.email });
    if (existing) return res.status(400).json({ message: "User already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const company = await Company.findById(decoded.companyId);
    
    const newUser = await User.create({
      firstName,
      lastName,
      email: decoded.email,
      password: hashedPassword,
      role: company.type, 
      companyId: company._id,
      companyRole: decoded.companyRole,
      verified: true,
      isEmailVerified: true
    });

    res.status(201).json({ message: "Account created successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const listMembers = async (req, res) => {
  try {
    if (!req.user.companyId) {
      const self = await User.findById(req.user.id).select("-password");
      return res.json({ members: [self] });
    }
    const members = await User.find({ companyId: req.user.companyId }).select("-password");
    res.json({ members });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const changeRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    if (req.user.companyRole !== 'admin') return res.status(403).json({ message: "Only admins can change roles." });

    const targetUser = await User.findOne({ _id: userId, companyId: req.user.companyId });
    if (!targetUser) return res.status(404).json({ message: "User not found in your company." });
    
    if (targetUser.isCompanyOwner) return res.status(403).json({ message: "Cannot change the role of the company owner." });
    
    targetUser.companyRole = newRole;
    await targetUser.save();
    
    res.json({ message: "Role updated." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.companyRole !== 'admin') return res.status(403).json({ message: "Only admins can remove members." });

    const targetUser = await User.findOne({ _id: userId, companyId: req.user.companyId });
    if (!targetUser) return res.status(404).json({ message: "User not found." });

    if (targetUser.isCompanyOwner) return res.status(403).json({ message: "Cannot remove the company owner." });
    if (targetUser._id.toString() === req.user.id) return res.status(400).json({ message: "You cannot remove yourself." });

    await User.findByIdAndDelete(userId);
    res.json({ message: "User removed from company." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getApprovalQueue = async (req, res) => {
  try {
    if (req.user.companyRole === 'buyer') return res.status(403).json({ message: "Buyers cannot view the approval queue." });
    
    const orders = await Order.find({ company: req.user.companyId, status: 'pending_approval' })
      .populate('user', 'firstName lastName email')
      .populate('items.product');
      
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
