import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUp, BookmarkPlus, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useAuth } from '@/store/auth';

export default function FaqDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [body, setBody] = useState('');

  const { data } = useQuery({
    queryKey: ['faq', id],
    queryFn: async () => (await api.get(`/faqs/${id}`)).data,
    enabled: !!id,
  });

  const upvote = useMutation({
    mutationFn: async () => (await api.post(`/faqs/${id}/upvote`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faq', id] }),
  });
  const save = useMutation({
    mutationFn: async () => (await api.post(`/faqs/${id}/save`)).data,
    onSuccess: (d) => toast.success(d.saved ? 'Saved' : 'Removed from saved'),
  });
  const submit = useMutation({
    mutationFn: async () => (await api.post(`/faqs/${id}/answers`, { body })).data,
    onSuccess: () => { setBody(''); qc.invalidateQueries({ queryKey: ['faq', id] }); toast.success('Answer posted'); },
  });
  const verify = useMutation({
    mutationFn: async (aid: string) => (await api.post(`/answers/${aid}/verify`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faq', id] }),
  });
  const correct = useMutation({
    mutationFn: async (aid: string) => (await api.post(`/answers/${aid}/correct`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faq', id] }),
  });
  const upvoteAnswer = useMutation({
    mutationFn: async (aid: string) => (await api.post(`/answers/${aid}/upvote`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faq', id] }),
  });

  if (!data) return <div className="container py-10 text-sm text-slate-500">Loading…</div>;
  const { faq, answers } = data;
  const canVerify = user && ['faculty', 'moderator', 'admin'].includes(user.role);

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardContent>
          <Badge style={{ background: faq.category?.color + '22', color: faq.category?.color }}>{faq.category?.name}</Badge>
          <h1 className="mt-3 font-display text-3xl text-brand-800 dark:text-white">{faq.question}</h1>
          <div className="mt-2 text-xs text-slate-500">
            by <Link to={`/profile/${faq.author?._id}`} className="text-brand">{faq.author?.name}</Link> · {faq.views} views
          </div>
          {faq.answer && <p className="mt-4 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{faq.answer}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {faq.tags?.map((t: string) => <Badge key={t}>#{t}</Badge>)}
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => upvote.mutate()}><ArrowUp size={14} /> Upvote ({faq.upvotes?.length || 0})</Button>
            <Button variant="outline" onClick={() => save.mutate()}><BookmarkPlus size={14} /> Save</Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="font-display text-2xl text-brand-800 dark:text-white mt-10 mb-4">{answers.length} Answers</h2>

      <div className="space-y-4">
        {answers.map((a: any) => (
          <Card key={a._id}>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${a.author?._id}`} className="text-brand">{a.author?.name}</Link>
                  <Badge>{a.author?.role}</Badge>
                  {a.isOfficial && <Badge style={{ background: '#10B98122', color: '#10B981' }}>Official</Badge>}
                  {a.verifiedBy && <span className="inline-flex items-center gap-1 text-emerald-600"><ShieldCheck size={12} /> Verified</span>}
                </div>
                <span>{new Date(a.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{a.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => upvoteAnswer.mutate(a._id)}>
                  <ArrowUp size={14} /> {a.upvotes?.length || 0}
                </Button>
                {canVerify && !a.verifiedBy && (
                  <Button size="sm" variant="outline" onClick={() => verify.mutate(a._id)}><ShieldCheck size={14} /> Verify</Button>
                )}
                {canVerify && (
                  <Button size="sm" variant="secondary" onClick={() => correct.mutate(a._id)}><CheckCircle size={14} /> Mark Correct</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {user ? (
        <Card className="mt-8">
          <CardHeader><CardTitle>Your answer</CardTitle></CardHeader>
          <CardContent>
            <Textarea placeholder="Share your knowledge…" value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="mt-3 flex justify-end">
              <Button disabled={!body.trim() || submit.isPending} onClick={() => submit.mutate()}>Post answer</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-8"><CardContent>
          <Link to="/login" className="text-brand">Sign in</Link> to contribute an answer.
        </CardContent></Card>
      )}
    </div>
  );
}
