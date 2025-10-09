import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Ensure the configured admin email always has the 'admin' role
  const ADMIN_EMAIL = (import.meta as any).env?.VITE_ADMIN_EMAIL || "ejumakona@gmail.com";

  const ensureAdminRole = async (u: User | null) => {
    try {
      if (!u?.email) return;
      if (u.email.toLowerCase() !== String(ADMIN_EMAIL).toLowerCase()) return;

      // upsert admin role for this user
      const { error } = await supabase
        .from("user_roles")
        .upsert(
          { user_id: u.id, role: "admin" },
          { onConflict: "user_id" }
        );

      if (error) {
        // Do not break auth flow, just log
        console.error("Failed to upsert admin role:", error);
      }
    } catch (err) {
      console.error("Unexpected error ensuring admin role:", err);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        // Ensure admin role whenever auth state changes
        ensureAdminRole(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Ensure admin role on initial load
      ensureAdminRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
