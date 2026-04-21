"use client";

import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  User,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function getAppCheckToken(): Promise<string | undefined> {
  const [{ appCheck }, { getToken }] = await Promise.all([
    import("@/lib/firebase"),
    import("firebase/app-check"),
  ]);
  if (!appCheck) return undefined;
  try {
    const { token } = await getToken(appCheck, false);
    return token;
  } catch {
    return undefined;
  }
}

async function syncSessionCookie(user: User | null) {
  if (user) {
    const [idToken, appCheckToken] = await Promise.all([
      user.getIdToken(),
      getAppCheckToken(),
    ]);
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, appCheckToken }),
    });
  } else {
    await fetch("/api/auth/session", { method: "DELETE" });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      await syncSessionCookie(user);
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
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
