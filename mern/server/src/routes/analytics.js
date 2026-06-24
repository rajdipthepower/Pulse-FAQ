import { Router } from 'express';
import { User } from '../models/User.js';
import { FAQ } from '../models/FAQ.js';
import { Answer } from '../models/Answer.js';
import { Category } from '../models/Category.js';
import { SearchLog } from '../models/Analytics.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const r = Router();

r.get('/overview', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const [users, faqs, answers, activeContributors, topCategories, userGrowth, faqGrowth, topContributors, searchTrends] = await Promise.all([
      User.countDocuments(),
      FAQ.countDocuments(),
      Answer.countDocuments(),
      Answer.distinct('author', { createdAt: { $gte: since } }).then((a) => a.length),
      FAQ.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $unwind: '$cat' },
        { $project: { name: '$cat.name', color: '$cat.color', count: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      FAQ.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.find().sort({ reputation: -1 }).limit(10).select('name photo role reputation'),
      SearchLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$query', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
      ]),
    ]);
    res.json({
      totals: { users, faqs, answers, activeContributors, categories: await Category.countDocuments() },
      topCategories, userGrowth, faqGrowth, topContributors, searchTrends,
    });
  } catch (e) { next(e); }
});

export default r;
