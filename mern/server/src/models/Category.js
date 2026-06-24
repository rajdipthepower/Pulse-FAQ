import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'book' },
    color: { type: String, default: '#4338CA' },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
