'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatKm } from '@/lib/format';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, Tag, Star, ChevronLeft, ChevronRight, Info, ShieldCheck, Award, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type FeedItem = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  category: string;
  condition: 'novo' | 'semi' | 'pecas';
  price_cents: number;
  images: string[];
  photos_count: number;
  distance_km: number | null;
};

const DRAG_THRESHOLD = 120;

export default function ExplorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [index, setIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const current = feed[index] ?? null;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }
      const { data, error } = await supabase.rpc('get_feed', { p_limit: 40 });
      if (error) toast.error('Não foi possível carregar o feed');
      setFeed(data ?? []);
      setLoading(false);
    })();
  }, [router]);

  async function like(item: FeedItem) {
    try {
      const { data, error } = await supabase.rpc('like_and_open_chat', { p_listing_id: item.id });
      if (error) throw error;
      confettiLight();
      toast.success('Match! Abrindo chat…');
      setFeed((prev) => prev.filter((x) => x.id !== item.id));
      router.push(`/chat/${data}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha ao criar chat');
    }
  }

  async function pass(item: FeedItem) {
    try {
      await supabase.rpc('pass_listing', { p_listing_id: item.id });
      toast.message('Ignorado');
      setFeed((prev) => prev.filter((x) => x.id !== item.id));
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha ao ignorar');
    }
  }

  function likeIfCurrent() { if (current) like(current); }
  function passIfCurrent() { if (current) pass(current); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') likeIfCurrent();
      if (e.key === 'ArrowLeft') passIfCurrent();
      if (e.key.toLowerCase() === 'l') likeIfCurrent();
      if (e.key.toLowerCase() === 'h') passIfCurrent();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current]);

  if (loading) {
    return <main className="min-h-[60vh] grid place-items-center"><div className="text-sm text-[#9CA3AF]">Carregando feed…</div></main>;
  }

  return (
    <main className="min-h-[calc(100vh-56px)] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-5">
          <div className="text-xl font-semibold">Explorar</div>
          <button
            onClick={() => setShowHelp((v) => !v)}
            className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#1D2430] hover:bg-[#11151d]"
          >
            <Info size={14} /> Dicas
          </button>
        </div>

        {showHelp && (
          <div className="mb-4 text-xs text-[#9CA3AF] rounded-2xl border border-[#1D2430] p-3">
            Arraste: ⬅️ ignorar • ➡️ curtir. Use ⬅️/➡️ ou H/L. Match abre o chat na hora.
          </div>
        )}

        <div className="relative h-[620px]">
          <AnimatePresence initial={false} mode="popLayout">
            {current ? (
              <SwipeCard
                key={current.id}
                item={current}
                onLike={() => like(current)}
                onPass={() => pass(current)}
              />
            ) : (
              <div className="h-full grid place-items-center rounded-[28px] border border-[#1D2430] bg-[#0F131A]/60 backdrop-blur-xl">
                <div className="text-center">
                  <div className="text-sm">Acabou por aqui 👀</div>
                  <div className="text-xs text-[#9CA3AF] mt-1">Ajuste suas preferências ou volte mais tarde.</div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function SwipeCard({ item, onLike, onPass }: { item: FeedItem; onLike: () => void; onPass: () => void; }) {
  const [imgIndex, setImgIndex] = useState(0);
  const img = item.images?.[imgIndex] ?? '/placeholder.png';

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const likeOpacity = useTransform(x, [40, 160], [0, 1]);    // badge like
  const passOpacity = useTransform(x, [-160, -40], [1, 0]);  // badge pass
  // glow verde/vermelho nas bordas conforme direção
  const glowLike = useTransform(x, [0, 160], [0, 1]);
  const glowPass = useTransform(x, [-160, 0], [1, 0]);

  function endDrag(_: any, info: { offset: { x: number } }) {
    const dx = info.offset.x;
    if (dx > DRAG_THRESHOLD) onLike();
    else if (dx < -DRAG_THRESHOLD) onPass();
  }

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={endDrag}
      className="absolute inset-0 rounded-[28px] border border-[#1D2430] overflow-hidden bg-[#0F131A]/60 backdrop-blur-xl shadow-[0_30px_120px_-40px_rgba(37,99,235,0.45)]"
    >
      {/* borda com glow: verde à direita, vermelho à esquerda */}
      <motion.div
        style={{ opacity: glowLike }}
        className="pointer-events-none absolute inset-0 ring-2 ring-emerald-500/40 rounded-[28px]"
      />
      <motion.div
        style={{ opacity: glowPass }}
        className="pointer-events-none absolute inset-0 ring-2 ring-rose-500/40 rounded-[28px]"
      />

      {/* labels — LIKE à esquerda, PASS à direita (melhor leitura no mobile quando arrasta pra fora) */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-5 left-5 z-20">
        <span className="px-3 py-1 rounded-xl bg-emerald-600/25 text-emerald-300 border border-emerald-700/40 text-xs">CURTIR</span>
      </motion.div>
      <motion.div style={{ opacity: passOpacity }} className="absolute top-5 right-5 z-20">
        <span className="px-3 py-1 rounded-xl bg-rose-600/25 text-rose-300 border border-rose-700/40 text-xs">PASSAR</span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] h-full">
        {/* IMAGEM */}
        <div className="relative">
          <img src={img} alt={item.title} className="h-full w-full object-cover" />
          {item.images?.length > 1 && (
            <>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                <button onClick={() => setImgIndex((i) => Math.max(0, i - 1))} className="h-9 w-9 rounded-xl border border-[#1D2430] bg-[#0B0E12]/80 grid place-items-center">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setImgIndex((i) => Math.min(item.images.length - 1, i + 1))} className="h-9 w-9 rounded-xl border border-[#1D2430] bg-[#0B0E12]/80 grid place-items-center">
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {item.images.map((_, i) => (
                  <span key={i} className={`h-1.5 w-6 rounded-full ${i === imgIndex ? 'bg-white/90' : 'bg-white/30'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* INFO */}
        <div className="p-5 sm:p-7 flex flex-col">
          <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
            <Award size={14} /> Anúncio bem descrito • <ShieldCheck size={14} /> Vendedor verificado (demo)
          </div>

          <div className="text-2xl font-semibold mt-2">{item.title}</div>
          <div className="text-[#9CA3AF] text-sm mt-1">{item.category} • {labelCond(item.condition)}</div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-[#1D2430] bg-[#0B0E12]">
              <Tag size={14} /> {formatPrice(item.price_cents)}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-[#1D2430] bg-[#0B0E12]">
              <MapPin size={14} /> {formatKm(item.distance_km)}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-[#1D2430] bg-[#0B0E12]">
              <Star size={14} /> {item.photos_count} fotos
            </span>
          </div>

          {item.description && <p className="text-sm text-[#B2B7BE] mt-4 line-clamp-6">{item.description}</p>}

          {/* BOTÕES MINIMALISTAS: só ícones (X vermelho, ✓ verde) */}
          <div className="mt-auto pt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => onPass()}
              className="h-12 w-12 rounded-full grid place-items-center bg-rose-600 hover:bg-rose-500 transition"
              aria-label="Passar"
            >
              <X size={20} className="text-white" />
            </button>
            <button
              onClick={() => onLike()}
              className="h-14 w-14 rounded-full grid place-items-center bg-emerald-600 hover:bg-emerald-500 transition shadow-[0_10px_40px_-15px_rgba(16,185,129,0.6)]"
              aria-label="Curtir & Conversar"
            >
              <Check size={22} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function labelCond(c: 'novo'|'semi'|'pecas') {
  if (c === 'semi') return 'seminovo';
  if (c === 'pecas') return 'peças';
  return 'novo';
}

function confettiLight() {
  try {
    // @ts-ignore
    import('canvas-confetti').then((m) => m.default({ particleCount: 90, spread: 70, origin: { y: 0.3 } }));
  } catch {}
}
