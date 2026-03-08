function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export const SUPABASE_URL = getEnv("EXPO_PUBLIC_SUPABASE_URL")
export const SUPABASE_ANON_KEY = getEnv("EXPO_PUBLIC_SUPABASE_KEY")