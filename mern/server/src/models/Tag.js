import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    uses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Tag = mongoose.model('Tag', tagSchema);
