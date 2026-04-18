"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Heart } from "lucide-react";
import Link from "next/link";

interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  total_raised: number;
  status: string;
}

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [filtered, setFiltered] = useState<Charity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("charities")
      .select("id, name, description, logo_url, total_raised, status")
      .eq("status", "active")
      .order("name")
      .then(({ data }) => {
        setCharities(data ?? []);
        setFiltered(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      charities.filter(
        (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
      )
    );
  }, [search, charities]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold gradient-text">Our Charities</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Every subscription supports a charity you choose. Browse our verified partners below.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No charities found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <div key={c.id} className="glass-card space-y-3 hover:border-purple-500/30 transition-all border border-transparent">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total raised: <span className="text-white font-medium">£{(c.total_raised ?? 0).toFixed(2)}</span>
                  </span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="glass-card text-center space-y-3 border border-purple-500/20">
          <p className="font-semibold">Ready to support a charity?</p>
          <p className="text-sm text-muted-foreground">Subscribe and choose your charity during signup.</p>
          <Link href="/auth/signup"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all text-sm">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
