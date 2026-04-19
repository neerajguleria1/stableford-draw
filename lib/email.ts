/**
 * Email notification service.
 * Uses Resend (https://resend.com) if RESEND_API_KEY is set.
 * Falls back to console logging in development.
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Dev fallback — log to console
    console.log("[EMAIL]", payload.to, "|", payload.subject);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "GolfDraw <noreply@golfdraw.co.uk>",
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

export function welcomeEmail(name: string): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#e2e8f0;background:#0f0f1a;padding:32px;border-radius:12px">
      <h1 style="color:#a855f7;margin-bottom:8px">Welcome to GolfDraw 🏌️</h1>
      <p>Hi ${name},</p>
      <p>Your account is set up and ready. Here's what to do next:</p>
      <ol style="line-height:2">
        <li>Subscribe to a plan (monthly or yearly)</li>
        <li>Enter your latest Stableford golf scores</li>
        <li>Choose a charity to support</li>
        <li>Wait for the monthly draw — and win!</li>
      </ol>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe"
         style="display:inline-block;background:#9333ea;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
        Subscribe Now
      </a>
      <p style="color:#64748b;font-size:12px;margin-top:32px">GolfDraw · Play Golf. Win Prizes. Change Lives.</p>
    </div>`;
}

export function drawResultEmail(
  name: string,
  drawName: string,
  drawnNumbers: number[],
  matchedNumbers: number[],
  tier: string | null,
  prizeAmount: number | null
): string {
  const won = tier !== null;
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#e2e8f0;background:#0f0f1a;padding:32px;border-radius:12px">
      <h1 style="color:#a855f7">${won ? "🎉 You Won!" : "Draw Results"}</h1>
      <p>Hi ${name},</p>
      <p>The <strong>${drawName}</strong> draw has been completed.</p>
      <p><strong>Drawn numbers:</strong> ${drawnNumbers.join(", ")}</p>
      ${won
        ? `<p style="color:#4ade80;font-size:18px;font-weight:700">
             You matched ${matchedNumbers.join(", ")} — ${tier}!
             Prize: £${prizeAmount?.toFixed(2)}
           </p>
           <p>Please upload your proof of scores to claim your prize.</p>
           <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winner-proof"
              style="display:inline-block;background:#9333ea;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
             Upload Proof
           </a>`
        : `<p>No match this time — keep playing, the jackpot rolls over!</p>`
      }
      <p style="color:#64748b;font-size:12px;margin-top:32px">GolfDraw · Play Golf. Win Prizes. Change Lives.</p>
    </div>`;
}

export function winnerApprovedEmail(name: string, tier: string, amount: number): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#e2e8f0;background:#0f0f1a;padding:32px;border-radius:12px">
      <h1 style="color:#4ade80">✅ Prize Approved!</h1>
      <p>Hi ${name},</p>
      <p>Your <strong>${tier}</strong> prize of <strong>£${amount.toFixed(2)}</strong> has been verified and approved.</p>
      <p>Your payout is now being processed. You'll receive it shortly.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/history"
         style="display:inline-block;background:#9333ea;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
        View History
      </a>
      <p style="color:#64748b;font-size:12px;margin-top:32px">GolfDraw · Play Golf. Win Prizes. Change Lives.</p>
    </div>`;
}

export function winnerRejectedEmail(name: string, tier: string, reason: string): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#e2e8f0;background:#0f0f1a;padding:32px;border-radius:12px">
      <h1 style="color:#f87171">❌ Proof Rejected</h1>
      <p>Hi ${name},</p>
      <p>Unfortunately your proof for the <strong>${tier}</strong> prize could not be verified.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>Please contact support if you believe this is an error.</p>
      <p style="color:#64748b;font-size:12px;margin-top:32px">GolfDraw · Play Golf. Win Prizes. Change Lives.</p>
    </div>`;
}

export function subscriptionConfirmEmail(name: string, plan: string, amount: number): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#e2e8f0;background:#0f0f1a;padding:32px;border-radius:12px">
      <h1 style="color:#a855f7">Subscription Confirmed 🎉</h1>
      <p>Hi ${name},</p>
      <p>Your <strong>${plan}</strong> subscription of <strong>£${amount.toFixed(2)}</strong> is now active.</p>
      <p>You're all set to enter your scores and join the next monthly draw!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scores"
         style="display:inline-block;background:#9333ea;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
        Enter Your Scores
      </a>
      <p style="color:#64748b;font-size:12px;margin-top:32px">GolfDraw · Play Golf. Win Prizes. Change Lives.</p>
    </div>`;
}
