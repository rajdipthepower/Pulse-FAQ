import { Router } from 'express';
import { Tag } from '../models/Tag.js';

const r = Router();
r.get('/', async (_req, res) => {
  const tags = await Tag.find().sort({ uses: -1 }).limit(100);
  res.json({ tags });
});
export default r;
