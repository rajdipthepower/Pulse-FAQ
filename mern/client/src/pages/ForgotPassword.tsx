import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const m = useMutation({
    mutationFn: async () => (await api.post('/auth/forgot-password', { email })).data,
    onSuccess: (d) => toast.success(d.devToken ? `Dev token: ${d.devToken}` : 'If the email exists, a reset link was sent.'),
  });
  return (
    <div className="container max-w-md py-20">
      <Card>
        <CardHeader><CardTitle>Forgot password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-4">
            <Input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button className="w-full" disabled={m.isPending}>Send reset link</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
