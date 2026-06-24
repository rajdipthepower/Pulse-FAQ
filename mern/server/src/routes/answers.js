import { Router } from 'express';
import { Answer } from '../models/Answer.js';
import { FAQ } from '../models/FAQ.js';
import { User } from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();

r.post('/:id/upvote', requireAuth, async (req, res, next) => {
  try {
    const a = await Answer.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    const uid = req.user._id.toString();
    const has = a.upvotes.some((x) => x.toString() === uid);
    if (has) a.upvotes = a.upvotes.filter((x) => x.toString() !== uid);
    else {
      a.upvotes.push(req.user._id);
      await User.findByIdAndUpdate(a.author, { $inc: { reputation: 1 } });
    }
    await a.save();
    res.json({ upvotes: a.upvotes.length, upvoted: !has });
  } catch (e) { next(e); }
});

r.post('/:id/verify', requireAuth, requireRole('faculty', 'moderator', 'admin'), async (req, res, next) => {
  try {
    const a = await Answer.findByIdAndUpdate(req.params.id, { verifiedBy: req.user._id, verifiedAt: new Date() }, { new: true });
    res.json({ answer: a });
  } catch (e) { next(e); }
});

r.post('/:id/correct', requireAuth, requireRole('faculty', 'moderator', 'admin'), async (req, res, next) => {
  try {
    const a = await Answer.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    await FAQ.findByIdAndUpdate(a.faq, { acceptedAnswer: a._id });
    await User.findByIdAndUpdate(a.author, { $inc: { reputation: 10 } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const a = await Answer.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    const isOwner = a.author.toString() === req.user._id.toString();
    const canManage = ['moderator', 'admin'].includes(req.user.role);
    if (!isOwner && !canManage) return res.status(403).json({ error: 'Forbidden' });
    await a.deleteOne();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
