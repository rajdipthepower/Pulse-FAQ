import { Router } from 'express';
import { Category } from '../models/Category.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

r.get('/', async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ categories });
});

r.post('/', requireAuth, requireRole('moderator', 'admin'), async (req, res, next) => {
  try {
    const { name, description = '', icon = 'book', color = '#4338CA' } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const cat = await Category.create({ name, slug: slugify(name), description, icon, color });
    res.status(201).json({ category: cat });
  } catch (e) { next(e); }
});

r.patch('/:id', requireAuth, requireRole('moderator', 'admin'), async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ category: cat });
  } catch (e) { next(e); }
});

r.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
