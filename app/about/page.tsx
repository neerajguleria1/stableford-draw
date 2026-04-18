"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, Target, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <h1 className="text-5xl font-bold gradient-text mb-4">About ImpactHub</h1>
        <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
          Reimagining philanthropy through radical transparency, measurable impact, and
          modern technology
        </p>
      </motion.div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-20 glass rounded-2xl p-12"
      >
        <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
        <p className="text-lg text-gray-300 leading-relaxed">
          We believe that every dollar donated should be tracked with the same precision as
          any business transaction. ImpactHub empowers donors to see exactly where their
          money goes and the real-world impact it creates. By combining cutting-edge
          technology with a commitment to transparency, we're building the future of
          charitable giving.
        </p>
      </motion.div>

      {/* Values */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-20"
      >
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Transparency",
              description:
                "Complete visibility into how donations are used and what impact they create",
            },
            {
              icon: Target,
              title: "Measurable Impact",
              description:
                "Real metrics and data showing the tangible difference your donations make",
            },
            {
              icon: Users,
              title: "Community",
              description:
                "Building a community of passionate contributors committed to change",
            },
          ].map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="p-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-400">{value.description}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Team */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Sarah Chen", role: "Co-Founder & CEO" },
            { name: "Marcus Rodriguez", role: "Co-Founder & CTO" },
            { name: "Priya Patel", role: "Head of Impact" },
          ].map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-gray-400">{member.role}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
