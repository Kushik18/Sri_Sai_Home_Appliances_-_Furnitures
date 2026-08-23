"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function AdminSignOutButton({ className }: { className?: string }) {
  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_session_active");
    }
    signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <button
      onClick={handleSignOut}
      className={
        className ||
        "flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors w-full cursor-pointer"
      }
      title="Sign out of admin session"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </button>
  );
}
