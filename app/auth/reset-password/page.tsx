"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password || !confirmPassword) return setError("Please fill in all fields");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full text-center space-y-3">
          <div className="text-4xl">✅</div>
          <h2 className="text-xl font-bold">Password Reset!</h2>
          <p className="text-muted-foreground text-sm">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text">Create New Password</h1>
          <p className="text-muted-foreground mt-1 text-sm">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {[
            { label: "New Password", value: password, set: setPassword },
            { label: "Confirm Password", value: confirmPassword, set: setConfirmPassword },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <Link href="/auth/login" className="block text-center text-sm text-purple-400 hover:underline">
            ← Back to Sign In
          </Link>
        </form>
      </div>
    </div>
  );
}
