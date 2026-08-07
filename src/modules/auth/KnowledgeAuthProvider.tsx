import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { logout as authLogout, getAuthState } from "@/actions/auth";
import type { PublicAuthState } from "./auth.types";
import { BootstrapScreen } from "./components/BootstrapScreen";
import { KnowledgeLoginScreen } from "./KnowledgeLoginScreen";

interface AuthContextValue {
  authState: PublicAuthState;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within KnowledgeAuthProvider");
  }
  return ctx;
}

interface KnowledgeAuthProviderProps {
  children: React.ReactNode;
}

export function KnowledgeAuthProvider({
  children,
}: KnowledgeAuthProviderProps) {
  const [authState, setAuthState] = useState<PublicAuthState>({
    status: "loading",
  });

  const refresh = useCallback(async () => {
    const state = await getAuthState();
    setAuthState(state);
  }, []);

  const logout = useCallback(async () => {
    const state = await authLogout();
    setAuthState(state);
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setAuthState({ status: "unauthenticated" });
    });
  }, [refresh]);

  const value = useMemo(
    () => ({ authState, logout, refresh }),
    [authState, logout, refresh]
  );

  if (authState.status === "loading") {
    return <BootstrapScreen />;
  }

  if (authState.status === "unauthenticated") {
    return (
      <AuthContext.Provider value={value}>
        <KnowledgeLoginScreen onLoginSuccess={refresh} />
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
