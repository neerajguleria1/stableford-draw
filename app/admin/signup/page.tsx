"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.adminCode) {
      return setError("All fields are required");
    }
    if (form.password.length < 8) return setError("Password must be at least 8 characters");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card max-w-md w-full text-center space-y-3">
          <div className="text-4xl">✅</div>
          <h2 className="text-xl font-bold">Admin Account Created!</h2>
          <p className="text-muted-foreground text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">⚙</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Admin Registration</h1>
          <p className="text-muted-foreground mt-1 text-sm">Requires a valid admin code</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {[
            { id: "name", label: "Full Name", type: "text", placeholder: "Admin Name" },
            { id: "email", label: "Email", type: "email", placeholder: "admin@example.com" },
            { id: "password", label: "Password", type: "password", placeholder: "••••••••" },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[id as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Admin Code</label>
            <input
              type="password"
              placeholder="Enter secret admin code"
              value={form.adminCode}
              onChange={(e) => setForm({ ...form, adminCode: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Admin Account"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-purple-400 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
