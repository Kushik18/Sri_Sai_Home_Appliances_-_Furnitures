"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminSessionGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if there is an active session in the current browser tab/window
    const active = typeof window !== "undefined" ? sessionStorage.getItem("admin_session_active") : null;

    if (!active) {
      // If the tab/window was closed, force sign out and redirect to login
      signOut({ redirect: false }).then(() => {
        router.replace("/admin/login");
      });
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
