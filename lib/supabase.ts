import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://sextgijjuxcbnidxzsot.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNleHRnaWpqdXhjYm5pZHh6c290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTI0MDgsImV4cCI6MjA4NzU4ODQwOH0.DYYgLODqY7B1WgP1w0uVDzdZypHI4mfekC8CimXJdEo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});