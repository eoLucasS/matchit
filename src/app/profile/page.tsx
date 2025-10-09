'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  User as UserIcon,
  AtSign,
  Phone,
  ShieldCheck,
  Store,
  LogOut,
  MapPin,
  Target,
  Check,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

const schema = z.object({
  display_name: z.string().min(2, 'Mínimo 2 caracteres').max(40, 'Máximo 40'),
  full_name: z.string().max(120, 'Máximo 120').optional().or(z.literal('')),
  phone: z.string().max(32, 'Máximo 32').optional().or(z.literal('')),
  is_seller: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

type ProfileDB = {
  display_name: string | null;
  full_name: string | null;
  phone: string | null;
  is_seller: boolean | null;
  interests: string[] | null;
  preferred_conditions: string[] | null;
  radius_km: number | null;
  location: unknown | null;
  onboarded: boolean | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>('');
  const [avatarSeed, setAvatarSeed] = useState<string>('U');

  const [prefs, setPrefs] = useState<{
    interests: string[];
    conditions: string[];
    radius: number | null;
    hasLocation: boolean;
    onboarded: boolean;
  }>({
    interests: [],
    conditions: [],
    radius: null,
    hasLocation: false,
    onboarded: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: '',
      full_name: '',
      phone: '',
      is_seller: false,
    },
    mode: 'onBlur',
  });

  const displayNameLive = watch('display_name');

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) { router.replace('/auth'); return; }
      setEmail(user.email ?? '');
      setAvatarSeed(getInitialsFrom(user.email ?? ''));

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, full_name, phone, is_seller, interests, preferred_conditions, radius_km, location, onboarded')
        .eq('user_id', user.id)
        .maybeSingle<ProfileDB>();

      if (error || !data) {
        toast.error('Não foi possível carregar seu perfil.');
        setLoading(false);
        return;
      }

      reset({
        display_name: data.display_name ?? '',
        full_name: data.full_name ?? '',
        phone: data.phone ?? '',
        is_seller: !!data.is_seller,
      });

      setPrefs({
        interests: data.interests ?? [],
        conditions: data.preferred_conditions ?? [],
        radius: data.radius_km ?? null,
        hasLocation: !!data.location,
        onboarded: !!data.onboarded,
      });

      setLoading(false);
    })();
  }, [reset, router]);

  useEffect(() => {
    if (displayNameLive) setAvatarSeed(getInitialsFrom(displayNameLive));
  }, [displayNameLive]);

  async function onSubmit(values: FormData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Sua sessão expirou. Entre novamente.'); router.replace('/auth'); return; }

      const payload = {
        display_name: values.display_name,
        full_name: values.full_name || null,
        phone: values.phone || null,
        is_seller: values.is_seller,
      };

      const { error } = await supabase.from('profiles').update(payload).eq('user_id', user.id);
      if (error) throw error;

      toast.success('Perfil atualizado!');
      reset(values);
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha ao salvar perfil');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/auth');
  }

  const statusItems = useMemo(() => ([
    { icon: <ShieldCheck size={16} />, label: prefs.onboarded ? 'Onboarding concluído' : 'Onboarding pendente', ok: prefs.onboarded },
    { icon: <MapPin size={16} />, label: prefs.hasLocation ? 'Localização configurada' : 'Sem localização', ok: prefs.hasLocation },
    { icon: <Target size={16} />, label: prefs.radius != null ? `Raio: ${prefs.radius} km` : 'Raio não definido', ok: prefs.radius != null },
  ]), [prefs]);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="text-sm text-[#9CA3AF]">Carregando perfil...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#1D2430] bg-[#0F131A]/70 backdrop-blur-xl shadow-[0_20px_120px_-30px_rgba(37,99,235,0.35)]">
        {/* MOBILE HEADER */}
        <div className="flex items-center gap-3 p-4 sm:hidden border-b border-[#1D2430]">
          <Avatar initials={avatarSeed} />
          <div className="flex-1">
            <div className="text-base font-semibold leading-tight">Seu perfil</div>
            <div className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
              <AtSign size={12} /> {email}
            </div>
          </div>
          <button onClick={signOut} className="h-9 px-3 rounded-xl border border-[#1D2430] hover:bg-[#11151d] text-sm">
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
          {/* ESQUERDA — FORM */}
          <div className="p-6 sm:p-10">
            {/* DESKTOP header */}
            <div className="hidden sm:flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <Avatar initials={avatarSeed} />
                <div>
                  <div className="text-xl font-semibold leading-tight flex items-center gap-2">
                    Seu perfil
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#0B0E12] border border-[#1D2430] text-[#9CA3AF]">
                      <Sparkles size={12} /> premium
                    </span>
                  </div>
                  <div className="text-xs text-[#9CA3AF] flex items-center gap-1">
                    <AtSign size={12} /> {email}
                  </div>
                </div>
              </div>

              <button
                onClick={signOut}
                className="h-10 px-3 rounded-xl border border-[#1D2430] hover:bg-[#11151d] transition hidden sm:inline-flex items-center gap-2"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>

            {/* STATUS ROW (mobile: 2 colunas) */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {statusItems.map((s, i) => (
                <div key={i} className="rounded-2xl border border-[#1D2430] bg-[#0B0E12] px-3 py-2 text-xs flex items-center gap-2">
                  <span className={`h-5 w-5 rounded-lg grid place-items-center ${s.ok ? 'bg-emerald-600/20 text-emerald-300' : 'bg-zinc-800 text-zinc-200'}`}>
                    {s.ok ? <Check size={14} /> : s.icon}
                  </span>
                  <span className={s.ok ? 'text-emerald-300' : 'text-[#B2B7BE]'}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* FORM */}
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-6 space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nome de exibição" error={errors.display_name?.message}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"><UserIcon size={18} /></span>
                    <input
                      {...register('display_name')}
                      placeholder="ex.: klaus"
                      className="w-full h-11 rounded-2xl bg-[#0B0E12] border border-[#1D2430] pl-10 pr-3 outline-none focus:ring-2 focus:ring-[#2563EB]/35"
                    />
                  </div>
                </Field>

                <Field label="Nome completo" error={errors.full_name?.message}>
                  <input
                    {...register('full_name')}
                    placeholder="seu nome completo"
                    className="w-full h-11 rounded-2xl bg-[#0B0E12] border border-[#1D2430] px-3 outline-none focus:ring-2 focus:ring-[#2563EB]/35"
                  />
                </Field>

                <Field label="Celular" error={errors.phone?.message}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"><Phone size={18} /></span>
                    <input
                      {...register('phone')}
                      placeholder="(00) 90000-0000"
                      className="w-full h-11 rounded-2xl bg-[#0B0E12] border border-[#1D2430] pl-10 pr-3 outline-none focus:ring-2 focus:ring-[#2563EB]/35"
                    />
                  </div>
                </Field>

                <Field label="Modo vendedor">
                  <Controller
                    control={control}
                    name="is_seller"
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
                        labelOn="Ativo"
                        labelOff="Inativo"
                      />
                    )}
                  />
                  <p className="text-[11px] text-[#9CA3AF] mt-1">
                    Ative para liberar <b>Vender</b> e <b>Meus Anúncios</b> na navegação.
                  </p>
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="h-11 px-5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 transition"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                </button>

                <a
                  href="/onboarding?edit=1"
                  className="h-11 px-5 rounded-2xl border border-[#1D2430] hover:bg-[#11151d] transition inline-flex items-center gap-2"
                  title="Editar preferências de interesses, raio e condição"
                >
                  <Target size={16} />
                  Ajustar preferências
                </a>
              </div>
            </motion.form>
          </div>

          {/* DIREITA — RESUMO/CTA */}
          <div className="relative border-t border-[#1D2430] lg:border-t-0 lg:border-l lg:border-[#1D2430]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_70%_20%,rgba(37,99,235,0.25),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_30%_80%,rgba(6,182,212,0.18),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,14,18,0)_0%,rgba(11,14,18,0.55)_100%)]" />
            </div>
            <div className="relative h-full p-6 sm:p-8 flex flex-col gap-6 justify-between">
              <div>
                <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="text-2xl sm:text-3xl font-semibold">
                  Sua presença no <span className="text-[#06B6D4]">MatchIT</span>.
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }} className="mt-2 sm:mt-3 text-[#B2B7BE] max-w-md text-sm sm:text-base">
                  Mantenha seus dados atualizados para ganhar relevância no feed, melhorar seu score e acelerar seus matches.
                </motion.p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <StatPill icon={<Store size={16} />} title="Modo vendedor" value={<span className="text-xs sm:text-sm">{watch('is_seller') ? 'Ativo' : 'Inativo'}</span>} />
                  <StatPill icon={<MapPin size={16} />} title="Distância" value={<span className="text-xs sm:text-sm">{prefs.radius != null ? `${prefs.radius} km` : '—'}</span>} />
                  <StatPill icon={<Target size={16} />} title="Condição" value={<MiniChips items={(prefs.conditions ?? []).map((c) => (c === 'semi' ? 'seminovo' : c === 'pecas' ? 'peças' : 'novo'))} />} />
                  <StatPill icon={<ShieldCheck size={16} />} title="Interesses" value={<MiniChips items={prefs.interests ?? []} />} />
                </div>
              </div>

              <div className="rounded-2xl border border-[#1D2430] bg-[#0B0E12]/70 p-4 sm:p-5">
                <div className="text-sm font-medium">Próximos passos</div>
                <ul className="mt-2 sm:mt-3 space-y-2 text-xs text-[#9CA3AF]">
                  <li>• Publique seu primeiro anúncio com fotos de qualidade.</li>
                  <li>• Responda rápido no chat para ganhar badges.</li>
                  <li>• Faça o primeiro match e sinta o realtime.</li>
                </ul>
                <div className="mt-4 flex gap-2">
                  <a href="/sell" className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] transition inline-flex items-center gap-2 text-sm">
                    <Store size={16} /> Quero vender
                  </a>
                  <a href="/explorar" className="h-10 px-4 rounded-xl border border-[#1D2430] hover:bg-[#11151d] transition text-sm">
                    Explorar ofertas
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </main>
  );
}

/* ================== UI helpers ================== */

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-[#2563EB] text-white grid place-items-center text-base sm:text-lg font-semibold shadow-[0_10px_30px_-10px_rgba(37,99,235,0.6)]">
      {initials}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode; }) {
  return (
    <div>
      <div className="text-xs text-[#9CA3AF] mb-1">{label}</div>
      {children}
      {error && <div className="mt-1 text-xs text-red-400">{error}</div>}
    </div>
  );
}

/** SWITCH CONTROLADO: animação da bolinha via classe condicional (sem peer-checked) */
function Switch({
  checked,
  onChange,
  labelOn = 'On',
  labelOff = 'Off',
}: {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  labelOn?: string;
  labelOff?: string;
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-[#2563EB]' : 'bg-[#1D2430]'}`}>
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white/90 shadow transition-transform duration-200 ease-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </span>
      <span className="text-xs text-[#9CA3AF]">
        <b className="text-[#E5E7EB]">{labelOn}</b> / {labelOff}
      </span>
    </label>
  );
}

function StatPill({ icon, title, value }: { icon: React.ReactNode; title: string; value: React.ReactNode; }) {
  return (
    <div className="rounded-2xl border border-[#1D2430] bg-[#0B0E12]/70 p-3">
      <div className="text-[11px] text-[#9CA3AF] flex items-center gap-2">
        <span className="h-6 w-6 rounded-lg bg-[#0F131A] border border-[#1D2430] grid place-items-center text-[#E5E7EB]">
          {icon}
        </span>
        {title}
      </div>
      <div className="mt-2 text-[#E5E7EB]">{value}</div>
    </div>
  );
}

function MiniChips({ items }: { items: string[] }) {
  if (!items?.length) return <span className="text-xs text-[#9CA3AF]">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="px-2 py-0.5 rounded-lg border border-[#1D2430] bg-[#0B0E12] text-[11px] text-[#B2B7BE]">
          {i}
        </span>
      ))}
    </div>
  );
}

function getInitialsFrom(s: string) {
  const parts = s.replace(/\s+/g, ' ').trim().split(' ');
  if (!parts.length) return 'U';
  const first = parts[0][0] ?? 'U';
  const second = parts[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}
