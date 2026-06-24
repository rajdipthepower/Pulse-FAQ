import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, lowercase: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    results: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SearchLog = mongoose.model('SearchLog', searchLogSchema);
