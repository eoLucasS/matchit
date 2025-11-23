'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getGeoApprox, jitterLatLng } from '@/lib/geo';
import { MapPin, Laptop, Monitor, Cpu, HardDrive, Smartphone, Keyboard } from 'lucide-react';

const CATEGORIES = [
  { key: 'Notebook', icon: <Laptop size={16} /> },
  { key: 'Monitor', icon: <Monitor size={16} /> },
  { key: 'GPU', icon: <Cpu size={16} /> },
  { key: 'RAM', icon: <HardDrive size={16} /> },
  { key: 'Periféricos', icon: <Keyboard size={16} /> },
  { key: 'Celular', icon: <Smartphone size={16} /> },
  { key: 'Peças', icon: <Cpu size={16} /> },
];

const CONDITIONS = ['novo', 'semi', 'pecas'] as const;

export default function OnboardingClient() {
  const router = useRouter();
  const params = useSearchParams();
  const editMode = params.get('edit') === '1';

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  const [interests, setInterests] = useState<string[]>([]);
  const [radius, setRadius] = useState(10);
  const [conditions, setConditions] = useState<string[]>(['semi']);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [method, setMethod] = useState<'gps' | 'ip'>('ip');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }

      // Carrega prefs existentes (para edição também)
      const { data } = await supabase
        .from('profiles')
        .select('interests, preferred_conditions, radius_km')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setInterests(data.interests ?? []);
        setConditions(data.preferred_conditions ?? ['semi']);
        setRadius(data.radius_km ?? 10);
      }

      // Localização garantida (GPS → IP → fallback SP) + jitter
      const g = await getGeoApprox(); // sempre retorna algo
      const j = jitterLatLng(g!.lat, g!.lng);
      setLat(j.lat);
      setLng(j.lng);
      setMethod(g!.method);

      setLoading(false);
    })();
  }, [router]);

  async function save() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth'); return; }

      // 1) Tenta salvar via RPC (inclui location no Postgres)
      const { error } = await supabase.rpc('set_profile_onboarding', {
        p_interests: interests,
        p_conditions: conditions,
        p_radius: radius,
        p_lat: lat,
        p_lng: lng,
      });

      // 2) Cinturão e suspensório: se o RPC falhar por qualquer motivo, salva o básico sem location
      if (error) {
        await supabase
          .from('profiles')
          .update({
            interests,
            preferred_conditions: conditions,
            radius_km: radius,
            onboarded: true,
          })
          .eq('user_id', user.id);
      }

      toast.success('Preferências salvas!');
      router.push('/profile');
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha ao salvar onboarding');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="text-sm text-[#9CA3AF]">Carregando...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#1D2430] bg-[#0F131A]/70 backdrop-blur-xl shadow-[0_20px_120px_-30px_rgba(37,99,235,0.35)]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* ESQUERDA — STEPPER + FORM */}
          <div className="p-6 sm:p-10">
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-10 rounded-full ${
                    step >= s ? 'bg-[#2563EB]' : 'bg-[#1D2430]'
                  }`}
                />
              ))}
              <span className="ml-auto">{step}/3</span>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold">
                {editMode ? 'Ajuste suas preferências' : 'Personalize seu feed'}
              </h1>
              <p className="text-sm text-[#9CA3AF]">
                {editMode
                  ? 'Atualize seus filtros para melhorar as recomendações.'
                  : 'Conte o que você busca e até onde pode ir.'}
              </p>
            </div>

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="text-sm font-medium">Categorias de interesse</div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const active = interests.includes(c.key);
                    return (
                      <button
                        key={c.key}
                        onClick={() =>
                          setInterests((prev) =>
                            active
                              ? prev.filter((k) => k !== c.key)
                              : [...prev, c.key]
                          )
                        }
                        className={`px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2 transition
                          ${
                            active
                              ? 'bg-[#2563EB] border-[#2563EB] text-white'
                              : 'border-[#1D2430] hover:bg-[#11151d]'
                          }`}
                      >
                        <span>{c.icon}</span>
                        {c.key}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="h-11 w-full rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] transition"
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="text-sm font-medium">Distância máxima (km)</div>
                <div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full accent-[#2563EB]"
                  />
                  <div className="text-xs text-[#9CA3AF] mt-1">{radius} km</div>
                </div>

                <div className="rounded-2xl border border-[#1D2430] p-4 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#0B0E12] border border-[#1D2430] grid place-items-center">
                    <MapPin size={18} />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Localização aproximada</div>
                    <div className="text-[#9CA3AF] text-xs">
                      Usamos sua posição aproximada para priorizar itens próximos.{' '}
                      {method === 'gps'
                        ? '✓ Capturado via GPS'
                        : '✓ Estimado via IP'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="h-11 w-1/2 rounded-2xl border border-[#1D2430] hover:bg-[#11151d] transition"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="h-11 w-1/2 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] transition"
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="text-sm font-medium">Condição que você aceita</div>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => {
                    const active = conditions.includes(c);
                    const label =
                      c === 'semi' ? 'seminovo' : c === 'pecas' ? 'peças' : 'novo';
                    return (
                      <button
                        key={c}
                        onClick={() =>
                          setConditions((prev) =>
                            active
                              ? prev.filter((k) => k !== c)
                              : [...prev, c]
                          )
                        }
                        className={`px-3 py-2 rounded-xl border text-sm transition
                          ${
                            active
                              ? 'bg-[#2563EB] border-[#2563EB] text-white'
                              : 'border-[#1D2430] hover:bg-[#11151d]'
                          }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="h-11 w-1/2 rounded-2xl border border-[#1D2430] hover:bg-[#11151d] transition"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={save}
                    className="h-11 w-1/2 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] transition"
                  >
                    Concluir
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* DIREITA — gradiente + copy curta */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_70%_20%,rgba(37,99,235,0.25),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_30%_80%,rgba(6,182,212,0.18),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,14,18,0)_0%,rgba(11,14,18,0.55)_100%)]" />
            </div>
            <div className="relative h-full p-10 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="text-3xl font-semibold">Seu feed, do seu jeito.</h2>
                <p className="mt-3 text-[#B2B7BE] max-w-md">
                  Defina interesses, distância e condição. Nós cuidamos do ranking para
                  você encontrar negócios rápidos, perto de casa.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
