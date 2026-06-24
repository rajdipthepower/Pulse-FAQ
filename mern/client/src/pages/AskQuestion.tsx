import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AskQuestion() {
  const nav = useNavigate();
  const [form, setForm] = useState({ question: '', answer: '', category: '', tags: '' });
  const { data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.categories,
  });

  const m = useMutation({
    mutationFn: async () => {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      return (await api.post('/faqs', payload)).data;
    },
    onSuccess: (d) => { toast.success('Posted'); nav(`/faqs/${d.faq._id}`); },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'Failed'),
  });

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader><CardTitle>Ask a question</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-4">
            <Input placeholder="A clear, concise question" value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })} required minLength={8} />
            <Textarea placeholder="Add context, what you've tried, or share your answer if you already have one"
              value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            <select required className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-white/5 dark:border-white/10 dark:text-white"
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select a category</option>
              {(cats ?? []).map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <Input placeholder="Tags (comma-separated)" value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <Button className="w-full" disabled={m.isPending}>Publish question</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
