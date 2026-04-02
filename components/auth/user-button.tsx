"use client";

import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import Link from "next/link";

export function UserButton() {
  const { user, loading, signOutUser } = useAuth();

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        サインイン
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.displayName ?? "ユーザー"}
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
          {user.displayName?.[0] ?? user.email?.[0] ?? "U"}
        </div>
      )}
      <button
        onClick={signOutUser}
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        サインアウト
      </button>
    </div>
  );
}
