"use client";

import { Campaign } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Heart, Users } from "lucide-react";
import { calculateProgressPercentage, formatCurrency } from "@/lib/utils";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = calculateProgressPercentage(
    campaign.current_amount,
    campaign.target_amount
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ translateY: -5 }}
    >
      <Card className="h-full hover:border-accent/50 transition-all duration-300 overflow-hidden group">
        {/* Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-600/30 to-pink-600/30"
          />
        </div>

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">
                {campaign.title}
              </CardTitle>
              <CardDescription className="mt-2 line-clamp-2">
                {campaign.description}
              </CardDescription>
            </div>
            <span className="ml-2 px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full whitespace-nowrap">
              {campaign.category}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress */}
          <div>
            <Progress value={progress} className="h-2" />
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-400">
                {formatCurrency(campaign.current_amount)}
              </span>
              <span className="text-gray-500">
                of {formatCurrency(campaign.target_amount)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Heart size={16} className="text-pink-500" />
              <span>{Math.round(Math.random() * 500)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users size={16} className="text-blue-500" />
              <span>{Math.round(Math.random() * 1000)} donors</span>
            </div>
          </div>

          {/* CTA */}
          <Link href={`/campaigns/${campaign.id}`} className="block">
            <Button size="sm" variant="default" className="w-full group/btn">
              <span>View Details</span>
              <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
