"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
}

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"form" | "charity" | "done">("form");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/dashboard");
    });
    const stepParam = searchParams.get("step");
    const userIdParam = searchParams.get("userId");
    if (stepParam === "charity" && userIdParam) {
      setUserId(userIdParam);
      setStep("charity");
    }
    fetch("/api/charities")
      .then((r) => r.json())
      .then((d) => setCharities(d.charities ?? []));
  }, [router, searchParams]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirmPassword)
      return setError("Please fill in all fields");
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name } },
      });

      if (signUpError) {
        if (signUpError.message.includes("rate limit") || signUpError.message.includes("email rate"))
          throw new Error("Too many signups. Please wait an hour or use a different email.");
        if (signUpError.message.includes("already registered"))
          throw new Error("This email is already registered. Please sign in instead.");
        throw signUpError;
      }
      if (!data.user) throw new Error("Signup failed");

      if (!data.session) {
        setStep("done");
        return;
      }

      await supabase.from("users_profiles").insert({
        user_id: data.user.id,
        email: form.email,
        full_name: form.name,
      });

      supabase.auth.getSession().then(({ data: sessionData }) => {
        if (sessionData.session?.access_token) {
          fetch("/api/notifications/welcome", {
            method: "POST",
            headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
          }).catch(() => {});
        }
      });

      setUserId(data.user.id);
      setStep("charity");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCharitySelect() {
    if (!selectedCharity) return setError("Please select a charity");
    setLoading(true);
    setError("");
    try {
      await supabase
        .from("users_profiles")
        .update({ charity_preference_id: selectedCharity })
        .eq("user_id", userId);
      setStep("done");
      setTimeout(() => router.push("/subscribe"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card max-w-md w-full text-center space-y-3">
          <div className="text-4xl">✅</div>
          <h2 className="text-xl font-bold">Check Your Email</h2>
          <p className="text-muted-foreground text-sm">
            We sent a confirmation link to <span className="text-white">{form.email}</span>.<br />
            Click it to verify your account, then come back to sign in.
          </p>
          <a href="/auth/login" className="inline-block mt-2 text-purple-400 hover:text-purple-300 text-sm underline">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (step === "charity") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text">Choose Your Charity</h1>
            <p className="text-muted-foreground mt-1 text-sm">A portion of every draw goes to your chosen charity.</p>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {charities.map((c) => (
              <button key={c.id} onClick={() => setSelectedCharity(c.id)}
                className={`w-full glass-card text-left border-2 transition-all ${selectedCharity === c.id ? "border-purple-500" : "border-transparent"}`}>
                <p className="font-semibold">{c.name}</p>
                {c.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>}
              </button>
            ))}
            {charities.length === 0 && (
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-muted-foreground text-sm">Loading charities...</p>
              </div>
            )}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={handleCharitySelect} disabled={loading || !selectedCharity}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Join the golf draw community</p>
        </div>
        <form onSubmit={handleSignup} className="glass-card space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {[
            { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
            { id: "email", label: "Email", type: "email", placeholder: "you@email.com" },
            { id: "password", label: "Password", type: "password", placeholder: "••••••••" },
            { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••" },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input type={type} placeholder={placeholder}
                value={form[id as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-purple-400 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <SignupInner />
    </Suspense>
  );
}
