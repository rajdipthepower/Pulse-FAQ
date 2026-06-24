import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty', 'moderator', 'admin'], default: 'student', index: true },
    photo: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    reputation: { type: Number, default: 0 },
    savedFaqs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FAQ' }],
    resetToken: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
