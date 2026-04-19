"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, ArrowLeft, Calendar, ExternalLink, Gift } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store/auth";

interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  website_url?: string;
  total_raised: number;
  status: string;
  created_at: string;
  events?: CharityEvent[];
}

interface CharityEvent {
  id: string;
  title: string;
  event_date: string;
  description: string;
  location?: string;
}

export default function CharityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const charityId = use(params).id;
  const [charity, setCharity] = useState<Charity | null>(null);
  const [events, setEvents] = useState<CharityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [donateError, setDonateError] = useState("");
  const [donated, setDonated] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("charities")
        .select("id, name, description, logo_url, website_url, total_raised, status, created_at")
        .eq("id", charityId)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCharity(data);

      // Load events if the table exists
      const { data: eventsData } = await supabase
        .from("charity_events")
        .select("id, title, event_date, description, location")
        .eq("charity_id", charityId)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(5);

      setEvents(eventsData ?? []);
      setLoading(false);
    }
    load();

    // Check if returning from a successful donation
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("donated") === "true") setDonated(true);
  }, [charityId]);

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(donationAmount);
    if (!amt || amt < 1) return setDonateError("Minimum donation is £1");
    setDonating(true);
    setDonateError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charityId: charityId,
          amount: amt,
          userId: session?.user?.id ?? null,
          email: session?.user?.email ?? "anonymous@golfdraw.co.uk",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      window.location.href = json.url;
    } catch (err: any) {
      setDonateError(err.message);
      setDonating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !charity) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold">Charity not found</p>
          <Link href="/charities" className="text-purple-400 hover:underline text-sm">
            ← Back to charities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back */}
        <Link
          href="/charities"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          All Charities
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card space-y-5"
        >
          <div className="flex items-start gap-5">
            {charity.logo_url ? (
              <img
                src={charity.logo_url}
                alt={charity.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart size={32} className="text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{charity.name}</h1>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  {charity.status}
                </span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {charity.description}
              </p>
              {charity.website_url && (
                <a
                  href={charity.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm mt-2 transition-colors"
                >
                  Visit website <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-muted-foreground">Total Raised</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                £{(charity.total_raised ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Partner Since</p>
              <p className="text-lg font-semibold mt-1">
                {new Date(charity.created_at).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" />
            Upcoming Events
          </h2>

          {events.length === 0 ? (
            <div className="glass-card text-center py-8 text-muted-foreground text-sm">
              No upcoming events scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="glass-card space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-purple-400">
                        {new Date(event.event_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Donation Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card space-y-4 border border-green-500/20"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Gift size={18} className="text-green-400" />
            Make a One-Off Donation
          </h2>
          <p className="text-sm text-muted-foreground">
            Support {charity.name} directly — no subscription required.
          </p>

          {donated && (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
              ✅ Thank you for your donation! It means a lot.
            </div>
          )}

          <form onSubmit={handleDonate} className="space-y-3">
            <div className="flex gap-2">
              {[5, 10, 25, 50].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDonationAmount(String(amt))}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                    donationAmount === String(amt)
                      ? "bg-green-600 border-green-500 text-white"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  £{amt}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Other amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            {donateError && <p className="text-red-400 text-sm">{donateError}</p>}
            <button
              type="submit"
              disabled={donating || !donationAmount}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {donating ? "Redirecting..." : `Donate ${donationAmount ? `£${donationAmount}` : ""}`}
            </button>
          </form>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card text-center space-y-4 border border-purple-500/20"
        >
          <Heart size={28} className="text-pink-400 mx-auto" />
          <p className="font-semibold">Support {charity.name}</p>
          <p className="text-sm text-muted-foreground">
            Subscribe to GolfDraw and choose this charity — 10% of your subscription goes directly to them.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all text-sm"
            >
              Subscribe & Support
            </Link>
            <Link
              href="/charities"
              className="glass-button text-sm font-medium"
            >
              Browse All Charities
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
