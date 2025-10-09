// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Tip: mantenha apenas as public keys aqui.
// O cliente será usado no client side e em server components quando preciso.
export const supabase = createClient(url, anon);
