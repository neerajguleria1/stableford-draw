"use client";

import { useState, useEffect, useCallback } from "react";
import { ScoreForm, ScoreFormData } from "@/components/scores/ScoreForm";
import { ScoreTable } from "@/components/scores/ScoreTable";
import { useAuthStore } from "@/lib/store/auth";
import { supabase } from "@/lib/supabase";
import { SubscriptionGate } from "@/components/providers/SubscriptionGate";

interface Score {
  id: string;
  score: number;
  date_played: string;
}

export default function ScoresPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scores, setScores] = useState<Score[]>([]);

  const fetchScores = useCallback(async () => {
    if (!user) return;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    const res = await fetch("/api/scores", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.scores) setScores(json.scores);
  }, [user]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  async function handleSubmit(data: ScoreFormData) {
    if (!user) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: data.score, played_at: data.played_at }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSuccess("Score submitted successfully!");
      fetchScores();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    await fetch("/api/scores", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    fetchScores();
  }

  async function handleEdit(id: string, score: number) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    await fetch("/api/scores", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, score }),
    });
    fetchScores();
  }

  return (
    <SubscriptionGate>
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">My Golf Scores</h1>
          <p className="text-muted-foreground mt-1">
            Max 5 scores kept. Oldest is removed when you add a 6th.
          </p>
        </div>

        <div className="glass-card">
          <h2 className="text-lg font-semibold mb-4">Submit Score</h2>
          <ScoreForm onSubmit={handleSubmit} loading={loading} error={error} />
          {success && <p className="text-green-400 text-sm mt-3">{success}</p>}
        </div>

        <div className="glass-card">
          <h2 className="text-lg font-semibold mb-4">
            Your Scores{" "}
            <span className="text-muted-foreground text-sm font-normal">
              ({scores.length}/5)
            </span>
          </h2>
          <ScoreTable scores={scores} onDelete={handleDelete} onEdit={handleEdit} />
        </div>
      </div>
    </div>
    </SubscriptionGate>
  );
}
