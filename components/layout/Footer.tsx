"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⛳</span>
              </div>
              <span className="font-bold text-white">GolfDraw</span>
            </div>
            <p className="text-gray-400 text-sm">
              Play golf. Win prizes. Support charity.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Charities", href: "/charities" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Subscribe", href: "/subscribe" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Sign Up", href: "/auth/signup" },
                { label: "Sign In", href: "/auth/login" },
                { label: "Dashboard", href: "/dashboard" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "About", href: "/about" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
            <a href="mailto:hello@golfdraw.com"
              className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm mt-4">
              <Mail size={16} /> hello@golfdraw.com
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} GolfDraw. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Powered by Next.js · Supabase · Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}
