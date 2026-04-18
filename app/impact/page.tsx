"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Globe, Smile, Zap } from "lucide-react";

export default function ImpactPage() {
  const impacts = [
    {
      icon: Smile,
      metric: "2.4M+",
      label: "Lives Impacted",
      description: "Direct positive impact on individuals and communities worldwide",
    },
    {
      icon: Globe,
      metric: "127",
      label: "Countries Reached",
      description: "Global presence supporting causes across the world",
    },
    {
      icon: TrendingUp,
      metric: "$847M+",
      label: "Donated",
      description: "Total funds mobilized through our platform",
    },
    {
      icon: Zap,
      metric: "89K+",
      label: "Contributors",
      description: "Active donors making real change happen",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <h1 className="text-5xl font-bold gradient-text mb-4">Our Impact</h1>
        <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
          Real numbers, real change. This is what we've accomplished together.
        </p>
      </motion.div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {impacts.map((impact, index) => {
          const Icon = impact.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:border-accent/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-4xl font-bold gradient-text mb-2">
                        {impact.metric}
                      </div>
                      <CardTitle className="text-2xl">{impact.label}</CardTitle>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{impact.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Impact Stories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Stories of Change</h2>
        <div className="grid grid-cols-1 gap-8">
          {[
            {
              story: "Education Initiative",
              outcome: "Provided scholarships to 5,000 underprivileged students",
              impact: "+15,000 lives affected",
            },
            {
              story: "Clean Water Project",
              outcome: "Installed water systems in 50 communities",
              impact: "+300,000 people with access",
            },
            {
              story: "Healthcare Access",
              outcome: "Built 25 medical clinics in rural areas",
              impact: "+500,000 people served",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:border-accent/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-2">
                        {item.story}
                      </h3>
                      <p className="text-gray-400 mb-2">{item.outcome}</p>
                      <p className="text-lg text-accent font-semibold">
                        {item.impact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
