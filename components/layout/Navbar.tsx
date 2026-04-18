"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PUBLIC_LINKS = [
  { label: "Charities", href: "/charities" },
  { label: "How It Works", href: "/#how-it-works" },
];

const AUTH_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Scores", href: "/dashboard/scores" },
  { label: "Draws", href: "/dashboard/draw" },
];

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⛳</span>
            </div>
            <span className="font-bold text-white hidden sm:inline">GolfDraw</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {PUBLIC_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="text-gray-300 hover:text-white transition-colors text-sm">
                {label}
              </Link>
            ))}
            {isAuthenticated && AUTH_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="text-gray-300 hover:text-white transition-colors text-sm">
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <button onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login"
                  className="text-sm text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all">
                  Subscribe
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="md:hidden pb-4 space-y-3">
              {PUBLIC_LINKS.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-white transition-colors text-sm py-1">
                  {label}
                </Link>
              ))}
              {isAuthenticated && AUTH_LINKS.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-white transition-colors text-sm py-1">
                  {label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/10 space-y-2">
                {isAuthenticated ? (
                  <button onClick={handleSignOut} className="w-full text-left text-sm text-gray-300 hover:text-white py-1">
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}
                      className="block text-sm text-gray-300 hover:text-white py-1">Sign In</Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}
                      className="block w-full bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center">
                      Subscribe
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
