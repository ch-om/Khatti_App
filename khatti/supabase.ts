import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://lpaetidqkjrbvhwqyhsd.supabase.co'
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYWV0aWRxa2pyYnZod3F5aHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDU0MTgsImV4cCI6MjA4OTU4MTQxOH0.-gGJfSznK1gcX1FZJpR8-TZi7LqG6GlPbm7GJ6Obk9c"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})