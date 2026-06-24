import { Router } from 'express';
import { Comment } from '../models/Comment.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

r.get('/faq/:faqId', async (req, res, next) => {
  try {
    const items = await Comment.find({ faq: req.params.faqId })
      .sort({ createdAt: 1 })
      .populate('author', 'name photo role');
    res.json({ items });
  } catch (e) { next(e); }
});

r.post('/faq/:faqId', requireAuth, async (req, res, next) => {
  try {
    const c = await Comment.create({ faq: req.params.faqId, author: req.user._id, body: req.body.body });
    res.status(201).json({ comment: c });
  } catch (e) { next(e); }
});

r.post('/:id/reply', requireAuth, async (req, res, next) => {
  try {
    const parent = await Comment.findById(req.params.id);
    if (!parent) return res.status(404).json({ error: 'Not found' });
    const c = await Comment.create({ faq: parent.faq, parent: parent._id, author: req.user._id, body: req.body.body });
    res.status(201).json({ comment: c });
  } catch (e) { next(e); }
});

r.post('/:id/upvote', requireAuth, async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    const uid = req.user._id.toString();
    const has = c.upvotes.some((x) => x.toString() === uid);
    if (has) c.upvotes = c.upvotes.filter((x) => x.toString() !== uid);
    else c.upvotes.push(req.user._id);
    await c.save();
    res.json({ upvotes: c.upvotes.length, upvoted: !has });
  } catch (e) { next(e); }
});

r.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    const isOwner = c.author.toString() === req.user._id.toString();
    const canManage = ['moderator', 'admin'].includes(req.user.role);
    if (!isOwner && !canManage) return res.status(403).json({ error: 'Forbidden' });
    await c.deleteOne();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
