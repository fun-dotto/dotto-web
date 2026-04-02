"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HomeIcon, MonitorIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { title: "ホーム", href: "/", icon: HomeIcon },
  { title: "Mac サポート", href: "/mac", icon: MonitorIcon },
];

export function AppSidebar() {
  const { user, signOutUser } = useAuth();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <span className="text-lg font-bold tracking-tight">dotto</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "ユーザー"}
              width={32}
              height={32}
              className="rounded-full shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-medium shrink-0">
              {user?.displayName?.[0] ?? user?.email?.[0] ?? "U"}
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium truncate">
              {user?.displayName ?? user?.email}
            </span>
            <button
              onClick={signOutUser}
              className="text-xs text-muted-foreground hover:text-foreground text-left transition-colors"
            >
              サインアウト
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
