import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Register() {
  const nav = useNavigate();
  const setSession = useAuth((s) => s.setSession);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' as 'student' | 'faculty' });

  const m = useMutation({
    mutationFn: async () => (await api.post('/auth/register', form)).data,
    onSuccess: (d) => { setSession(d.user, d.accessToken, d.refreshToken); toast.success('Welcome!'); nav('/dashboard'); },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'Registration failed'),
  });

  return (
    <div className="container max-w-md py-20">
      <Card>
        <CardHeader><CardTitle>Join Samagama Saarthi</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-4">
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input type="password" placeholder="Password (min 8 chars)" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-white/5 dark:border-white/10 dark:text-white"
              value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
              <option value="student">I am a Student</option>
              <option value="faculty">I am Faculty</option>
            </select>
            <Button className="w-full" disabled={m.isPending}>Create account</Button>
          </form>
          <div className="mt-4 text-sm text-center">
            Already have an account? <Link to="/login" className="text-brand hover:underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
