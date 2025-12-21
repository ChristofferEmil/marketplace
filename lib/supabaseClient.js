import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jsjdhpsifxxkbcdqxbfr.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzamRocHNpZnh4a2JjZHF4YmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMjIwNDMsImV4cCI6MjA4MTY5ODA0M30.Y0p5RvxCVim8JdXhZhvUHGqemZcWILEWurkubWV-nbA'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // 👈 DENNE er afgørende
    },
  }
)
