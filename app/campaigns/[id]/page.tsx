"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

interface Draw {
  id: string;
  name: string;
  draw_date: string;
  status: string;
  drawn_numbers: number[];
  total_raised: number;
  mode: string;
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from("draws")
      .select("id, name, draw_date, status, drawn_numbers, total_raised, mode")
      .eq("id", params.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setDraw(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !draw) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold">Draw not found</p>
          <Link href="/campaigns" className="text-purple-400 hover:underline text-sm">← Back to draws</Link>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/campaigns" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft size={16} /> All Draws
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">{draw.name}</h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                {new Date(draw.draw_date).toLocaleDateString("en-GB", { dateStyle: "long" })}
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColor[draw.status] ?? "bg-white/10 text-muted-foreground"}`}>
              {draw.status}
            </span>
          </div>

          {/* Drawn Numbers */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Drawn Numbers</p>
            {draw.drawn_numbers?.length > 0 ? (
              <div className="flex gap-3 flex-wrap">
                {draw.drawn_numbers.map((n, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08, type: "spring" }}
                    className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-neon">
                    {n}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Numbers not yet drawn.</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-muted-foreground">Prize Pot</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                £{(draw.total_raised ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Draw Mode</p>
              <p className="text-lg font-semibold mt-1 capitalize">{draw.mode ?? "Random"}</p>
            </div>
          </div>

          {/* Prize Tiers */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <p className="text-sm font-medium">Prize Distribution</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "5 Match", pct: "40%", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", note: "Jackpot" },
                { label: "4 Match", pct: "35%", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", note: "2nd Prize" },
                { label: "3 Match", pct: "25%", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", note: "3rd Prize" },
              ].map(({ label, pct, color, bg, note }) => (
                <div key={label} className={`rounded-xl p-3 border text-center ${bg}`}>
                  <p className={`text-xl font-bold ${color}`}>{pct}</p>
                  <p className="text-xs font-medium mt-1">{label}</p>
                  <p className="text-xs text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="glass-card text-center space-y-4 border border-purple-500/20">
          <Trophy size={28} className="text-yellow-400 mx-auto" />
          <p className="font-semibold">Want to enter the next draw?</p>
          <p className="text-sm text-muted-foreground">Subscribe and submit your scores to participate.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/auth/signup" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all text-sm">
              Subscribe Now
            </Link>
            <Link href="/campaigns" className="glass-button text-sm font-medium">
              All Draws
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
