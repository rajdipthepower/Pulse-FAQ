import { Router } from 'express';
import { z } from 'zod';
import { FAQ } from '../models/FAQ.js';
import { Answer } from '../models/Answer.js';
import { Tag } from '../models/Tag.js';
import { User } from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();

const faqSchema = z.object({
  question: z.string().min(8).max(300),
  answer: z.string().max(20000).optional().default(''),
  category: z.string().min(1),
  tags: z.array(z.string().min(1).max(40)).max(10).optional().default([]),
});

r.get('/', async (req, res, next) => {
  try {
    const { search, category, tag, sort = 'recent', page = 1, limit = 20 } = req.query;
    const q = { status: 'approved' };
    if (category) q.category = category;
    if (tag) q.tags = String(tag).toLowerCase();
    if (search) q.$text = { $search: String(search) };

    const sortMap = {
      recent: { createdAt: -1 },
      popular: { views: -1 },
      trending: { updatedAt: -1 },
    };
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      FAQ.find(q).sort(sortMap[sort] || sortMap.recent).skip(skip).limit(Number(limit))
        .populate('category', 'name slug color icon')
        .populate('author', 'name photo role reputation'),
      FAQ.countDocuments(q),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (e) { next(e); }
});

r.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = faqSchema.parse(req.body);
    const tags = [...new Set(data.tags.map((t) => t.toLowerCase().trim()))];
    // moderators auto-approve; others go to pending if moderation required (here: auto-approve)
    const faq = await FAQ.create({
      question: data.question,
      answer: data.answer,
      category: data.category,
      tags,
      author: req.user._id,
      status: 'approved',
    });
    await Promise.all(tags.map((name) =>
      Tag.findOneAndUpdate({ name }, { $inc: { uses: 1 }, $setOnInsert: { name } }, { upsert: true })
    ));
    await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 2 } });
    res.status(201).json({ faq });
  } catch (e) { next(e); }
});

r.get('/:id', async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('category', 'name slug color icon')
      .populate('author', 'name photo role reputation');
    if (!faq) return res.status(404).json({ error: 'Not found' });
    const answers = await Answer.find({ faq: faq._id })
      .sort({ isOfficial: -1, verifiedAt: -1, createdAt: -1 })
      .populate('author', 'name photo role reputation');
    res.json({ faq, answers });
  } catch (e) { next(e); }
});

r.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ error: 'Not found' });
    const isOwner = faq.author.toString() === req.user._id.toString();
    const canManage = ['moderator', 'admin'].includes(req.user.role);
    if (!isOwner && !canManage) return res.status(403).json({ error: 'Forbidden' });
    Object.assign(faq, req.body);
    await faq.save();
    res.json({ faq });
  } catch (e) { next(e); }
});

r.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ error: 'Not found' });
    const isOwner = faq.author.toString() === req.user._id.toString();
    const canManage = ['moderator', 'admin'].includes(req.user.role);
    if (!isOwner && !canManage) return res.status(403).json({ error: 'Forbidden' });
    await Promise.all([faq.deleteOne(), Answer.deleteMany({ faq: faq._id })]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.post('/:id/upvote', requireAuth, async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ error: 'Not found' });
    const uid = req.user._id.toString();
    const has = faq.upvotes.some((x) => x.toString() === uid);
    if (has) faq.upvotes = faq.upvotes.filter((x) => x.toString() !== uid);
    else faq.upvotes.push(req.user._id);
    await faq.save();
    res.json({ upvotes: faq.upvotes.length, upvoted: !has });
  } catch (e) { next(e); }
});

r.post('/:id/save', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const id = req.params.id;
    const has = user.savedFaqs.some((x) => x.toString() === id);
    if (has) user.savedFaqs = user.savedFaqs.filter((x) => x.toString() !== id);
    else user.savedFaqs.push(id);
    await user.save();
    res.json({ saved: !has });
  } catch (e) { next(e); }
});

r.post('/:id/approve', requireAuth, requireRole('moderator', 'admin'), async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.json({ faq });
  } catch (e) { next(e); }
});

r.post('/:id/answers', requireAuth, async (req, res, next) => {
  try {
    const body = String(req.body?.body || '').trim();
    if (body.length < 2) return res.status(400).json({ error: 'Answer too short' });
    const isOfficial = req.user.role === 'faculty';
    const ans = await Answer.create({ faq: req.params.id, author: req.user._id, body, isOfficial });
    await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 3 } });
    res.status(201).json({ answer: ans });
  } catch (e) { next(e); }
});

export default r;
