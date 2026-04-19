"use client";

import { motion } from "framer-motion";
import { Trophy, Heart, Flag, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4">
        <h1 className="text-5xl font-bold gradient-text">About GolfDraw</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          A modern platform combining golf performance tracking, monthly prize draws,
          and meaningful charity giving.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        className="glass-card space-y-4">
        <h2 className="text-2xl font-bold">Our Mission</h2>
        <p className="text-gray-400 leading-relaxed">
          GolfDraw was built to make golf more rewarding — not just on the course, but off it.
          Every subscriber enters their Stableford scores, participates in monthly draws,
          and automatically contributes to a charity they care about. We believe sport and
          social good belong together.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Flag, title: "Golf First", desc: "Built around Stableford scoring — the format golfers actually use." },
          { icon: Trophy, title: "Fair Draws", desc: "Monthly draws with transparent random or weighted algorithms." },
          { icon: Heart, title: "Charity Built-In", desc: "Minimum 10% of every subscription goes to your chosen charity." },
          { icon: Shield, title: "Secure & Transparent", desc: "Supabase auth, Stripe payments, and open prize pool calculations." },
        ].map(({ icon: Icon, title, desc }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="glass-card space-y-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Icon size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
