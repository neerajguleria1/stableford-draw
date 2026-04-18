"use client";

import { useState } from "react";

interface Score {
  id: string;
  score: number;
  date_played: string;
}

interface ScoreTableProps {
  scores: Score[];
  onDelete: (id: string) => void;
  onEdit: (id: string, score: number) => void;
}

export function ScoreTable({ scores, onDelete, onEdit }: ScoreTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  function startEdit(s: Score) {
    setEditingId(s.id);
    setEditValue(s.score);
  }

  function confirmEdit(id: string) {
    if (editValue < 1 || editValue > 45) return;
    onEdit(id, editValue);
    setEditingId(null);
  }

  if (scores.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-6">
        No scores yet. Submit your first score above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-muted-foreground">
            <th className="text-left py-2 px-3">#</th>
            <th className="text-left py-2 px-3">Date</th>
            <th className="text-left py-2 px-3">Score</th>
            <th className="text-left py-2 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
              <td className="py-2 px-3">
                {new Date(s.date_played).toLocaleDateString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </td>
              <td className="py-2 px-3">
                {editingId === s.id ? (
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-16 bg-white/10 border border-purple-500 rounded px-2 py-0.5 text-white focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-purple-400">{s.score}</span>
                )}
              </td>
              <td className="py-2 px-3">
                <div className="flex gap-3">
                  {editingId === s.id ? (
                    <>
                      <button onClick={() => confirmEdit(s.id)}
                        className="text-xs text-green-400 hover:text-green-300">Save</button>
                      <button onClick={() => setEditingId(null)}
                        className="text-xs text-muted-foreground hover:text-white">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(s)}
                        className="text-xs text-purple-400 hover:text-purple-300">Edit</button>
                      <button onClick={() => onDelete(s.id)}
                        className="text-xs text-red-400 hover:text-red-300">Delete</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
