'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  loginId: string;
  onChangeLoginId: (value: string) => void;
  loginPass: string;
  onChangeLoginPass: (value: string) => void;
  loginError: string | null;
  isCheckingAuth: boolean;
  onSubmitLogin: (e: React.FormEvent) => void;
}

export function AdminLogin({
  loginId,
  onChangeLoginId,
  loginPass,
  onChangeLoginPass,
  loginError,
  isCheckingAuth,
  onSubmitLogin,
}: AdminLoginProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <div className="border border-[#C5A059] bg-white p-8 shadow-xl rounded-2xl">
        <div className="flex h-12 w-12 items-center justify-center border border-[#E6D5B8] bg-[#FAF7F2] text-[#9A7B3E] mb-5 rounded-xl">
          <Lock className="w-5 h-5" />
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A7B3E] block">
          Protected Area
        </span>
        <h1 className="mt-1 font-serif-display text-3xl font-medium text-[#1C1917]">
          MELO Admin Sign In
        </h1>
        <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed">
          Sign in with your administrator credentials to verify bKash TrxIDs, manage orders, and
          update jewellery inventory.
        </p>

        {loginError && (
          <div className="mt-4 border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 rounded-lg">
            {loginError}
          </div>
        )}

        <form onSubmit={onSubmitLogin} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
              Admin Email / ID
            </label>
            <input
              type="email"
              required
              placeholder="Enter admin email"
              value={loginId}
              onChange={(e) => onChangeLoginId(e.target.value)}
              className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={loginPass}
              onChange={(e) => onChangeLoginPass(e.target.value)}
              className="w-full border border-[#D6CFC5] bg-[#FAF7F2]/50 px-3.5 py-2.5 text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C5A059] rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isCheckingAuth}
            className="w-full boutique-btn-primary py-3.5 mt-2 cursor-pointer disabled:opacity-50 rounded-lg shadow-sm"
          >
            {isCheckingAuth ? 'Verifying Credentials...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E7E0D6] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716C] hover:text-[#1C1917] rounded-lg px-3 py-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

