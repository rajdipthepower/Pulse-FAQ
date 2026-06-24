import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/error.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/categories.js';
import tagRoutes from './routes/tags.js';
import faqRoutes from './routes/faqs.js';
import answerRoutes from './routes/answers.js';
import commentRoutes from './routes/comments.js';
import searchRoutes from './routes/search.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') ?? '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: 60_000, max: 300 }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'samagama-saarthi' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(port, () => console.log(`[samagama-saarthi] api on :${port}`));
});
