import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signAccess, signRefresh } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['student', 'faculty']).optional(),
});

r.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || 'student',
    });
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken: signAccess(user),
      refreshToken: signRefresh(user),
    });
  } catch (e) { next(e); }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

r.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, photo: user.photo },
      accessToken: signAccess(user),
      refreshToken: signRefresh(user),
    });
  } catch (e) { next(e); }
});

r.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ error: 'Missing refreshToken' });
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ accessToken: signAccess(user) });
  } catch { res.status(401).json({ error: 'Invalid refresh token' }); }
});

r.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    // Always 200 to avoid email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetToken = crypto.createHash('sha256').update(token).digest('hex');
      user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
      await user.save();
      // TODO: send email. For dev, return token.
      return res.json({ ok: true, devToken: token });
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: 'Missing fields' });
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetToken: hashed, resetTokenExpiresAt: { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    await user.save();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default r;
