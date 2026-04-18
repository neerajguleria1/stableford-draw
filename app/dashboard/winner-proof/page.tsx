"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { supabase } from "@/lib/supabase";

interface Payout {
  id: string;
  tier: string;
  amount: number;
  status: string;
  draws: { name: string } | null;
}

export default function WinnerProofPage() {
  const { user } = useAuthStore();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [selectedPayout, setSelectedPayout] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("payouts")
      .select("id, tier, amount, status, draws(name)")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .then(({ data }) => {
        setPayouts((data as any) ?? []);
        setLoading(false);
      });
  }, [user]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !selectedPayout) return setError("Please select a payout and upload a file");
    if (!file.type.startsWith("image/")) return setError("Only image files are accepted");
    if (file.size > 5 * 1024 * 1024) return setError("File must be under 5MB");

    setUploading(true);
    setError("");

    try {
      const ext = file.name.split(".").pop();
      const path = `winner-proofs/${user!.id}/${selectedPayout}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("proofs")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("proofs").getPublicUrl(path);

      await supabase.from("payouts").update({
        proof_url: publicUrl,
        status: "proof_submitted",
      }).eq("id", selectedPayout);

      setSuccess("Proof uploaded successfully! Admin will review and process your payment.");
      setFile(null);
      setSelectedPayout("");
      setPayouts((prev) => prev.filter((p) => p.id !== selectedPayout));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
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
          <h1 className="text-2xl font-bold gradient-text">Winner Verification</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Upload a screenshot of your scores from your golf platform to verify your win.
          </p>
        </div>

        {payouts.length === 0 ? (
          <div className="glass-card text-center py-12 space-y-3">
            <p className="text-4xl">🏆</p>
            <p className="font-semibold">No pending prizes to verify</p>
            <p className="text-sm text-muted-foreground">
              When you win a draw, your pending prizes will appear here.
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="glass-card space-y-5">
            <h2 className="font-semibold">Submit Proof</h2>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            <div>
              <label className="block text-sm font-medium mb-2">Select Prize to Verify</label>
              <div className="space-y-2">
                {payouts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPayout(p.id)}
                    className={`w-full glass-card text-left border-2 transition-all ${
                      selectedPayout === p.id ? "border-purple-500" : "border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{p.draws?.name ?? "Draw"}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.tier}</p>
                      </div>
                      <p className="font-bold text-purple-400">£{p.amount.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Score Screenshot
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                file ? "border-purple-500 bg-purple-500/5" : "border-white/20 hover:border-white/40"
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="proof-upload"
                />
                <label htmlFor="proof-upload" className="cursor-pointer space-y-2 block">
                  {file ? (
                    <>
                      <p className="text-green-400 font-medium">✓ {file.name}</p>
                      <p className="text-xs text-muted-foreground">Click to change</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl">📸</p>
                      <p className="text-sm font-medium">Click to upload screenshot</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !file || !selectedPayout}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Submit Proof"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
