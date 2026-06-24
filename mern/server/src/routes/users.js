import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { FAQ } from '../models/FAQ.js';
import { Answer } from '../models/Answer.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();

r.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ users });
});

r.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).max(80).optional(),
      bio: z.string().max(500).optional(),
      photo: z.string().url().optional().or(z.literal('')),
    });
    const data = schema.parse(req.body);
    const updated = await User.findByIdAndUpdate(req.user._id, data, { new: true }).select('-passwordHash');
    res.json({ user: updated });
  } catch (e) { next(e); }
});

r.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'faculty', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
    res.json({ user: u });
  } catch (e) { next(e); }
});

r.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -savedFaqs');
    if (!user) return res.status(404).json({ error: 'Not found' });
    const [faqsCount, answersCount] = await Promise.all([
      FAQ.countDocuments({ author: user._id }),
      Answer.countDocuments({ author: user._id }),
    ]);
    res.json({ user, stats: { faqsCount, answersCount } });
  } catch (e) { next(e); }
});

export default r;
