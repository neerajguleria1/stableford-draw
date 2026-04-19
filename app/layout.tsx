import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "GolfDraw — Play Golf. Win Prizes. Support Charity.",
  description:
    "Subscribe, enter your Stableford golf scores, and participate in monthly prize draws while supporting a charity of your choice.",
  keywords: ["golf", "stableford", "charity", "prize draw", "subscription", "monthly draw"],
  creator: "GolfDraw",
  openGraph: {
    type: "website",
    locale: "en_GB",
    title: "GolfDraw — Play Golf. Win Prizes. Support Charity.",
    description: "Monthly golf prize draws with charity giving built in.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
