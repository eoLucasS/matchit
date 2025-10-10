'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock, UserCircle, Stars, ArrowLeft, ArrowRight } from 'lucide-react';

type ChatRow = {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_image: string;
  other_user_id: string;
  other_display_name: string | null;
  last_message: string | null;
  last_at: string | null;
  status: 'open'|'reserved'|'sold';
};

export default function ChatListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ChatRow[]>([]);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }
      const { data } = await supabase.rpc('get_my_chats');
      setRows(data ?? []);
      setLoading(false);
    })();
  }, [router]);

  function scrollBy(delta: number) {
    const el = railRef.current;
    if (!el) return;
    el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' });
  }

  if (loading) {
    return <main className="min-h-[60vh] grid place-items-center"><div className="text-sm text-[#9CA3AF]">Carregando…</div></main>;
  }

  return (
    <main className="min-h-[calc(100vh-56px)] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] text-white grid place-items-center"><Stars size={16}/></span>
            <div className="text-xl font-semibold">Seus chats</div>
          </div>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scrollBy(-400)} className="h-9 w-9 rounded-xl border border-[#1D2430] hover:bg-[#11151d] grid place-items-center">
              <ArrowLeft size={16} />
            </button>
            <button onClick={() => scrollBy(400)} className="h-9 w-9 rounded-xl border border-[#1D2430] hover:bg-[#11151d] grid place-items-center">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-[#1D2430] p-6 text-sm text-[#9CA3AF]">
            Nenhum chat ainda. Dê uma olhada em <a href="/explorar" className="underline">Explorar</a>.
          </div>
        ) : (
          <div
            ref={railRef}
            className="horizontal-scroll overflow-x-auto snap-x snap-mandatory flex gap-4 pb-2"
          >
            {rows.map((r) => (
              <button
                key={r.id}
                onClick={() => router.push(`/chat/${r.id}`)}
                className="snap-start shrink-0 w-[280px] text-left rounded-2xl border border-[#1D2430] overflow-hidden bg-[#0F131A]/60 hover:bg-[#0F131A] transition shadow-[0_10px_50px_-30px_rgba(37,99,235,0.35)]"
              >
                <img src={r.listing_image || '/placeholder.png'} alt="" className="h-[150px] w-full object-cover" />
                <div className="p-3">
                  <div className="text-sm font-medium line-clamp-1">{r.listing_title}</div>
                  <div className="text-xs text-[#9CA3AF] flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1"><UserCircle size={14} />{r.other_display_name ?? 'Usuário'}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare size={14} />{r.last_message ?? '—'}</span>
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] inline-flex items-center gap-1 mt-1">
                    <Clock size={12} /> {r.last_at ? new Date(r.last_at).toLocaleString('pt-BR') : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
