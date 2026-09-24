import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy_anon_key';

export const isSupabaseConfigured =
  supabaseUrl !== 'https://your-project.supabase.co' &&
  Boolean(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('dummy'));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
