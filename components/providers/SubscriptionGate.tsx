"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user } = useAuthStore();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()
      .then(({ data }) => setHasSubscription(!!data));
  }, [user]);

  if (hasSubscription === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full text-center space-y-5 border border-purple-500/20">
          <div className="text-5xl">🔒</div>
          <h2 className="text-xl font-bold">Subscription Required</h2>
          <p className="text-muted-foreground text-sm">
            This feature is available to active subscribers only.
            Subscribe to access score entry, draws, and prizes.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/subscribe"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all text-sm">
              View Subscription Plans
            </Link>
            <Link href="/dashboard"
              className="text-sm text-muted-foreground hover:text-white transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
