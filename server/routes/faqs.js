const express = require('express');
const router = express.Router();
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fsHelper');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FAQS_FILE = path.join(DATA_DIR, 'faqs.json');
const PENDING_FILE = path.join(DATA_DIR, 'pending_aqs.json');

const ADMIN_TOKEN = 'STATIC_ADMIN_TOKEN_please_change_in_prod';

function verifyAdminHeader(req) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  return token && String(token) === ADMIN_TOKEN;
}

// GET ALL FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await readJSON(FAQS_FILE);

    // Ensure every single item structurally has a unique ID string!
    const sanitizedFaqs = (Array.isArray(faqs) ? faqs : []).map((faq, index) => ({
      ...faq,
      id: faq.id || `faq-${index}`
    }));

    return res.json(sanitizedFaqs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// VOTE ENDPOINT (PATCH /api/faqs/:id/vote)
router.patch('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body || {};
    if (!['upvote', 'downvote'].includes(type)) return res.status(400).json({ error: 'type must be upvote or downvote' });

    const faqs = await readJSON(FAQS_FILE);
    const idx = faqs.findIndex(f => String(f.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'FAQ not found' });

    if (type === 'upvote') faqs[idx].upvotes = (Number(faqs[idx].upvotes) || 0) + 1;
    else faqs[idx].downvotes = (Number(faqs[idx].downvotes) || 0) + 1;

    await writeJSON(FAQS_FILE, faqs);
    return res.json({ status: 'ok', item: { ...faqs[idx], id: id } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// IN-PLACE EDIT (PUT /api/faqs/:id)
router.put('/:id', async (req, res) => {
  try {
    if (!verifyAdminHeader(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params; // This will be "faq-49", etc.
    const { question, answer, category } = req.body || {};

    const faqs = await readJSON(FAQS_FILE);
    
    // Find item by matching its array position index
    const idx = faqs.findIndex((f, i) => String(f.id) === String(id) || `faq-${i}` === String(id));
    if (idx === -1) return res.status(404).json({ error: 'FAQ not found' });

    // Update the item but keep your file clean (no forced ID stored to disk)
    faqs[idx] = {
      question: typeof question === 'string' ? question.trim() : faqs[idx].question,
      answer: typeof answer === 'string' ? answer.trim() : faqs[idx].answer,
      category: typeof category === 'string' ? category.trim() : faqs[idx].category
    };

    await writeJSON(FAQS_FILE, faqs);
    return res.status(200).json({ success: true, item: { ...faqs[idx], id } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// SECURE DELETE (DELETE /api/faqs/:id)
router.delete('/:id', async (req, res) => {
  try {
    if (!verifyAdminHeader(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;

    const faqs = await readJSON(FAQS_FILE);
    
    // Find item by matching its array position index
    const idx = faqs.findIndex((f, i) => String(f.id) === String(id) || `faq-${i}` === String(id));
    if (idx === -1) return res.status(404).json({ error: 'FAQ not found' });

    // Remove exactly that item from the array
    faqs.splice(idx, 1);

    await writeJSON(FAQS_FILE, faqs);
    return res.status(200).json({ success: true, id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

  // Submit an anonymous question (POST /api/aqs via proxy)
  router.post('/aqs', async (req, res) => {
    try {
      const { question } = req.body || {};
      if (!question || !String(question).trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const pending = await readJSON(PENDING_FILE);

      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        question: String(question).trim(),
        submission_count: 1,
        isFAQ: false,
        created_at: new Date().toISOString()
      };

      pending.push(newItem);
      await writeJSON(PENDING_FILE, pending);
      return res.json({ status: 'pending', item: newItem });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

module.exports = router;