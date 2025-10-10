'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Send, ArrowLeft, Loader2, Stars } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';

type Chat = {
  id: string;
  listing_id: string;
  status: 'open'|'reserved'|'sold';
  buyer_id: string;
  seller_id: string;
};

type DbMessage = {
  id: number; // PK no banco
  chat_id: string;
  sender_id: string;
  content: string;
  type: 'text'|'image'|'system';
  created_at: string;
};

// Mensagem que a UI usa (pode ter localId para otimista)
type UiMessage = DbMessage & { localId?: string };

export default function ChatPage() {
  const { id: chatId } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<Chat | null>(null);
  const [me, setMe] = useState<string>('');
  const [msgs, setMsgs] = useState<UiMessage[]>([]);
  const [input, setInput] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<any>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollRef = useRef<any>(null);
  const lastAtRef = useRef<string>('1970-01-01T00:00:00.000Z'); // cursor de polling

  // helpers
  function scrollBottom() {
    // leve timeout para permitir render
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }

  function sortAscByDate(list: UiMessage[]) {
    return [...list].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  }

  function uniqueById(list: UiMessage[]) {
    const seen = new Set<string>();
    const result: UiMessage[] = [];
    for (const m of list) {
      const key = m.id ? String(m.id) : `local:${m.localId}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(m);
      }
    }
    return result;
  }

  async function loadInitial(userId: string) {
    // carrega chat
    const { data: c } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .maybeSingle<Chat>();
    if (!c) { router.replace('/chat'); return; }
    setChat(c);

    // carrega mensagens
    const { data: m } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true }) as { data: DbMessage[] | null };

    const initial = (m ?? []).map<UiMessage>((x) => ({ ...x }));
    setMsgs(initial);
    // atualiza cursor
    const lastCreated = initial.at(-1)?.created_at;
    if (lastCreated) lastAtRef.current = lastCreated;
    setLoading(false);
    scrollBottom();

    // realtime: só INSERT (evita duplicar update/delete)
    const ch = supabase.channel(`chat:${chatId}`, { config: { broadcast: { self: true } } });

    ch.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      (payload) => {
        const row = payload.new as any as DbMessage;

        // se fui EU que enviei, ignoro aqui (minha UI já tratou otimista + insert)
        if (row.sender_id === userId) return;

        setMsgs((prev) => {
          const merged = uniqueById(sortAscByDate([...prev, row]));
          // atualiza cursor
          const last = merged.at(-1)?.created_at;
          if (last) lastAtRef.current = last;
          return merged;
        });
        scrollBottom();
      }
    );

    ch.on('broadcast', { event: 'typing' }, (payload) => {
      const uid = (payload?.payload as any)?.user_id;
      if (!uid || uid === userId) return;
      setOtherTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setOtherTyping(false), 1800);
    });

    ch.subscribe();
    channelRef.current = ch;

    // polling de segurança (2s) — usa cursor atualizado (lastAtRef)
    pollRef.current = setInterval(async () => {
      const since = lastAtRef.current ?? '1970-01-01T00:00:00.000Z';
      const { data: latest } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .gt('created_at', since)
        .order('created_at', { ascending: true }) as { data: DbMessage[] | null };

      if (latest && latest.length) {
        setMsgs((prev) => {
          const merged = uniqueById(sortAscByDate([...prev, ...latest]));
          const last = merged.at(-1)?.created_at;
          if (last) lastAtRef.current = last;
          return merged;
        });
        scrollBottom();
      }
    }, 2000);
  }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }
      setMe(user.id);
      await loadInitial(user.id);
    })();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      clearTimeout(typingTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // mantém o cursor sempre no último created_at real do estado
  useEffect(() => {
    const last = msgs.at(-1)?.created_at;
    if (last) lastAtRef.current = last;
  }, [msgs]);

  function onTyping() {
    if (!channelRef.current) return;
    channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { user_id: me, at: Date.now() } });
  }

  async function send() {
    const text = input.trim();
    if (!text || !chat) return;

    // UI otimista com localId (chave única segura pro React)
    const localId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
    const optimistic: UiMessage = {
      id: 0, // 0 indica "ainda sem id do banco"
      localId,
      chat_id: chat.id,
      sender_id: me,
      content: text,
      type: 'text',
      created_at: new Date().toISOString(),
    };
    setMsgs((prev) => uniqueById(sortAscByDate([...prev, optimistic])));
    setInput('');
    scrollBottom();

    // insert real
    const { data, error } = await supabase
      .from('messages')
      .insert({ chat_id: chat.id, sender_id: me, content: text, type: 'text' })
      .select('*')
      .single<DbMessage>();

    if (error || !data) {
      // reverte a otimista se falhar
      setMsgs((prev) => prev.filter((m) => m.localId !== localId));
      return;
    }

    // troca a otimista pelo registro real
    setMsgs((prev) => {
      const semOptimistic = prev.filter((m) => m.localId !== localId);
      const merged = uniqueById(sortAscByDate([...semOptimistic, data]));
      const last = merged.at(-1)?.created_at;
      if (last) lastAtRef.current = last;
      return merged;
    });
  }

  if (loading || !chat) {
    return <main className="min-h-[60vh] grid place-items-center"><div className="text-sm text-[#9CA3AF]">Carregando chat…</div></main>;
  }

  const statusLabel = chat.status === 'open' ? 'Conversando' : chat.status === 'reserved' ? 'Reservado' : 'Vendido';
  const statusClass =
    chat.status === 'open' ? 'bg-emerald-600/20 text-emerald-300 border-emerald-700/40'
    : chat.status === 'reserved' ? 'bg-amber-600/20 text-amber-300 border-amber-700/40'
    : 'bg-sky-600/20 text-sky-300 border-sky-700/40';

  return (
    <main className="min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-6xl h-[calc(100vh-56px)] grid grid-rows-[56px_1fr_64px] md:grid-cols-[1.2fr_2fr] md:grid-rows-[56px_1fr] gap-0">
        {/* Header */}
        <div className="col-span-full px-4 h-14 border-b border-[#1D2430] flex items-center justify-between sticky top-[56px] bg-[#0B0E12]/80 backdrop-blur-xl">
          <button onClick={() => router.push('/chat')} className="h-9 px-3 rounded-xl border border-[#1D2430] hover:bg-[#11151d] inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="inline-flex items-center gap-2 text-sm">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] text-white grid place-items-center"><Stars size={16}/></span>
            <span className={`px-2 py-0.5 rounded-xl text-xs border ${statusClass}`}>{statusLabel}</span>
          </div>
          <div />
        </div>

        {/* Lateral (placeholder) */}
        <aside className="hidden md:block border-r border-[#1D2430] p-4 bg-[#0B0E12]/40">
          <div className="text-sm text-[#9CA3AF]">Resumo do anúncio (em breve): fotos, preço, ações (reservar/vender).</div>
        </aside>

        {/* Mensagens */}
        <section className="overflow-y-auto px-4 py-3 space-y-4 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.14),transparent_55%)]">
          {msgs.map((m) => {
            const mine = m.sender_id === me;
            const sys = m.type === 'system';
            const key = m.localId ?? String(m.id);
            return (
              <div key={key} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                  sys
                    ? 'text-[#9CA3AF]'
                    : mine
                      ? 'bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] text-white shadow-[0_10px_40px_-20px_rgba(37,99,235,0.6)]'
                      : 'bg-[#0F131A]/70 border border-[#1D2430] backdrop-blur'
                }`}>
                  {m.content}
                  <div className={`text-[10px] mt-1 ${sys ? 'text-[#6b7280]' : (mine ? 'text-white/80' : 'text-[#9CA3AF]')}`}>
                    {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          {otherTyping && (
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <Loader2 size={14} className="animate-spin" /> digitando…
            </div>
          )}
          <div ref={bottomRef} />
        </section>

        {/* Composer */}
        <div className="col-span-full px-4 py-3 border-t border-[#1D2430] bg-[#0B0E12]/80 backdrop-blur-xl sticky bottom-0 md:static">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => { setInput(e.target.value); onTyping(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder="Escreva sua mensagem…"
              className="flex-1 h-11 rounded-2xl bg-[#0F131A] border border-[#1D2430] px-3 outline-none"
            />
            <button onClick={send} className="h-11 px-4 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] hover:brightness-110 inline-flex items-center gap-2">
              <Send size={16} /> Enviar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
