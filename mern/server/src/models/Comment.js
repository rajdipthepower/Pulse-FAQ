import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    faq: { type: mongoose.Schema.Types.ObjectId, ref: 'FAQ', required: true, index: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 2000 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Comment = mongoose.model('Comment', commentSchema);
