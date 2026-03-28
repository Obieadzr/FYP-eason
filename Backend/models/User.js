import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  verified: { type: Boolean, default: false }, // For wholesaler approval
  isEmailVerified: { type: Boolean, default: false }, // For OTP email verification
  emailVerificationOtp: { type: String },
  emailVerificationOtpExpires: { type: Date },
  shopName: { type: String, trim: true },
  panNumber: { type: String, trim: true },
  address: { type: String, trim: true },
  businessType: { type: String, trim: true },
  phone: { type: String, trim: true },
  khataCreditLimit: { type: Number, default: 0 },
  panDocument: { type: String },
  businessLicense: { type: String },
  panVerificationStatus: { type: String, enum: ['not_submitted', 'pending', 'ai_checked', 'manually_verified', 'rejected'], default: 'not_submitted' },
  licenseVerificationStatus: { type: String, enum: ['not_submitted', 'pending', 'ai_checked', 'manually_verified', 'rejected'], default: 'not_submitted' },
  panAiResult: { type: mongoose.Schema.Types.Mixed },
  licenseAiResult: { type: mongoose.Schema.Types.Mixed },
  panAiScore: { type: Number },
  licenseAiScore: { type: Number },
  verificationNotes: { type: String },
  rejectionReason: { type: String },
  kycSubmittedAt: { type: Date },
  kycReviewedAt: { type: Date },
  kycReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model("User", userSchema);
 