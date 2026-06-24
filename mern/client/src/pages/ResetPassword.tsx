import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');

  const m = useMutation({
    mutationFn: async () => (await api.post('/auth/reset-password', { token, password })).data,
    onSuccess: () => { toast.success('Password updated'); nav('/login'); },
    onError: (e: any) => toast.error(e?.response?.data?.error || 'Reset failed'),
  });

  return (
    <div className="container max-w-md py-20">
      <Card>
        <CardHeader><CardTitle>Reset password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-4">
            <Input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} required />
            <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <Button className="w-full" disabled={m.isPending}>Update password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
