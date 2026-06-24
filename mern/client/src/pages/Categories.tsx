import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

export default function Categories() {
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.categories,
  });
  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl text-brand-800 dark:text-white mb-8">All categories</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {(data ?? []).map((c: any) => (
          <Link key={c._id} to={`/faqs?category=${c._id}`}>
            <Card className="h-full transition hover:-translate-y-0.5">
              <CardContent>
                <div className="h-10 w-10 rounded-xl grid place-items-center font-bold"
                  style={{ background: c.color + '22', color: c.color }}>{c.name[0]}</div>
                <div className="mt-3 font-display text-lg text-brand-800 dark:text-white">{c.name}</div>
                <div className="text-xs text-slate-500">{c.description || 'Explore FAQs in this category.'}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
