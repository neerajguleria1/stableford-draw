"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Trophy, Heart, Flag, Users } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalSubscribers: number;
  totalCharityRaised: number;
  totalDraws: number;
  totalPaidOut: number;
  charities: { name: string; total_raised: number; logo_url?: string }[];
}

export default function ImpactPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [subsRes, charitiesRes, drawsRes, payoutsRes] = await Promise.all([
        supabase.from("subscriptions").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("charities").select("name, total_raised, logo_url").eq("status", "active").order("total_raised", { ascending: false }).limit(6),
        supabase.from("draws").select("id", { count: "exact" }).eq("status", "completed"),
        supabase.from("payouts").select("amount").eq("status", "paid"),
      ]);

      const totalCharityRaised = (charitiesRes.data ?? []).reduce((s, c) => s + (c.total_raised ?? 0), 0);
      const totalPaidOut = (payoutsRes.data ?? []).reduce((s: number, p: any) => s + p.amount, 0);

      setStats({
        totalSubscribers: subsRes.count ?? 0,
        totalCharityRaised,
        totalDraws: drawsRes.count ?? 0,
        totalPaidOut,
        charities: charitiesRes.data ?? [],
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const metrics = [
    { icon: Users, label: "Active Subscribers", value: stats!.totalSubscribers.toLocaleString(), color: "from-purple-600 to-pink-600" },
    { icon: Heart, label: "Total Raised for Charity", value: `£${stats!.totalCharityRaised.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, color: "from-pink-600 to-red-600" },
    { icon: Trophy, label: "Draws Completed", value: stats!.totalDraws.toLocaleString(), color: "from-yellow-500 to-orange-500" },
    { icon: Flag, label: "Prizes Paid Out", value: `£${stats!.totalPaidOut.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, color: "from-blue-600 to-cyan-600" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-5xl font-bold gradient-text">Our Impact</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Real numbers from real subscribers. Every subscription makes a difference.
          </p>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {metrics.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="glass-card space-y-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={22} className="text-white" />
              </div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charity Leaderboard */}
        {stats!.charities.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-center gradient-text">Charities We Support</h2>
            <div className="space-y-3">
              {stats!.charities.map((c, i) => (
                <div key={c.name} className="glass-card flex items-center gap-4">
                  <span className="text-2xl font-bold text-muted-foreground w-8 text-center">
                    {i + 1}
                  </span>
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart size={18} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                  </div>
                  <p className="text-green-400 font-bold flex-shrink-0">
                    £{(c.total_raised ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/charities" className="text-purple-400 hover:underline text-sm">
                View all charities →
              </Link>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          className="glass-card text-center space-y-4 border border-purple-500/20">
          <h2 className="text-2xl font-bold">Be Part of the Impact</h2>
          <p className="text-muted-foreground text-sm">Subscribe, play, and give back — all in one place.</p>
          <Link href="/auth/signup"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
            Get Started
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
