import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://ozvixkxjoffiydpujosc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dml4a3hqb2ZmaXlkcHVqb3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjYwODUsImV4cCI6MjA4ODMwMjA4NX0.liUli7Mgp3h1VAbAS-p2eEk3lwoMK1k3d3bYRKZpsM4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
