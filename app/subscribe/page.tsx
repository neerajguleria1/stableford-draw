"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "£10",
    period: "/month",
    description: "Billed monthly. Cancel anytime.",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "£100",
    period: "/year",
    description: "Save £20 vs monthly. Billed annually.",
    badge: "Best Value",
  },
];

export default function SubscribePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [selected, setSelected] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!user) return router.push("/auth/login");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2">
            Subscribe to enter weekly golf draws and support charity.
          </p>
        </div>

        <div className="space-y-4">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id as "monthly" | "yearly")}
              className={`w-full glass-card text-left transition-all duration-200 border-2 ${
                selected === plan.id
                  ? "border-purple-500"
                  : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{plan.label}</span>
                    {plan.badge && (
                      <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Redirecting to Stripe..." : "Subscribe Now"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
