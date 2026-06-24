import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    faq: { type: mongoose.Schema.Types.ObjectId, ref: 'FAQ', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    isOfficial: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  },
  { timestamps: true }
);

export const Answer = mongoose.model('Answer', answerSchema);
