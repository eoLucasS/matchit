'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import {
  Mail, Lock, Eye, EyeOff, LogIn, UserPlus,
  ShieldCheck, MessageSquare, MapPin, Zap, Stars
} from 'lucide-react';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'Mínimo de 6 caracteres.'),
});
type FormData = z.infer<typeof schema>;

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [reveal, setReveal] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Se já estiver logado, decide destino pela flag onboarded
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.onboarded) router.replace('/');
      else router.replace('/onboarding');
    })();
  }, [router]);

  useEffect(() => {
    const m = params.get('mode');
    if (m === 'signup' || m === 'login') setMode(m);
  }, [params]);

  async function onSubmit(values: FormData) {
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;

        // Se a sessão não vier (depende da config de confirmação), tenta login imediato
        if (!data?.session) {
          await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          }).catch(() => null);
        }

        toast.success('Conta criada! Vamos personalizar seu feed.');
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.25 } });
        router.push('/onboarding');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;

        // Decide destino com base no onboarded
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth'); return; }

        const { data, error: err2 } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('user_id', user.id)
          .maybeSingle();

        if (err2) {
          toast.info('Login ok. Redirecionando…');
          router.push('/');
          return;
        }
        if (data?.onboarded) {
          toast.success('Login realizado. Bem-vindo(a) de volta!');
          router.push('/');
        } else {
          toast.info('Vamos terminar sua personalização rapidinho.');
          router.push('/onboarding');
        }
      }
    } catch (e: any) {
      const msg =
        e?.message?.includes('Invalid login credentials')
          ? 'Credenciais inválidas.'
          : e?.message || 'Falha na autenticação.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const title = useMemo(
    () => (mode === 'signup' ? 'Criar conta' : 'Bem-vindo(a) de volta'),
    [mode]
  );
  const ctaText = useMemo(
    () => (mode === 'signup' ? 'Criar conta' : 'Entrar'),
    [mode]
  );
  const switchText = useMemo(
    () => (mode === 'signup' ? 'Já tem conta? Entrar' : 'Novo por aqui? Criar conta'),
    [mode]
  );

  return (
    <main className="min-h-screen w-full grid place-items-center px-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#1D2430] bg-[#0F131A]/70 backdrop-blur-xl shadow-[0_20px_120px_-30px_rgba(37,99,235,0.35)]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* ESQUERDA — FORM */}
          <div className="p-6 sm:p-10">
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

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold">{title}</h1>
              <p className="text-sm text-[#9CA3AF]">Acesse sua conta ou crie uma nova para começar.</p>
            </div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">E-mail</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    placeholder="voce@exemplo.com"
                    className="w-full h-12 rounded-2xl bg-[#0B0E12] border border-[#1D2430] pl-10 pr-3 outline-none focus:ring-2 focus:ring-[#2563EB]/35"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Senha</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    <Lock size={18} />
                  </span>
                  <input
                    type={reveal ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full h-12 rounded-2xl bg-[#0B0E12] border border-[#1D2430] pl-10 pr-10 outline-none focus:ring-2 focus:ring-[#2563EB]/35"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#E5E7EB] transition"
                    aria-label={reveal ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {reveal ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 transition inline-flex items-center justify-center gap-2 shadow-[0_12px_40px_-16px_rgba(37,99,235,0.6)]"
                >
                  {mode === 'signup' ? <UserPlus size={18} /> : <LogIn size={18} />}
                  {submitting ? (mode === 'signup' ? 'Cadastrando...' : 'Entrando...') : ctaText}
                </button>
              </div>

              {/* Switch mode (sem 2 botões) */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode((m) => (m === 'signup' ? 'login' : 'signup'))}
                  className="text-sm text-[#9CA3AF] hover:text-[#E5E7EB] underline underline-offset-4"
                >
                  {switchText}
                </button>
              </div>
            </motion.form>

            {/* rodapé pequeno */}
            <p className="text-[11px] text-[#9CA3AF] mt-6">
              Ao continuar, você concorda com nossos termos e política de privacidade.
            </p>
          </div>

          {/* DIREITA — PAINEL DE VALOR / ARTE */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_70%_20%,rgba(37,99,235,0.28),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_80%,rgba(6,182,212,0.22),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,14,18,0)_0%,rgba(11,14,18,0.55)_100%)]" />
            </div>

            <div className="relative h-full p-10 flex flex-col justify-between">
              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="text-3xl font-semibold"
                >
                  Encontre <span className="text-[#06B6D4]">hardware</span> perto de você,
                  em poucos swipes.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.12 }}
                  className="mt-3 text-[#B2B7BE]"
                >
                  Match instantâneo, chat em tempo real e checklist técnico para comprar
                  e vender com confiança.
                </motion.p>

                <div className="mt-8 space-y-4">
                  <Feature
                    icon={<MapPin size={18} />}
                    title="Proximidade real"
                    desc="Priorizamos itens perto, com geolocalização aproximada (LGPD)."
                  />
                  <Feature
                    icon={<MessageSquare size={18} />}
                    title="Chat ao vivo"
                    desc="Conversa instantânea após o match — sem refresh."
                  />
                  <Feature
                    icon={<ShieldCheck size={18} />}
                    title="Confiança"
                    desc="Checklist técnico, denúncias e score do vendedor."
                  />
                  <Feature
                    icon={<Zap size={18} />}
                    title="Experiência premium"
                    desc="Microinterações e performance para mobile e desktop."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-xl bg-[#0B0E12] border border-[#1D2430] grid place-items-center shrink-0">
        <span className="text-[#E5E7EB]">{icon}</span>
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-[#9CA3AF]">{desc}</div>
      </div>
    </div>
  );
}
