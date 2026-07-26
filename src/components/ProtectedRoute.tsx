"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b0f0]" />
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex h-screen overflow-hidden bg-black text-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
          {children}
        </main>
      </div>
    );
  }

  return null;
}
