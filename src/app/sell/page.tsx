'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Upload, Tag, DollarSign, Layers, FileText, Save, Store } from 'lucide-react';

type FormState = {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  imageBase64: string; // base64 string when loaded
};

type ErrorsState = {
  title?: string;
  description?: string;
  category?: string;
  condition?: string;
  price?: string;
  image?: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [location, setLocation] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touchedSubmit, setTouchedSubmit] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    imageBase64: '',
  });

  const [errors, setErrors] = useState<ErrorsState>({});

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.replace('/auth');
        return;
      }
      setUserId(auth.user.id);

      // carrega localização do profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('user_id', auth.user.id)
        .maybeSingle();

      if (profile?.location) {
        setLocation(profile.location);
      }
    })();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // limpar erro específico ao digitar
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setForm((prev) => ({ ...prev, imageBase64: base64 }));
      setErrors((prev) => ({ ...prev, image: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorsState = {};

    if (!form.title.trim()) newErrors.title = 'O título é obrigatório.';
    if (!form.description.trim()) newErrors.description = 'A descrição é obrigatória.';
    if (!form.category.trim()) newErrors.category = 'Selecione uma categoria.';
    if (!form.condition.trim()) newErrors.condition = 'Selecione a condição do produto.';
    if (!form.price.trim()) {
      newErrors.price = 'O preço é obrigatório.';
    } else {
      const value = Number(form.price);
      if (Number.isNaN(value) || value <= 0) newErrors.price = 'Informe um preço válido maior que zero.';
    }
    if (!form.imageBase64) newErrors.image = 'Envie ao menos uma foto do produto.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedSubmit(true);

    if (!validateForm()) {
      // mostra toast e não envia
      toast.error('Preencha todos os campos obrigatórios antes de publicar.');
      return;
    }

    setLoading(true);
    try {
      const priceValue = parseFloat(form.price.replace(',', '.'));
      const priceCents = Math.round(priceValue * 100);

      // imagem: usamos o base64 (no MVP); em produção troque por upload no Storage
      const imageUrl = form.imageBase64;

      const insertPayload = {
        seller_id: userId,
        title: form.title,
        description: form.description,
        category: form.category,
        condition: form.condition,
        price: priceValue,
        price_cents: priceCents,
        images: [imageUrl],
        location: location ? location : null,
        active: true,
        status: 'active',
      };

      const { error } = await supabase.from('listings').insert([insertPayload]);
      if (error) throw error;

      toast.success('Produto cadastrado com sucesso!');
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Erro ao cadastrar produto.');
    } finally {
      setLoading(false);
    }
  };

  const invalidClass = (field?: keyof ErrorsState) =>
    field && (errors as any)[field] ? 'border-red-500 ring-1 ring-red-600' : '';

  return (
    <main className="min-h-screen bg-[#0B0E12] text-white px-4 py-6 flex justify-center">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-[#0F131A]/80 rounded-3xl border border-[#1D2430] p-6 space-y-5 shadow-[0_20px_100px_-30px_rgba(37,99,235,0.4)]"
        noValidate
      >
        <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <Store size={22} /> Novo Anúncio
        </h1>
        <p className="text-[#9CA3AF] text-sm mb-4">
          Preencha as informações do seu produto e publique imediatamente.
        </p>

        <Field label="Título" icon={<Tag size={16} />}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="ex: Notebook Gamer RTX"
            className={`input ${invalidClass('title')}`}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'err-title' : undefined}
          />
          {errors.title && <div id="err-title" role="alert" className="mt-1 text-xs text-red-400">{errors.title}</div>}
        </Field>

        <Field label="Descrição" icon={<FileText size={16} />}>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="ex: Notebook com 16GB RAM, SSD 512GB..."
            className={`input resize-none ${invalidClass('description')}`}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'err-desc' : undefined}
          />
          {errors.description && <div id="err-desc" role="alert" className="mt-1 text-xs text-red-400">{errors.description}</div>}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria" icon={<Layers size={16} />}>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`input ${invalidClass('category')}`}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'err-cat' : undefined}
            >
              <option value="">Selecione</option>
              {['Notebook', 'Monitor', 'GPU', 'RAM', 'Periféricos', 'Celular'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <div id="err-cat" role="alert" className="mt-1 text-xs text-red-400">{errors.category}</div>}
          </Field>

          <Field label="Condição" icon={<Layers size={16} />}>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className={`input ${invalidClass('condition')}`}
              aria-invalid={!!errors.condition}
              aria-describedby={errors.condition ? 'err-cond' : undefined}
            >
              <option value="">Selecione</option>
              <option value="novo">Novo</option>
              <option value="semi">Seminovo</option>
              <option value="pecas">Peças</option>
            </select>
            {errors.condition && <div id="err-cond" role="alert" className="mt-1 text-xs text-red-400">{errors.condition}</div>}
          </Field>
        </div>

        <Field label="Preço (R$)" icon={<DollarSign size={16} />}>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="000.00"
            step="0.01"
            className={`input ${invalidClass('price')}`}
            aria-invalid={!!errors.price}
            aria-describedby={errors.price ? 'err-price' : undefined}
          />
          {errors.price && <div id="err-price" role="alert" className="mt-1 text-xs text-red-400">{errors.price}</div>}
        </Field>

        <Field label="Foto do produto" icon={<Upload size={16} />}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className={`input-file ${errors.image ? 'ring-1 ring-red-600' : ''}`}
            aria-invalid={!!errors.image}
            aria-describedby={errors.image ? 'err-image' : undefined}
          />
          {errors.image && <div id="err-image" role="alert" className="mt-1 text-xs text-red-400">{errors.image}</div>}

          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full rounded-2xl border border-[#1D2430] object-cover"
              />
            </div>
          )}
        </Field>

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] transition text-base flex items-center justify-center gap-2 font-medium ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          aria-disabled={loading}
        >
          <Save size={18} />
          {loading ? 'Salvando...' : 'Publicar Produto'}
        </button>
      </motion.form>
    </main>
  );
}

/* === Components === */

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-[#9CA3AF] mb-1 flex items-center gap-2">{icon} {label}</label>
      {children}
    </div>
  );
}