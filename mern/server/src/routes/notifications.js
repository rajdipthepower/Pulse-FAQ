import { Router } from 'express';
import { Notification } from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

r.get('/', requireAuth, async (req, res, next) => {
  try {
    const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ items, unread: items.filter((i) => !i.read).length });
  } catch (e) { next(e); }
});

r.post('/:id/read', requireAuth, async (req, res, next) => {
  try {
    await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.post('/read-all', requireAuth, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
