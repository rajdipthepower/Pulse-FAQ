import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PALETTE = ['#4338CA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#64748B', '#F97316'];

export default function Admin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await api.get('/analytics/overview')).data,
  });
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data,
  });

  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) =>
      (await api.patch(`/users/${id}/role`, { role })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Role updated'); },
  });

  if (!data) return <div className="container py-10 text-sm text-slate-500">Loading…</div>;

  return (
    <div className="container py-10 space-y-8">
      <h1 className="font-display text-3xl text-brand-800 dark:text-white">Admin Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(data.totals).map(([k, v]) => (
          <Card key={k}><CardContent className="p-5">
            <div className="text-xs uppercase text-slate-500">{k}</div>
            <div className="font-display text-3xl text-brand-800 dark:text-white">{v as number}</div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>User growth (30d)</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer><LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4338CA" strokeWidth={2} />
            </LineChart></ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>FAQ growth (30d)</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer><BarChart data={data.faqGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart></ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Most active categories</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer><PieChart>
              <Pie data={data.topCategories} dataKey="count" nameKey="name" outerRadius={100} label>
                {data.topCategories.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart></ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top contributors</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.topContributors.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between rounded-lg bg-white/60 p-3 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand to-secondary text-white">{u.name[0]}</div>
                  <div>
                    <div className="text-sm font-medium text-ink dark:text-white">{u.name}</div>
                    <Badge>{u.role}</Badge>
                  </div>
                </div>
                <div className="text-sm font-display text-brand-800 dark:text-white">{u.reputation}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>User & Role Management</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Reputation</th><th></th></tr>
            </thead>
            <tbody>
              {(usersData?.users ?? []).map((u: any) => (
                <tr key={u._id} className="border-t border-slate-100 dark:border-white/5">
                  <td className="py-3">{u.name}</td>
                  <td className="text-slate-500">{u.email}</td>
                  <td><Badge>{u.role}</Badge></td>
                  <td>{u.reputation}</td>
                  <td className="text-right">
                    <select defaultValue={u.role}
                      onChange={(e) => setRole.mutate({ id: u._id, role: e.target.value })}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:bg-white/5 dark:border-white/10 dark:text-white">
                      {['student', 'faculty', 'moderator', 'admin'].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
