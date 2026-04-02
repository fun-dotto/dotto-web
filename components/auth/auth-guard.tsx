"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/sign-in") {
      router.replace("/sign-in");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
      </div>
    );
  }

  if (!user && pathname !== "/sign-in") {
    return null;
  }

  return <>{children}</>;
}
