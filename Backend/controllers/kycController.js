import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

const getAnthropicClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

// =======================
// WHOLESALER ENDPOINTS
// =======================

export const submitKyc = async (req, res) => {
  try {
    if (req.user.role !== 'wholesaler') {
      return res.status(403).json({ message: "Only wholesalers can submit KYC" });
    }

    const { panDocument, businessLicense } = req.files;
    const { shopName, panNumber, address, phone } = req.body;

    if (!panDocument || !businessLicense) {
      return res.status(400).json({ message: "Both PAN and Business License are required." });
    }

    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.panDocument = `/uploads/kyc/${panDocument[0].filename}`;
    user.businessLicense = `/uploads/kyc/${businessLicense[0].filename}`;
    
    // Save business profile details alongside the document upload
    if (shopName) user.shopName = shopName;
    if (panNumber) user.panNumber = panNumber;
    if (address) user.address = address;
    if (phone) user.phone = phone;

    user.panVerificationStatus = 'pending';
    user.licenseVerificationStatus = 'pending';
    user.kycSubmittedAt = new Date();

    await user.save();
    res.status(200).json({ message: "KYC documents submitted successfully." });
  } catch (error) {
    console.error("submitKyc error:", error);
    res.status(500).json({ message: "Failed to submit KYC", error: error.message });
  }
};

export const getKycStatus = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('panVerificationStatus licenseVerificationStatus panAiResult licenseAiResult rejectionReason kycSubmittedAt panAiScore licenseAiScore panDocument businessLicense verified');
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to load KYC status" });
  }
};

// =======================
// ADMIN ENDPOINTS
// =======================

export const getKycQueue = async (req, res) => {
  try {
    const users = await User.find({ 
      role: 'wholesaler', 
      panVerificationStatus: { $in: ['pending', 'ai_checked', 'rejected', 'not_submitted'] } 
    }).sort({ kycSubmittedAt: -1 }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load KYC queue" });
  }
};

// Helper to convert local file to base64
const fileToBase64 = (filePath) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return null;
  const buffer = fs.readFileSync(fullPath);
  const ext = path.extname(fullPath).toLowerCase().replace('.', '');
  // Mapping extension to anthropic mediatype
  let mediaType = "image/jpeg";
  if (ext === "png") mediaType = "image/png";
  if (ext === "webp") mediaType = "image/webp";
  if (ext === "pdf") mediaType = "application/pdf";
  return { data: buffer.toString('base64'), mediaType };
};

export const runAiCheck = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.panDocument || !user.businessLicense) {
      return res.status(400).json({ message: "User has not uploaded both documents yet." });
    }

    const anthropic = getAnthropicClient();
    
    // MOCK RESPONSES IF NO API KEY — but do real validation on declared data
    if (!anthropic) {
      console.warn("MOCKING CLAUDE AI CALL: Missing ANTHROPIC_API_KEY — running rule-based validation instead.");

      const issues = [];
      let confidenceScore = 85;
      
      // --- PAN Validation ---
      const declaredPan = user.panNumber?.trim() || "";
      const panValid = /^\d{9}$/.test(declaredPan); // Nepal PAN: exactly 9 digits
      
      if (!declaredPan) {
        issues.push("No PAN number declared in profile.");
        confidenceScore -= 25;
      } else if (!panValid) {
        issues.push(`PAN number "${declaredPan}" is not a valid Nepal PAN (must be exactly 9 digits, numeric only).`);
        confidenceScore -= 30;
      }
      
      // --- Name consistency check (basic) ---
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const panNameMatch = panValid; // Without real AI we can't extract from image, so assume match only if valid format
      
      // --- Business info checks ---
      if (!user.shopName || user.shopName.trim().length < 3) {
        issues.push("Shop name is missing or too short.");
        confidenceScore -= 10;
      }
      if (!user.address || user.address.trim().length < 5) {
        issues.push("Business address is incomplete.");
        confidenceScore -= 5;
      }
      if (!user.phone || !/^(\+977|977|0)?[1-9]\d{7,9}$/.test(user.phone.replace(/[\s-]/g, ''))) {
        issues.push("Phone number does not look like a valid Nepali number.");
        confidenceScore -= 5;
      }

      // --- License validity (can't actually read image without AI) ---
      const licenseValid = true; // Human admin must verify visually
      const suspiciousFlag = confidenceScore < 50 || issues.length >= 3;
      const finalScore = Math.max(0, Math.min(100, confidenceScore));
      
      let recommendation = "approve";
      if (finalScore < 50 || !panValid) recommendation = "reject";
      else if (finalScore < 70 || issues.length > 1) recommendation = "manual_review";

      const mockResult = {
        panValid,
        panNameMatch,
        panNumberExtracted: panValid ? declaredPan : `INVALID: "${declaredPan}" (expected 9 digits)`,
        licenseValid,
        licenseRegistrationExtracted: "Manual review required",
        licenseExpiryDate: "Admin must verify physically",
        suspiciousFlag,
        confidenceScore: finalScore,
        issues,
        recommendation,
        note: "This analysis is rule-based (no Anthropic API key). Add ANTHROPIC_API_KEY to .env for Claude Vision document scanning."
      };

      user.panAiResult = mockResult;
      user.licenseAiResult = mockResult;
      user.panVerificationStatus = 'ai_checked';
      user.licenseVerificationStatus = 'ai_checked';
      user.panAiScore = finalScore;
      user.licenseAiScore = finalScore;
      await user.save();
      return res.status(200).json({ message: "Rule-based AI check completed", result: mockResult });
    }

    const panFile = fileToBase64(user.panDocument);
    const licFile = fileToBase64(user.businessLicense);

    if (!panFile || !licFile) {
       return res.status(400).json({ message: "Missing document physical files on disk." });
    }

    // PDF not supported by Anthropic Vision in standard blocks yet without strict extraction, but assuming images for now. If PDF, Anthropic supports it in beta.
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: "You are a KYC verification assistant for eAson, a wholesale marketplace in Nepal. You will be shown images of business documents. Analyze them carefully and return ONLY a valid JSON object with no markdown, no explanation. Be strict but fair — flag anything suspicious but note uncertainty.",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze these KYC documents for a wholesaler named ${user.firstName} ${user.lastName} applying with PAN ${user.panNumber || 'not provided'}. Document 1 is PAN card. Document 2 is Business license. Check: 1) Nepal PAN card format validity (9 digits, matches name), 2) Business license authenticity (IRD letterhead, valid date), 3) Any signs of tampering, 4) Name consistency. Return JSON: { "panValid": boolean, "panNameMatch": boolean, "panNumberExtracted": string, "licenseValid": boolean, "licenseRegistrationExtracted": string, "licenseExpiryDate": string, "suspiciousFlag": boolean, "confidenceScore": number, "issues": string[], "recommendation": string }` },
            { type: "image", source: { type: "base64", media_type: panFile.mediaType, data: panFile.data } },
            { type: "image", source: { type: "base64", media_type: licFile.mediaType, data: licFile.data } }
          ]
        }
      ]
    });

    const aiText = message.content[0].text;
    let resultJSON;
    try {
      resultJSON = JSON.parse(aiText);
    } catch(e) {
      console.error("AI didn't return perfect JSON. Stripping block ticks.");
      const stripped = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJSON = JSON.parse(stripped);
    }

    user.panAiResult = resultJSON;
    user.licenseAiResult = resultJSON;
    user.panVerificationStatus = 'ai_checked';
    user.licenseVerificationStatus = 'ai_checked';
    user.panAiScore = resultJSON.confidenceScore || 0;
    user.licenseAiScore = resultJSON.confidenceScore || 0;
    
    await user.save();
    return res.status(200).json({ message: "AI check completed", result: resultJSON });
  } catch (error) {
    console.error("AI Check error:", error);
    res.status(500).json({ message: "AI check failed", error: error.message });
  }
};

export const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { verificationNotes } = req.body;
    const adminId = req.user.id || req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.verified = true;
    user.panVerificationStatus = 'manually_verified';
    user.licenseVerificationStatus = 'manually_verified';
    user.verificationNotes = verificationNotes || "";
    user.kycReviewedAt = new Date();
    user.kycReviewedBy = adminId;
    user.rejectionReason = "";

    await user.save();

    // Send email
    await sendEmail({
      email: user.email,
      subject: "eAson - Account Verified",
      html: `<h2>Welcome to eAson</h2><p>Your wholesaler account is now fully verified. You can now access your dashboard and start trading.</p>`
    });

    res.status(200).json({ message: "User KYC approved." });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve KYC" });
  }
};

export const rejectKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id || req.user._id;

    if (!rejectionReason) return res.status(400).json({ message: "Rejection reason is required." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.verified = false;
    user.panVerificationStatus = 'rejected';
    user.licenseVerificationStatus = 'rejected';
    user.rejectionReason = rejectionReason;
    user.kycReviewedAt = new Date();
    user.kycReviewedBy = adminId;

    await user.save();

    await sendEmail({
      email: user.email,
      subject: "eAson - Action Required on your Account",
      html: `<h2>Account Review Failed</h2><p>Unfortunately, your KYC verification was rejected for the following reason:</p><blockquote>${rejectionReason}</blockquote><p>Please log in and resubmit your documents.</p>`
    });

    res.status(200).json({ message: "User KYC rejected." });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject KYC" });
  }
};

export const streamDocument = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // type=pan or type=license
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const filePath = type === 'pan' ? user.panDocument : user.businessLicense;
    if (!filePath) return res.status(404).json({ message: "Document not uploaded" });

    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: "File not found on disk" });

    res.sendFile(fullPath);
  } catch (error) {
    res.status(500).json({ message: "Failed to load document" });
  }
};
