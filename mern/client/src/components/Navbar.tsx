import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, LogOut, Moon, Sun, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useTheme } from '@/store/theme';
import { Button } from './ui/button';

export function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/40 dark:border-white/10">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-secondary text-white shadow-glass">
            <BookOpen size={18} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg text-brand-800 dark:text-white">Samagama Saarthi</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Knowledge · Community
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {[
            ['Browse', '/faqs'],
            ['Ask', '/ask'],
            ['Categories', '/categories'],
            ['Dashboard', '/dashboard'],
          ].map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-brand-700 dark:text-brand-200' : 'text-slate-600 hover:text-brand dark:text-slate-300'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell size={18} />
              </Button>
              <Link to={`/profile/${user.id}`} className="hidden sm:flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm text-brand-800 dark:bg-white/10 dark:text-white">
                <UserIcon size={14} /> {user.name.split(' ')[0]}
              </Link>
              <Button variant="outline" size="sm" onClick={() => { logout(); nav('/'); }}>
                <LogOut size={14} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
              <Button asChild><Link to="/register">Join</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
