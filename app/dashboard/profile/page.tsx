"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { supabase } from "@/lib/supabase";

interface Charity { id: string; name: string }

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [charityPct, setCharityPct] = useState(10);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [profileRes, charitiesRes] = await Promise.all([
        supabase
          .from("users_profiles")
          .select("full_name, charity_preference_id, charity_percentage")
          .eq("user_id", user!.id)
          .single(),
        supabase
          .from("charities")
          .select("id, name")
          .eq("status", "active")
          .order("name"),
      ]);
      setName(profileRes.data?.full_name ?? "");
      setSelectedCharity(profileRes.data?.charity_preference_id ?? "");
      setCharityPct(profileRes.data?.charity_percentage ?? 10);
      setCharities(charitiesRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setProfileMsg("");
    const { error } = await supabase
      .from("users_profiles")
      .update({ full_name: name, charity_preference_id: selectedCharity || null, charity_percentage: charityPct })
      .eq("user_id", user.id);
    setProfileMsg(error ? error.message : "Profile updated successfully!");
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg("");
    if (!newPassword || !confirmPassword) return setPasswordMsg("Please fill in all fields");
    if (newPassword.length < 8) return setPasswordMsg("Password must be at least 8 characters");
    if (newPassword !== confirmPassword) return setPasswordMsg("Passwords do not match");
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordMsg(error ? error.message : "Password changed successfully!");
    if (!error) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setChangingPassword(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Profile Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your account details</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="glass-card space-y-4">
          <h2 className="font-semibold">Personal Info</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-muted-foreground cursor-not-allowed opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">My Charity</label>
            <select
              value={selectedCharity}
              onChange={(e) => setSelectedCharity(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">Select a charity</option>
              {charities.map((c) => (
                <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Charity Contribution: <span className="text-purple-400">{charityPct}%</span>
              <span className="text-xs text-muted-foreground ml-2">(minimum 10%)</span>
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={charityPct}
              onChange={(e) => setCharityPct(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10% (min)</span>
              <span>100%</span>
            </div>
          </div>

          {profileMsg && (
            <p className={`text-sm ${profileMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>
              {profileMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="glass-card space-y-4">
          <h2 className="font-semibold">Change Password</h2>

          {[
            { id: "new", label: "New Password", value: newPassword, set: setNewPassword },
            { id: "confirm", label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword },
          ].map(({ id, label, value, set }) => (
            <div key={id}>
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

          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>
              {passwordMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>

        {/* Subscription Management */}
        <SubscriptionManager userId={user?.id ?? ""} />
      </div>
    </div>
  );
}

function SubscriptionManager({ userId }: { userId: string }) {
  const [sub, setSub] = useState<{ plan_type: string; status: string; next_billing_date: string | null } | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("subscriptions")
      .select("plan_type, status, next_billing_date")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => setSub(data ?? null));
  }, [userId]);

  async function handleCancel() {
    setCancelling(true);
    setMsg("");
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/stripe/cancel", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const json = await res.json();
    if (res.ok) {
      setMsg("Subscription cancelled. You'll retain access until the end of your billing period.");
      setSub((prev) => prev ? { ...prev, status: "cancelled" } : null);
    } else {
      setMsg(json.error ?? "Failed to cancel");
    }
    setCancelling(false);
    setConfirm(false);
  }

  if (!sub) return null;

  return (
    <div className="glass-card space-y-3 border border-red-500/20">
      <h2 className="font-semibold text-red-400">Subscription</h2>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm font-medium capitalize">{sub.plan_type} Plan</p>
          {sub.next_billing_date && sub.status === "active" && (
            <p className="text-xs text-muted-foreground">
              Renews {new Date(sub.next_billing_date).toLocaleDateString("en-GB", { dateStyle: "long" })}
            </p>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          sub.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        }`}>
          {sub.status}
        </span>
      </div>

      {msg && (
        <p className={`text-sm ${msg.includes("cancelled") ? "text-green-400" : "text-red-400"}`}>{msg}</p>
      )}

      {sub.status === "active" && (
        <>
          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              className="text-sm text-red-400 hover:text-red-300 underline"
            >
              Cancel Subscription
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Are you sure? You'll lose access to draws and score entry.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Yes, Cancel"}
                </button>
                <button
                  onClick={() => setConfirm(false)}
                  className="text-sm text-muted-foreground hover:text-white"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {sub.status !== "active" && (
        <a href="/subscribe" className="text-sm text-purple-400 hover:underline">
          Resubscribe →
        </a>
      )}
    </div>
  );
}
