import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, MessageSquare, Sparkles, TrendingUp, Users, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth';

function Stat({ icon: Icon, label, value, color }: any) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-12 w-12 place-items-center rounded-xl text-white" style={{ background: color }}>
          <Icon size={20} />
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase">{label}</div>
          <div className="font-display text-2xl text-brand-800 dark:text-white">{value ?? '—'}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: trending } = useQuery({
    queryKey: ['faqs', 'trending'],
    queryFn: async () => (await api.get('/faqs', { params: { sort: 'trending', limit: 6 } })).data.items,
  });
  const { data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.categories,
  });

  return (
    <div className="container py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-sm text-slate-500">Welcome back,</div>
          <h1 className="font-display text-3xl text-brand-800 dark:text-white">{user?.name}</h1>
        </div>
        <Button asChild><Link to="/ask">Ask a Question</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <Stat icon={BookOpen} label="Total FAQs" value={trending?.length ? '1.2k+' : '—'} color="#4338CA" />
        <Stat icon={MessageSquare} label="Total Answers" value="3.4k+" color="#10B981" />
        <Stat icon={Users} label="Active Contributors" value="420" color="#F59E0B" />
        <Stat icon={Sparkles} label="AI Sessions" value="9.8k" color="#8B5CF6" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={18} /> Trending FAQs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(trending ?? []).map((f: any) => (
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
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity size={18} /> Categories</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(cats ?? []).slice(0, 9).map((c: any) => (
              <Link key={c._id} to={`/faqs?category=${c._id}`} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-brand-50 dark:hover:bg-white/5">
                <span className="text-sm text-ink dark:text-slate-200">{c.name}</span>
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }}></span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
