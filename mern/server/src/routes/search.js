import { Router } from 'express';
import { FAQ } from '../models/FAQ.js';
import { SearchLog } from '../models/Analytics.js';

const r = Router();

r.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ items: [] });
    const items = await FAQ.find({ $text: { $search: q }, status: 'approved' }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(25)
      .populate('category', 'name slug color')
      .populate('author', 'name photo role');
    SearchLog.create({ query: q, results: items.length }).catch(() => {});
    res.json({ items });
  } catch (e) { next(e); }
});

r.get('/suggestions', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ suggestions: [] });
    const items = await FAQ.find({ question: new RegExp('^' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
      .limit(8).select('question');
    res.json({ suggestions: items.map((i) => i.question) });
  } catch (e) { next(e); }
});

r.get('/popular', async (_req, res, next) => {
  try {
    const items = await SearchLog.aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({ items });
  } catch (e) { next(e); }
});

export default r;
