"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold gradient-text mb-8">Privacy Policy</h1>

        <div className="glass p-8 rounded-lg space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-400 leading-relaxed">
              At ImpactHub, we are committed to protecting your privacy and ensuring you have a
              positive experience on our platform. This Privacy Policy explains how we collect,
              use, and safeguard your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              We collect information you provide directly to us, such as:
            </p>
            <ul className="text-gray-400 list-disc list-inside space-y-2">
              <li>Account registration information</li>
              <li>Payment and billing information</li>
              <li>Communication preferences</li>
              <li>Profile information and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              We use collected information to:
            </p>
            <ul className="text-gray-400 list-disc list-inside space-y-2">
              <li>Provide and improve our services</li>
              <li>Process donations and manage campaigns</li>
              <li>Send updates about your contributions</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p className="text-gray-400 leading-relaxed">
              We implement comprehensive security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. All sensitive
              data is encrypted using industry-standard protocols.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
            <p className="text-gray-400 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at
              privacy@impacthub.com
            </p>
          </section>

          <section className="border-t border-white/10 pt-8">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
