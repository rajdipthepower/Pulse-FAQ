import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { FAQ } from '../models/FAQ.js';

const r = Router();

const SYSTEM_PROMPT = `You are Professor Dr. Sudarshan, the academic mentor and knowledge guide of Samagama Saarthi — a community-driven academic FAQ and knowledge-sharing platform.

Voice: warm, articulate, scholarly, encouraging. Address users like a thoughtful professor: clear, structured, kind. Use plain English with occasional gentle academic flourish. Never condescend.

Responsibilities:
- Answer questions about the platform and how to use it.
- Guide users through FAQs, categories, and search.
- Recommend related questions and suggest the most relevant category & tags for new submissions.
- Summarize long discussions when asked.
- Provide academic guidance: study strategies, research direction, admissions, scholarships, placements.
- Always cite which FAQs you reference (by title) when you use platform context.

If unsure, say so and recommend the user post a question to the community.`;

r.post('/chat', requireAuth, async (req, res, next) => {
  try {
    const { messages = [], includeContext = true } = req.body || {};
    const last = messages[messages.length - 1]?.content || '';

    let context = '';
    if (includeContext && last) {
      const related = await FAQ.find({ $text: { $search: last }, status: 'approved' })
        .limit(5).select('question answer');
      if (related.length) {
        context = '\n\nRelevant FAQs from the platform:\n' + related
          .map((f, i) => `${i + 1}. ${f.question}\n${(f.answer || '').slice(0, 400)}`)
          .join('\n\n');
      }
    }

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      return res.json({
        message: {
          role: 'assistant',
          content: `Greetings. I am Professor Dr. Sudarshan. The AI service is not configured on this server (missing AI_API_KEY). Once your administrator adds the key, I shall happily assist you with: "${last}".`,
        },
      });
    }

    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + context },
          ...messages,
        ],
        temperature: 0.6,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: 'AI provider error', detail: text });
    }
    const data = await resp.json();
    const message = data.choices?.[0]?.message ?? { role: 'assistant', content: 'I could not formulate a response.' };
    res.json({ message });
  } catch (e) { next(e); }
});

export default r;
