export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200/70 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-display text-xl text-brand-800 dark:text-white">Samagama Saarthi</div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Connecting Questions, Knowledge, and Communities.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink dark:text-white mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Browse FAQs</li><li>Ask a Question</li><li>Categories</li><li>Trending</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink dark:text-white mb-3">Community</h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Contributors</li><li>Guidelines</li><li>Faculty Verified</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink dark:text-white mb-3">Mentor</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Meet <span className="text-brand-700 dark:text-brand-200 font-medium">Professor Dr. Sudarshan</span> — your AI academic guide.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200/70 dark:border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Samagama Saarthi. All rights reserved.
      </div>
    </footer>
  );
}
