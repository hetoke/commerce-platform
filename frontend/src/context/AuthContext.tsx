import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { protectedFetch } from "../api/api";
import type { AuthContextValue, User } from "../types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await protectedFetch("/api/auth/me");

        if (!res.ok) {
          throw new Error("Failed to load current user.");
        }

        const data = (await res.json()) as User;
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    void loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
