import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card';

export default function Profile() {
  const { id } = useParams();
  const { data } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => (await api.get(`/users/${id}`)).data,
    enabled: !!id,
  });
  if (!data) return <div className="container py-10 text-sm text-slate-500">Loading…</div>;
  const { user, stats } = data;
  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardContent className="flex items-center gap-6 p-8">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand to-secondary text-2xl text-white">
            {user.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl text-brand-800 dark:text-white">{user.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <Badge>{user.role}</Badge>
              <span>Reputation: <b className="text-brand-700">{user.reputation}</b></span>
            </div>
            {user.bio && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{user.bio}</p>}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3 mt-6">
        <Card><CardHeader><CardTitle>FAQs</CardTitle></CardHeader><CardContent className="text-3xl font-display text-brand-800 dark:text-white">{stats.faqsCount}</CardContent></Card>
        <Card><CardHeader><CardTitle>Answers</CardTitle></CardHeader><CardContent className="text-3xl font-display text-brand-800 dark:text-white">{stats.answersCount}</CardContent></Card>
        <Card><CardHeader><CardTitle>Reputation</CardTitle></CardHeader><CardContent className="text-3xl font-display text-brand-800 dark:text-white">{user.reputation}</CardContent></Card>
      </div>
    </div>
  );
}
