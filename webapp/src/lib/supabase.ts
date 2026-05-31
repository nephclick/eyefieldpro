import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qimnlvsesplcqycgjwqd.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbW5sdnNlc3BsY3F5Y2dqd3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDg5NjAsImV4cCI6MjA5NTQ4NDk2MH0.kboBdW0Xn5ZrwXmk08w2eqO0OiH3Mkvznp9aWkONI6I";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);