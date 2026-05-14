"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for login link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      {/* background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-slate-950" />

      {/* login card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 md:p-8 space-y-6">
          
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Login to Lynkhive
            </h1>
            <p className="text-sm text-white/60">
              Enter your email to receive a magic link
            </p>
          </div>

          <input
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition text-white font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>

          <p className="text-xs text-center text-white/40">
            Secure login powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
