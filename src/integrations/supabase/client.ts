import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; 

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const errorMsg = `Supabase configuration missing! URL: ${!!SUPABASE_URL}, Key: ${!!SUPABASE_PUBLISHABLE_KEY}`;
  // Persiste no localStorage ANTES de dar o crash, para o early catcher pegar
  localStorage.setItem('lastOTAError', `[SUPABASE_INIT_ERROR] ${errorMsg}`);
  throw new Error(errorMsg);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
