"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Heart, Flag } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const HOW_IT_WORKS = [
  { icon: Flag, step: "1", title: "Enter Your Scores", desc: "Submit your latest Stableford golf scores — up to 5 at a time." },
  { icon: Trophy, step: "2", title: "Monthly Draw", desc: "5 numbers are drawn each month. Match 3, 4, or 5 to win prizes." },
  { icon: Heart, step: "3", title: "Support Charity", desc: "10% of every subscription goes directly to your chosen charity." },
];

const PRIZE_TIERS = [
  { match: "5 Numbers", share: "40%", label: "Jackpot", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  { match: "4 Numbers", share: "35%", label: "Second Prize", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  { match: "3 Numbers", share: "25%", label: "Third Prize", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
];

interface FeaturedCharity {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  total_raised: number;
}

export function HeroSection() {
  const [featured, setFeatured] = useState<FeaturedCharity | null>(null);

  useEffect(() => {
    supabase
      .from("charities")
      .select("id, name, description, logo_url, total_raised")
      .eq("status", "active")
      .order("total_raised", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setFeatured(data ?? null));
  }, []);
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 -z-10">
          <motion.div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
            animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
            animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 glass rounded-full">
            <Heart size={14} className="text-pink-400" />
            <span className="text-sm text-gray-300">Golf · Charity · Monthly Prizes</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 gradient-text leading-tight">
            Play Golf.<br />Win Prizes.<br />Change Lives.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Subscribe, enter your Stableford scores, and enter our monthly prize draw —
            while supporting a charity you care about.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all group">
              Start Your Subscription
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/charities"
              className="glass-button text-sm font-medium">
              Browse Charities
            </Link>
          </motion.div>

          {/* Draw numbers visual */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-3 mt-14">
            {[7, 14, 23, 31, 42].map((n, i) => (
              <motion.div key={n}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                className="w-14 h-14 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-white font-bold text-lg shadow-neon">
                {n}
              </motion.div>
            ))}
          </motion.div>
          <p className="text-xs text-muted-foreground mt-3">Sample monthly draw numbers</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-3">How It Works</h2>
          <p className="text-gray-400">Three simple steps to play, win, and give back</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
            <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto">
                <Icon size={22} className="text-white" />
              </div>
              <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Step {step}</div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Prize Tiers */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-3">Prize Pool</h2>
          <p className="text-gray-400">Match numbers from the monthly draw to win your share</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRIZE_TIERS.map(({ match, share, label, color, bg }) => (
            <motion.div key={match} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              className={`glass-card text-center space-y-2 border ${bg}`}>
              <p className={`text-4xl font-bold ${color}`}>{share}</p>
              <p className="font-semibold">{label}</p>
              <p className="text-sm text-muted-foreground">Match {match}</p>
              {match === "5 Numbers" && (
                <p className="text-xs text-yellow-400">🔄 Rolls over if unclaimed</p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Charity Impact */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="glass-card text-center space-y-6 border border-pink-500/20">
          <Heart size={40} className="text-pink-400 mx-auto" />
          <h2 className="text-3xl font-bold gradient-text">Every Subscription Gives Back</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A minimum of 10% of every subscription goes directly to your chosen charity.
            You choose who benefits — from cancer research to mental health support.
          </p>

          {/* Featured Charity Spotlight */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="max-w-sm mx-auto glass rounded-xl p-4 border border-pink-500/20 text-left space-y-3"
            >
              <p className="text-xs text-pink-400 font-semibold uppercase tracking-wider">⭐ Spotlight Charity</p>
              <div className="flex items-center gap-3">
                {featured.logo_url ? (
                  <img src={featured.logo_url} alt={featured.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart size={20} className="text-white" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{featured.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{featured.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total raised</span>
                <span className="text-green-400 font-semibold">
                  £{(featured.total_raised ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Link
                href={`/charities/${featured.id}`}
                className="block text-center text-xs text-pink-400 hover:text-pink-300 transition-colors"
              >
                Learn more →
              </Link>
            </motion.div>
          )}

          <Link href="/charities"
            className="inline-flex items-center gap-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-300 font-medium px-6 py-2.5 rounded-xl transition-all">
            See All Charities <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="glass-card text-center space-y-6 border border-purple-500/20">
          <h2 className="text-3xl font-bold text-white">Ready to Play?</h2>
          <p className="text-gray-400">Join today — subscribe, enter your scores, and be part of the next draw.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
              Subscribe Now
            </Link>
            <Link href="/auth/login"
              className="glass-button text-sm font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
