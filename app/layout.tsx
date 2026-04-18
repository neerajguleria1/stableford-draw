import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImpactHub - Transparent Charity Platform",
  description:
    "Empowering change through radical transparency in charitable giving. Track every donation, measure every impact.",
  keywords: [
    "charity",
    "donations",
    "impact",
    "transparency",
    "fundraising",
    "nonprofit",
  ],
  creator: "ImpactHub Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://impacthub.com",
    title: "ImpactHub - Transparent Charity Platform",
    description:
      "Empowering change through radical transparency in charitable giving",
    images: [
      {
        url: "https://impacthub.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "ImpactHub",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
