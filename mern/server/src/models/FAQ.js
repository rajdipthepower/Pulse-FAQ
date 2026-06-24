import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    tags: [{ type: String, lowercase: true, trim: true, index: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved', index: true },
    views: { type: Number, default: 0 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', default: null },
  },
  { timestamps: true }
);

faqSchema.index({ question: 'text', answer: 'text', tags: 'text' });

export const FAQ = mongoose.model('FAQ', faqSchema);
