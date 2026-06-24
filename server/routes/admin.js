const express = require('express');
const router = express.Router();
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fsHelper');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FAQS_FILE = path.join(DATA_DIR, 'faqs.json');
const PENDING_FILE = path.join(DATA_DIR, 'pending_aqs.json');

const ADMIN_EMAIL = 'abc@gmail.com';
const ADMIN_PASS = 'samagama';
const ADMIN_TOKEN = 'STATIC_ADMIN_TOKEN_please_change_in_prod';

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    return res.json({ token: ADMIN_TOKEN });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

function verifyToken(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  if (!token || String(token) !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

router.get('/pending', verifyToken, async (req, res) => {
  try {
    const pending = await readJSON(PENDING_FILE);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/approve', verifyToken, async (req, res) => {
  try {
    const { id, answer } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    if (!answer || !answer.trim()) return res.status(400).json({ error: 'answer required' });

    const pending = await readJSON(PENDING_FILE);
    const faqs = await readJSON(FAQS_FILE);
    const idx = pending.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Pending item not found' });

    const item = pending.splice(idx, 1)[0];
    const newFaq = {
      id: item.id || nextId(),
      question: item.question,
      answer: answer.trim(),
      submission_count: item.submission_count || 1,
      isFAQ: true,
      created_at: new Date().toISOString()
    };
    faqs.push(newFaq);
    await writeJSON(PENDING_FILE, pending);
    await writeJSON(FAQS_FILE, faqs);
    res.json({ status: 'approved', item: newFaq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE multiple pending items (bulk reject)
router.delete('/pending', verifyToken, async (req, res) => {
  try {
    console.log('DELETE /api/admin/pending body:', req.body);
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids array required' });
    const pending = await readJSON(PENDING_FILE);
    const idsSet = new Set(ids.map(String));
    const remaining = pending.filter(p => !idsSet.has(String(p.id)));
    await writeJSON(PENDING_FILE, remaining);
    const deletedCount = pending.length - remaining.length;
    return res.status(200).json({ success: true, deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE single pending item
router.delete('/pending/:id', verifyToken, async (req, res) => {
  try {
    console.log('DELETE /api/admin/pending/:id params.id:', req.params.id);
    const { id } = req.params;
    const pending = await readJSON(PENDING_FILE);
    const idx = pending.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Pending item not found' });
    pending.splice(idx, 1);
    await writeJSON(PENDING_FILE, pending);
    return res.status(200).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST publish a new FAQ directly (admin)
router.post('/publish', verifyToken, async (req, res) => {
  try {
    console.log('POST /api/admin/publish body:', req.body);
    const { question, answer, category, isFAQ } = req.body || {};
    if (!question || !question.trim()) return res.status(400).json({ error: 'question required' });
    if (!answer || !answer.trim()) return res.status(400).json({ error: 'answer required' });

    const faqs = await readJSON(FAQS_FILE);
    const newFaq = {
      id: nextId(),
      question: question.trim(),
      answer: answer.trim(),
      submission_count: 1,
      isFAQ: Boolean(isFAQ),
      category: category || 'General',
      created_at: new Date().toISOString()
    };
    faqs.push(newFaq);
    await writeJSON(FAQS_FILE, faqs);
    return res.status(200).json({ success: true, item: newFaq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
