"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UsersRound, Presentation, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Participants", href: "/", icon: Users },
  { name: "Teams", href: "/teams", icon: UsersRound },
  { name: "Mentors", href: "/mentors", icon: Presentation },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-16 items-center border-b border-zinc-800 px-6">
        <h1 className="text-xl font-bold text-white">Events Portal</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? "text-[#00b0f0]" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={() => signOut()}
          className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-zinc-500 group-hover:text-zinc-300" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
