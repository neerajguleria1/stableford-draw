"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Draw {
  id: string;
  name: string;
  draw_date: string;
  status: string;
  drawn_numbers: number[];
  total_raised: number;
}

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("draws")
      .select("id, name, draw_date, status, drawn_numbers, total_raised")
      .order("draw_date", { ascending: false })
      .then(({ data }) => {
        setDraws(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold gradient-text mb-4">Weekly Draws</h1>
        <p className="text-gray-400 text-lg">View all past and upcoming golf draws</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : draws.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-lg">No draws yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((draw) => (
            <div key={draw.id} className="glass-card flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold">{draw.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(draw.draw_date).toLocaleDateString("en-GB", { dateStyle: "long" })}
                </p>
              </div>

              <div className="flex gap-1.5">
                {(draw.drawn_numbers ?? []).map((n, i) => (
                  <span key={i} className="w-8 h-8 rounded-full bg-purple-600/40 text-purple-300 text-xs flex items-center justify-center font-bold">
                    {n}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Pot: £{(draw.total_raised ?? 0).toFixed(2)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  draw.status === "completed" ? "bg-green-500/20 text-green-400" :
                  draw.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-white/10 text-muted-foreground"
                }`}>
                  {draw.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
