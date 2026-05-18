import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppUser = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  plan: "free" | "ad_free" | "explorer";
  plan_expiry: string | null;
  pref_age_min: number | null;
  pref_age_max: number | null;
  pref_district: string | null;
  pref_education: string | null;
  locale: string;
};

type Ctx = {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("app_users").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setAppUser(profile as AppUser | null);
    setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    if (data.session?.user) await loadProfile(data.session.user.id);
    else { setAppUser(null); setIsAdmin(false); }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // defer to avoid deadlocks
        setTimeout(() => loadProfile(sess.user!.id), 0);
      } else {
        setAppUser(null);
        setIsAdmin(false);
      }
    });
    refresh().finally(() => setLoading(false));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setUser(null); setAppUser(null); setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, appUser, isAdmin, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
