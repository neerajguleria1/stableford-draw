"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold gradient-text mb-8">Terms of Service</h1>

        <div className="glass p-8 rounded-lg space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-400 leading-relaxed">
              By accessing and using the ImpactHub platform, you accept and agree to be bound by
              the terms and provision of this agreement. If you do not agree to abide by the
              above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information
              or software) on ImpactHub for personal, non-commercial transitory viewing only. This
              is the grant of a license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="text-gray-400 list-disc list-inside space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the site</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
            <p className="text-gray-400 leading-relaxed">
              The materials on ImpactHub's website are provided on an 'as is' basis. ImpactHub
              makes no warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
            <p className="text-gray-400 leading-relaxed">
              In no event shall ImpactHub or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business
              interruption,) arising out of the use or inability to use the materials on
              ImpactHub, even if ImpactHub or a ImpactHub authorized representative has been
              notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Revisions and Errata</h2>
            <p className="text-gray-400 leading-relaxed">
              The materials appearing on ImpactHub could include technical, typographical, or
              photographic errors. ImpactHub does not warrant that any of the materials on the
              website are accurate, complete, or current. ImpactHub may make changes to the
              materials contained on the website at any time without notice.
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
