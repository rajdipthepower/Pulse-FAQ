import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Users, BookOpen, ShieldCheck, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function Landing() {
  const { data: faqs } = useQuery({
    queryKey: ['faqs', 'landing'],
    queryFn: async () => (await api.get('/faqs', { params: { sort: 'popular', limit: 6 } })).data.items,
  });
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.categories,
  });

  return (
    <>
      {/* HERO */}
      <section className="container pt-16 pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge className="mb-6"><Sparkles size={12} className="mr-1" /> AI-powered academic knowledge</Badge>
            <h1 className="font-display text-5xl leading-tight text-brand-800 dark:text-white md:text-6xl">
              Connecting Questions, Knowledge, and Communities.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Samagama Saarthi is where students, faculty and researchers crowdsource trusted academic answers — guided by
              <span className="text-brand-700 dark:text-brand-200 font-medium"> Professor Dr. Sudarshan</span>, your AI academic mentor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link to="/register">Join the community <ArrowRight size={16} /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link to="/faqs">Browse FAQs</Link></Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[['12k+', 'FAQs'], ['4.5k+', 'Contributors'], ['98%', 'Verified']].map(([n, l]) => (
                <div key={l} className="rounded-2xl glass p-4 text-center">
                  <div className="font-display text-2xl text-brand-800 dark:text-white">{n}</div>
                  <div className="text-xs text-slate-500">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand/20 via-secondary/15 to-accent/15 blur-2xl"></div>
            <Card className="relative">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-white/80 px-4 py-3 dark:bg-white/5 dark:border-white/10">
                  <Search size={16} className="text-brand" />
                  <span className="text-sm text-slate-500">Search "scholarship application deadline"…</span>
                </div>
                {(faqs ?? []).slice(0, 4).map((f: any) => (
                  <Link key={f._id} to={`/faqs/${f._id}`} className="block rounded-xl border border-slate-100 bg-white/70 p-4 hover:border-brand-200 dark:bg-white/5 dark:border-white/10">
                    <div className="text-sm font-medium text-ink dark:text-white">{f.question}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Badge style={{ background: f.category?.color + '22', color: f.category?.color }}>{f.category?.name}</Badge>
                      <span>{f.views} views · {f.upvotes?.length || 0} upvotes</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-4xl text-brand-800 dark:text-white">A complete academic knowledge OS</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Crowdsource, verify, search and learn — all in one platform.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { i: BookOpen, t: 'Crowdsourced FAQs', d: 'Submit questions, contribute answers, and grow a verified knowledge base.' },
            { i: ShieldCheck, t: 'Faculty Verified', d: 'Faculty mark correct answers and contribute official responses students can trust.' },
            { i: Sparkles, t: 'Professor Dr. Sudarshan', d: 'An AI mentor who guides, summarises, recommends, and teaches.' },
            { i: Search, t: 'Smart Search', d: 'Keyword, category, and tag filters with intelligent suggestions.' },
            { i: TrendingUp, t: 'Trends & Analytics', d: 'See what your community is asking, and who is contributing most.' },
            { i: Users, t: 'Reputation & Roles', d: 'Students, faculty, moderators and admins — each empowered with the right tools.' },
          ].map(({ i: Icon, t, d }) => (
            <Card key={t}>
              <CardContent>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-secondary text-white">
                  <Icon size={18} />
                </div>
                <div className="mt-4 font-display text-lg text-brand-800 dark:text-white">{t}</div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container py-16">
        <h2 className="font-display text-3xl text-brand-800 dark:text-white mb-8">Popular categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {(categories ?? []).map((c: any) => (
            <Link key={c._id} to={`/faqs?category=${c._id}`} className="group rounded-2xl glass p-5 transition hover:-translate-y-0.5">
              <div className="h-10 w-10 rounded-xl" style={{ background: c.color + '22', color: c.color, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                {c.name[0]}
              </div>
              <div className="mt-3 font-display text-lg text-brand-800 dark:text-white group-hover:text-brand">{c.name}</div>
              <div className="text-xs text-slate-500">{c.description || 'Explore curated FAQs.'}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI SHOWCASE */}
      <section className="container py-16">
        <Card>
          <CardContent className="grid items-center gap-10 md:grid-cols-2 p-10">
            <div>
              <Badge><Sparkles size={12} className="mr-1" /> Professor Dr. Sudarshan</Badge>
              <h2 className="mt-3 font-display text-3xl text-brand-800 dark:text-white">
                Your patient, thoughtful AI academic mentor.
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Get guided through FAQs, receive category and tag suggestions, summarise long discussions, and explore academic
                pathways — anytime, in any language you prefer.
              </p>
              <Button className="mt-6" asChild><Link to="/register">Start a conversation</Link></Button>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-brand/10 via-secondary/10 to-accent/10 p-6">
              {[
                { r: 'user', t: 'Recommend FAQs about hostel allotment for first-years.' },
                { r: 'ai', t: 'A pleasure. Three highly upvoted FAQs cover allotment timelines, document checklists, and roommate change procedures. Shall I summarise each?' },
              ].map((m, i) => (
                <div key={i} className={`mb-3 max-w-[90%] rounded-2xl px-4 py-2 text-sm ${m.r === 'user' ? 'ml-auto bg-brand text-white' : 'bg-white text-ink shadow-sm'}`}>
                  {m.t}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* TESTIMONIALS */}
      <section className="container py-16">
        <h2 className="font-display text-3xl text-brand-800 dark:text-white mb-8">Loved by academic communities</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Aarav, B.Tech CSE', 'Found the answer to my scholarship query in under a minute. The professor avatar even suggested related FAQs.'],
            ['Dr. Meera, Faculty', 'I love being able to verify answers and post official responses. It keeps the knowledge base trustworthy.'],
            ['Riya, MA Literature', 'The discussions feel rigorous. It is like an always-open faculty lounge for students.'],
          ].map(([who, quote]) => (
            <Card key={who}>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-200">"{quote}"</p>
                <div className="mt-4 text-sm text-brand-700 dark:text-brand-200">— {who}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
