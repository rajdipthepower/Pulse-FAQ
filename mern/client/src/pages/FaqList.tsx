import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function FaqList() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'recent';

  const { data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.categories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['faqs', search, category, sort],
    queryFn: async () => (await api.get('/faqs', { params: { search, category, sort } })).data,
  });

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next);
  };

  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl text-brand-800 dark:text-white mb-6">Browse FAQs</h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search keywords…" value={search}
            onChange={(e) => setParam('search', e.target.value)} />
        </div>
        <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-white/5 dark:border-white/10 dark:text-white"
          value={category} onChange={(e) => setParam('category', e.target.value)}>
          <option value="">All categories</option>
          {(cats ?? []).map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-white/5 dark:border-white/10 dark:text-white"
          value={sort} onChange={(e) => setParam('sort', e.target.value)}>
          <option value="recent">Most recent</option>
          <option value="popular">Most viewed</option>
          <option value="trending">Trending</option>
        </select>
      </div>

      {isLoading && <div className="text-sm text-slate-500">Loading…</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {(data?.items ?? []).map((f: any) => (
          <Link key={f._id} to={`/faqs/${f._id}`}>
            <Card className="h-full transition hover:-translate-y-0.5">
              <CardContent>
                <Badge style={{ background: f.category?.color + '22', color: f.category?.color }}>{f.category?.name}</Badge>
                <h3 className="mt-3 font-display text-lg text-brand-800 dark:text-white">{f.question}</h3>
                {f.answer && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{f.answer}</p>}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>by {f.author?.name}</span>
                  <span>{f.views} views · {f.upvotes?.length || 0} upvotes</span>
                </div>
                {f.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {f.tags.slice(0, 5).map((t: string) => <Badge key={t}>#{t}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
