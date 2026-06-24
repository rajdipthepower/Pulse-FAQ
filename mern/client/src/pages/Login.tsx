import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const nav = useNavigate();
  const setSession = useAuth((s) => s.setSession);
  const [form, setForm] = useState({ email: '', password: '' });

  const m = useMutation({
    mutationFn: async () => (await api.post('/auth/login', form)).data,
    onSuccess: (d) => {
      setSession(d.user, d.accessToken, d.refreshToken);
      toast.success(`Welcome back, ${d.user.name.split(' ')[0]}`);
      nav('/dashboard');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'Login failed'),
  });

  return (
    <div className="container max-w-md py-20">
      <Card>
        <CardHeader><CardTitle>Sign in to Samagama Saarthi</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-4">
            <Input type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input type="password" placeholder="Password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Button className="w-full" disabled={m.isPending}>Sign in</Button>
          </form>
          <div className="mt-4 flex justify-between text-sm">
            <Link to="/forgot-password" className="text-brand hover:underline">Forgot password?</Link>
            <Link to="/register" className="text-brand hover:underline">Create account</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
