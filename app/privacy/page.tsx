"use client";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 space-y-8">
      <h1 className="text-4xl font-bold gradient-text">Privacy Policy</h1>
      <div className="glass-card space-y-6 text-gray-400 text-sm leading-relaxed">
        {[
          { title: "1. Information We Collect", body: "We collect your name, email, golf scores, and payment information to provide the GolfDraw service. Payment data is handled securely by Stripe and never stored on our servers." },
          { title: "2. How We Use Your Data", body: "Your data is used to manage your subscription, process draw entries, calculate prizes, and distribute charity contributions. We do not sell your data to third parties." },
          { title: "3. Golf Scores", body: "Your submitted Stableford scores are used solely for draw participation. Only your latest 5 scores are retained at any time." },
          { title: "4. Payments", body: "All payments are processed by Stripe. We store only your subscription status and plan type — never your card details." },
          { title: "5. Data Security", body: "We use Supabase with row-level security, HTTPS encryption, and JWT-based authentication to protect your account." },
          { title: "6. Contact", body: "For privacy enquiries, contact us at privacy@golfdraw.com" },
        ].map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-white font-semibold mb-2">{title}</h2>
            <p>{body}</p>
          </section>
        ))}
        <p className="text-xs text-gray-500 border-t border-white/10 pt-4">
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>
      </div>
    </div>
  );
}
