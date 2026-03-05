import { Database } from "@/lib/database.types";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<
    Database["public"]["Tables"]["profiles"]["Row"] | null
  >(null);

  // Load initial session + auth listener
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        logger.log("AuthProvider: session changed");
        setSession(newSession as Session | null);
      },
    );

    return () => {
      mounted = false;
      try {
        // safe unsubscribe
        listener?.subscription?.unsubscribe?.();
      } catch (e) {
        logger.error("AuthProvider: failed to unsubscribe listener", e);
      }
    };
  }, []);

  // Fetch profile whenever session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        logger.error("AuthProvider: fetch profile error", error);
        setProfile(null);
        return;
      }

      logger.log("AuthProvider: profile", data);

      setProfile(data ?? null);
    };

    fetchProfile();
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        profile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
