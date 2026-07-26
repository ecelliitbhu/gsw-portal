"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center bg-black">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-950 p-10 border border-zinc-800 shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">GSW Events Portal</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in with your authorized events associate account.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group relative flex w-full justify-center rounded-md bg-[#00b0f0] px-4 py-3 text-sm font-semibold text-white hover:bg-[#009ad4] focus:outline-none focus:ring-2 focus:ring-[#00b0f0] focus:ring-offset-2 focus:ring-offset-zinc-950 transition-colors"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LogIn className="h-5 w-5 text-white/80 group-hover:text-white" aria-hidden="true" />
            </span>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
