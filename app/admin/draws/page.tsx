"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Draw {
  id: string;
  name: string;
  draw_date: string;
  status: string;
  drawn_numbers: number[];
  mode: string;
  total_raised: number;
}

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("draws")
      .select("id, name, draw_date, status, drawn_numbers, mode, total_raised")
      .order("draw_date", { ascending: false })
      .then(({ data }) => {
        setDraws(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Draws ({draws.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-left">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Numbers</th>
              <th className="py-2 px-3">Mode</th>
              <th className="py-2 px-3">Pot</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {draws.map((d) => (
              <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-2 px-3">{d.name}</td>
                <td className="py-2 px-3 text-muted-foreground">
                  {new Date(d.draw_date).toLocaleDateString("en-GB")}
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-1">
                    {(d.drawn_numbers ?? []).map((n, i) => (
                      <span key={i} className="w-7 h-7 rounded-full bg-purple-600/40 text-purple-300 text-xs flex items-center justify-center font-bold">
                        {n}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-2 px-3 capitalize text-muted-foreground">{d.mode}</td>
                <td className="py-2 px-3">£{(d.total_raised ?? 0).toFixed(2)}</td>
                <td className="py-2 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    d.status === "completed" ? "bg-green-500/20 text-green-400" :
                    d.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-white/10 text-muted-foreground"
                  }`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
