import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Category } from './models/Category.js';
import { FAQ } from './models/FAQ.js';

const CATS = [
  { name: 'Academics', icon: 'graduation-cap', color: '#4338CA' },
  { name: 'Admissions', icon: 'door-open', color: '#10B981' },
  { name: 'Scholarships', icon: 'award', color: '#F59E0B' },
  { name: 'Hostel', icon: 'home', color: '#EF4444' },
  { name: 'Placements', icon: 'briefcase', color: '#8B5CF6' },
  { name: 'Research', icon: 'flask', color: '#06B6D4' },
  { name: 'Events', icon: 'calendar', color: '#EC4899' },
  { name: 'Technical Support', icon: 'wrench', color: '#64748B' },
  { name: 'Student Life', icon: 'sparkles', color: '#F97316' },
];

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

await connectDB();

for (const c of CATS) {
  await Category.updateOne({ name: c.name }, { $setOnInsert: { ...c, slug: slugify(c.name) } }, { upsert: true });
}
console.log('[seed] categories ready');

let admin = await User.findOne({ email: 'admin@samagama.dev' });
if (!admin) {
  admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@samagama.dev',
    passwordHash: await bcrypt.hash('Admin@123', 12),
    role: 'admin',
    bio: 'Samagama Saarthi administrator.',
  });
  console.log('[seed] admin created → admin@samagama.dev / Admin@123');
}

if ((await FAQ.countDocuments()) === 0) {
  const academics = await Category.findOne({ name: 'Academics' });
  const admissions = await Category.findOne({ name: 'Admissions' });
  await FAQ.create([
    {
      question: 'How do I register for elective courses each semester?',
      answer: 'Registration opens two weeks before the semester begins through the student portal. Choose your electives based on prerequisite completion and seat availability.',
      category: academics._id, tags: ['registration', 'electives'], author: admin._id,
    },
    {
      question: 'What documents are required for the admission interview?',
      answer: 'Original mark sheets (Class 10, 12, and most recent), photo ID, statement of purpose, and any portfolio relevant to your chosen program.',
      category: admissions._id, tags: ['admissions', 'interview', 'documents'], author: admin._id,
    },
  ]);
  console.log('[seed] sample FAQs created');
}

console.log('[seed] done');
process.exit(0);
