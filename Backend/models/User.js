import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  verified: { type: Boolean, default: false },
  shopName: { type: String, trim: true },
  panNumber: { type: String, trim: true },
  address: { type: String, trim: true },
  businessType: { type: String, trim: true },
  phone: { type: String, trim: true },
  khataCreditLimit: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model("User", userSchema);
 