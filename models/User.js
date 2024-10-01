// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 5 },
  pendingBalance: { type: Number, default: 0 }, // New field for pending balance
  referralCode: { type: String, unique: true }, // Unique referral code
  referrals: { type: Number, default: 0 }, // Count of referrals
  verificationCode: { type: String },
  codeExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);

