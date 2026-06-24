import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, X, Maximize2, Minimize2, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/cn';

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'How do I find FAQs about scholarships?',
  'Suggest a category and tags for my placement question.',
  'Summarise the most upvoted research FAQs.',
  'Tips for writing a strong Statement of Purpose.',
];

export function ProfessorChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Greetings. I am **Professor Dr. Sudarshan**, your academic guide on Samagama Saarthi. How may I help you today?" },
  ]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { scroller.current?.scrollTo({ top: 1e9, behavior: 'smooth' }); }, [messages, open]);

  const send = useMutation({
    mutationFn: async (next: Msg[]) => (await api.post('/ai/chat', { messages: next })).data.message as Msg,
    onSuccess: (m) => setMessages((prev) => [...prev, m]),
  });

  const submit = (text: string) => {
    if (!text.trim()) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    send.mutate(next);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand to-secondary text-white shadow-glass transition-transform hover:scale-105"
        aria-label="Open Professor Dr. Sudarshan"
      >
        <MessageCircle />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden rounded-2xl glass shadow-glass border-white/60',
        full ? 'inset-4 md:inset-10' : 'bottom-6 right-6 h-[560px] w-[380px]'
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/40 p-3 dark:border-white/10">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand to-secondary text-white">
          <Sparkles size={18} />
        </div>
        <div className="flex-1">
          <div className="font-display text-sm text-brand-800 dark:text-white">Professor Dr. Sudarshan</div>
          <div className="text-[11px] text-slate-500">Academic Mentor & Knowledge Guide</div>
        </div>
        <button onClick={() => setFull((v) => !v)} className="p-2 text-slate-500 hover:text-brand">
          {full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button onClick={() => setOpen(false)} className="p-2 text-slate-500 hover:text-brand">
          <X size={16} />
        </button>
      </div>

      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-brand text-white rounded-br-sm'
                  : 'bg-white/80 text-ink dark:bg-white/10 dark:text-slate-100 rounded-bl-sm'
              )}
            >
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {send.isPending && (
          <div className="flex gap-1 px-2 text-slate-400">
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand"></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:120ms]"></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:240ms]"></span>
          </div>
        )}
      </div>

      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50 dark:border-white/10 dark:text-brand-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="flex gap-2 border-t border-white/40 p-3 dark:border-white/10"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={user ? 'Ask the Professor…' : 'Sign in to chat with the Professor'}
          disabled={!user}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none dark:bg-white/5 dark:border-white/10 dark:text-white"
        />
        <button
          type="submit"
          disabled={!user || send.isPending}
          className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
