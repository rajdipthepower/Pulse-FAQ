import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container max-w-md py-20 text-center">
      <div className="font-display text-7xl text-brand-800 dark:text-white">404</div>
      <p className="mt-3 text-slate-600 dark:text-slate-300">This page could not be found.</p>
      <Button className="mt-6" asChild><Link to="/">Back to home</Link></Button>
    </div>
  );
}
