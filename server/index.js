const express = require('express');
const cors = require('cors');
const path = require('path');

const faqsRoutes = require('./routes/faqs');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', faqsRoutes);
app.use('/api/admin', adminRoutes);

// Simple health
app.get('/ping', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
