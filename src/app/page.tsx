'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Compass, Store, User, LogOut, Stars } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ProfileHead = {
  display_name: string | null;
  is_seller: boolean | null;
};

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);
  const [head, setHead] = useState<ProfileHead>({ display_name: null, is_seller: null });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setLogged(true);
        const { data } = await supabase
          .from('profiles')
          .select('display_name, is_seller')
          .eq('user_id', user.id)
          .maybeSingle<ProfileHead>();
        setHead({ display_name: data?.display_name ?? null, is_seller: !!data?.is_seller });
      } else {
        setLogged(false);
        setHead({ display_name: null, is_seller: null });
      }
      setLoading(false);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/auth');
  }

  return (
    <main className="min-h-screen w-full grid place-items-center px-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#1D2430] bg-[#0F131A]/70 backdrop-blur-xl shadow-[0_20px_120px_-30px_rgba(37,99,235,0.35)]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* ESQUERDA — HERO */}
          <div className="p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-[#2563EB] grid place-items-center">
                  <Stars size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold">MatchIT</div>
                  <div className="text-xs text-[#9CA3AF]">Marketplace de hardware com swipe + chat ao vivo</div>
                </div>
              </div>
            </div>

            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-3xl sm:text-4xl font-semibold">
              {logged ? (
                <>Olá{head.display_name ? `, ${head.display_name}` : ''} — bora achar negócio perto de você?</>
              ) : (
                <>Compre e venda <span className="text-[#06B6D4]">hardware de TI</span> em poucos swipes.</>
              )}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }} className="mt-3 text-[#B2B7BE]">
              {logged
                ? 'Seu feed prioriza distância e qualidade. Faça um match e o chat abre na hora.'
                : 'Priorize itens perto de casa, com checklist técnico e conversa imediata após o match.'}
            </motion.p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              {loading ? null : logged ? (
                <>
                  <a href="/explorar" className="h-11 px-5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] transition inline-flex items-center gap-2">
                    <Compass size={18} /> Explorar
                  </a>

                  {head.is_seller ? (
                    <a href="/sell" className="h-11 px-5 rounded-2xl border border-[#1D2430] hover:bg-[#11151d] transition inline-flex items-center gap-2">
                      <Store size={18} /> Vender
                    </a>
                  ) : (
                    <a href="/profile" className="h-11 px-5 rounded-2xl border border-[#1D2430] hover:bg-[#11151d] transition inline-flex items-center gap-2">
                      <User size={18} /> Ativar modo vendedor
                    </a>
                  )}

                  <a href="/profile" className="h-11 px-5 rounded-2xl border border-[#1D2430] hover:bg-[#11151d] transition inline-flex items-center gap-2">
                    <User size={18} /> Perfil
                  </a>

                  <button onClick={logout} className="h-11 px-5 rounded-2xl border border-[#1D2430] hover:bg-[#11151d] transition inline-flex items-center gap-2">
                    <LogOut size={18} /> Sair
                  </button>
                </>
              ) : (
                <>
                  <a href="/auth?mode=login" className="h-11 px-5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] transition inline-flex items-center gap-2">
                    <LogIn size={18} /> Entrar
                  </a>
                  <a href="/auth?mode=signup" className="h-11 px-5 rounded-2xl border border-[#1D2430] hover:bg-[#11151d] transition inline-flex items-center gap-2">
                    <UserPlus size={18} /> Criar conta
                  </a>
                </>
              )}
            </div>
          </div>

          {/* DIREITA — ARTE/GRADIENTE */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_70%_20%,rgba(37,99,235,0.28),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_80%,rgba(6,182,212,0.22),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,14,18,0)_0%,rgba(11,14,18,0.55)_100%)]" />
            </div>
            <div className="relative h-full p-10" />
          </div>
        </div>
      </div>
    </main>
  );
}
