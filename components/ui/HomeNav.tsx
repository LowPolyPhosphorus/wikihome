"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function HomeNav({ email }: { email: string }) {
  return (
    <nav className="border-b border-[#e2e8f0] bg-white">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-[#111827] hover:text-[#475569] transition-colors"
        >
          WikiHome
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#475569]">{email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-[#475569] hover:text-[#111827] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}