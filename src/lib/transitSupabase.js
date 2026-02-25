import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_TRANSIT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_TRANSIT_SUPABASE_ANON_KEY

export const transitSupabase = createClient(supabaseUrl, supabaseAnonKey)