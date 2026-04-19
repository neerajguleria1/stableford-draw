"use client";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 space-y-8">
      <h1 className="text-4xl font-bold gradient-text">Terms of Service</h1>
      <div className="glass-card space-y-6 text-gray-400 text-sm leading-relaxed">
        {[
          { title: "1. Eligibility", body: "You must be 18 or older to subscribe and participate in draws. By signing up you confirm you meet this requirement." },
          { title: "2. Subscriptions", body: "Subscriptions are billed monthly or yearly via Stripe. You may cancel at any time. No refunds are issued for partial billing periods." },
          { title: "3. Score Entry", body: "You may submit up to 5 Stableford golf scores at a time. Only one score per date is permitted. Scores must be genuine and accurately reflect your performance." },
          { title: "4. Draw Participation", body: "Active subscribers are automatically eligible for monthly draws. Draws are conducted fairly using random or weighted algorithms as configured by the administrator." },
          { title: "5. Prize Claims", body: "Winners must submit proof of their scores within 14 days of draw results being published. Failure to provide valid proof may result in forfeiture of the prize." },
          { title: "6. Charity Contributions", body: "A minimum of 10% of your subscription fee is contributed to your chosen charity. This amount is non-refundable once processed." },
          { title: "7. Fair Use", body: "Any attempt to manipulate scores, exploit the draw system, or abuse the platform will result in immediate account termination." },
          { title: "8. Changes", body: "We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of updated terms." },
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
