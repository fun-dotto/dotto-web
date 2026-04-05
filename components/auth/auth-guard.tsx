"use client";

import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-primary">
        <div className="h-8 w-8 rounded-full border-2 border-border-primary border-t-label-primary animate-spin" />
      </div>
    );
  }

  if (!user && pathname !== "/login") {
    return null;
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center px-4 border-b border-border-primary">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6 bg-background-primary">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
