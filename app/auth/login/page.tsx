"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/dashboard");
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) return setError("Please fill in all fields");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          throw new Error("Please confirm your email first. Check your inbox for the verification link.");
        }
        throw signInError;
      }
      if (data.session) {
        setSuccess(true);
        const { data: profile } = await supabase
          .from("users_profiles")
          .select("charity_preference_id")
          .eq("user_id", data.session.user.id)
          .single();

        if (!profile?.charity_preference_id) {
          window.location.href = "/auth/signup?step=charity&userId=" + data.session.user.id;
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Welcome Back</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              Sign in successful! Redirecting...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : success ? "Success!" : "Sign In"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-purple-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
