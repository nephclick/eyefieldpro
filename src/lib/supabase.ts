import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fzcoljqdtmkgrswwxkyi.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6Y29sanFkdG1rZ3Jzd3d4a3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzU4NzIsImV4cCI6MjA5NzExMTg3Mn0.bMO4poe2Zs_c_zTor5gFf2BFvRIWSKF6j9OtCdFnOdo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);