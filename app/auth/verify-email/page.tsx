"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from session storage if available
    const storedEmail = sessionStorage.getItem("signup_email");
    setEmail(storedEmail || "your email");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
              <Mail size={32} className="text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We sent a confirmation link to {email}. Click the link to verify
              your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 glass rounded-lg border border-white/10 text-center">
              <p className="text-sm text-gray-400 mb-3">
                Don't see the email?
              </p>
              <ul className="text-xs text-gray-500 space-y-2">
                <li>• Check your spam folder</li>
                <li>• Verification link expires in 24 hours</li>
              </ul>
            </div>

            <Button asChild className="w-full">
              <Link href="/dashboard">
                Continue to Dashboard
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login" className="flex items-center justify-center">
                <ArrowLeft size={16} className="mr-2" />
                Back to Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
