"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Score {
  id: string;
  score: number;
  date_played: string;
}

interface User {
  user_id: string;
  full_name: string;
  email: string;
  created_at: string;
  subscriptions: { status: string; plan_type: string }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, Score[]>>({});
  const [editingScore, setEditingScore] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);

  async function loadUsers() {
    const { data } = await supabase
      .from("users_profiles")
      .select("user_id, full_name, email, created_at, subscriptions(status, plan_type)")
      .order("created_at", { ascending: false });
    setUsers((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  async function loadScores(userId: string) {
    if (scores[userId]) { setExpandedUser(expandedUser === userId ? null : userId); return; }
    const { data } = await supabase
      .from("golf_scores")
      .select("id, score, date_played")
      .eq("user_id", userId)
      .order("date_played", { ascending: false });
    setScores((prev) => ({ ...prev, [userId]: data ?? [] }));
    setExpandedUser(userId);
  }

  async function saveScore(scoreId: string, userId: string) {
    if (editValue < 1 || editValue > 45) return;
    await supabase.from("golf_scores").update({ score: editValue }).eq("id", scoreId);
    const { data } = await supabase
      .from("golf_scores").select("id, score, date_played")
      .eq("user_id", userId).order("date_played", { ascending: false });
    setScores((prev) => ({ ...prev, [userId]: data ?? [] }));
    setEditingScore(null);
  }

  async function deleteScore(scoreId: string, userId: string) {
    await supabase.from("golf_scores").delete().eq("id", scoreId);
    setScores((prev) => ({ ...prev, [userId]: prev[userId].filter((s) => s.id !== scoreId) }));
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Users ({users.length})</h2>
      <div className="space-y-2">
        {users.map((u) => {
          const sub = u.subscriptions?.[0];
          const isExpanded = expandedUser === u.user_id;
          return (
            <div key={u.user_id} className="glass-card space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium">{u.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {sub ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      sub.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>{sub.plan_type} — {sub.status}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">No subscription</span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("en-GB")}
                  </p>
                  <button onClick={() => loadScores(u.user_id)}
                    className="text-xs text-purple-400 hover:text-purple-300 underline">
                    {isExpanded ? "Hide Scores" : "View Scores"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Golf Scores ({scores[u.user_id]?.length ?? 0}/5)
                  </p>
                  {scores[u.user_id]?.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No scores submitted.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-left text-xs">
                          <th className="py-1 px-2">Date</th>
                          <th className="py-1 px-2">Score</th>
                          <th className="py-1 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores[u.user_id]?.map((s) => (
                          <tr key={s.id} className="border-t border-white/5">
                            <td className="py-1 px-2 text-muted-foreground">
                              {new Date(s.date_played).toLocaleDateString("en-GB")}
                            </td>
                            <td className="py-1 px-2">
                              {editingScore === s.id ? (
                                <input type="number" min={1} max={45} value={editValue}
                                  onChange={(e) => setEditValue(Number(e.target.value))}
                                  className="w-16 bg-white/10 border border-purple-500 rounded px-2 py-0.5 text-white text-xs focus:outline-none" />
                              ) : (
                                <span className="font-semibold text-purple-400">{s.score}</span>
                              )}
                            </td>
                            <td className="py-1 px-2">
                              <div className="flex gap-2">
                                {editingScore === s.id ? (
                                  <>
                                    <button onClick={() => saveScore(s.id, u.user_id)}
                                      className="text-xs text-green-400 hover:text-green-300">Save</button>
                                    <button onClick={() => setEditingScore(null)}
                                      className="text-xs text-muted-foreground hover:text-white">Cancel</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => { setEditingScore(s.id); setEditValue(s.score); }}
                                      className="text-xs text-purple-400 hover:text-purple-300">Edit</button>
                                    <button onClick={() => deleteScore(s.id, u.user_id)}
                                      className="text-xs text-red-400 hover:text-red-300">Delete</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
