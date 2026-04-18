"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Heart, Share2, Users, TrendingUp, Loader } from "lucide-react";
import { calculateProgressPercentage, formatCurrency } from "@/lib/utils";

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock campaign data
  const campaign = {
    id: params.id,
    title: "Clean Water Initiative",
    description:
      "Bringing clean water to underserved communities across sub-Saharan Africa",
    longDescription:
      "Water scarcity affects over 2 billion people worldwide. Our Clean Water Initiative focuses on building sustainable water infrastructure in rural communities across sub-Saharan Africa, providing clean, safe drinking water and improving sanitation.",
    category: "Health & Water",
    target_amount: 500000,
    current_amount: 347500,
    image_url: null,
    status: "active",
    donors: 847,
    days_remaining: 45,
    impacts: [
      { metric: "People Served", value: "125,000", unit: "people" },
      { metric: "Wells Built", value: "145", unit: "wells" },
      { metric: "Health Improvements", value: "89%", unit: "increase" },
      { metric: "Disease Reduction", value: "62%", unit: "decrease" },
    ],
  };

  const progress = calculateProgressPercentage(
    campaign.current_amount,
    campaign.target_amount
  );

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Successfully donated ${formatCurrency(parseFloat(donationAmount))}`);
      setDonationAmount("");
    } catch (error) {
      console.error("Error processing donation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-96 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg mb-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Title */}
          <div>
            <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full mb-4">
              {campaign.category}
            </span>
            <h1 className="text-5xl font-bold text-white mb-4">
              {campaign.title}
            </h1>
            <p className="text-xl text-gray-400">{campaign.description}</p>
          </div>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About This Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 leading-relaxed">
                {campaign.longDescription}
              </p>
            </CardContent>
          </Card>

          {/* Impact Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Impact Metrics</CardTitle>
              <CardDescription>Real results from this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {campaign.impacts.map((impact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="glass p-4 rounded-lg text-center"
                  >
                    <p className="text-2xl font-bold gradient-text">
                      {impact.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{impact.metric}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  date: "2 days ago",
                  title: "50% Funding Milestone Reached!",
                  description:
                    "We've hit our halfway point! Thanks to all our generous supporters.",
                },
                {
                  date: "1 week ago",
                  title: "First Well Completed",
                  description:
                    "The first water well in the initiative has been successfully completed and is serving 2,000 people.",
                },
              ].map((update, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-white/10 pb-6 last:border-0 last:pb-0"
                >
                  <p className="text-sm text-gray-500 mb-2">{update.date}</p>
                  <p className="font-semibold text-white mb-2">{update.title}</p>
                  <p className="text-gray-400">{update.description}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Donation Card */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">
                {formatCurrency(campaign.current_amount)}
              </CardTitle>
              <CardDescription>
                of {formatCurrency(campaign.target_amount)} raised
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress */}
              <div>
                <Progress value={progress} className="h-3 mb-2" />
                <p className="text-sm text-gray-400 text-center">
                  {Math.round(progress)}% funded
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400">Donors</p>
                  <p className="text-2xl font-bold text-white">
                    {campaign.donors.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Days Left</p>
                  <p className="text-2xl font-bold text-accent">
                    {campaign.days_remaining}
                  </p>
                </div>
              </div>

              {/* Donation Form */}
              <form onSubmit={handleDonate} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Donation Amount
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-black/40 border border-white/20 border-r-0 rounded-l-md text-gray-400">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader size={20} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart size={20} className="mr-2" />
                      Donate Now
                    </>
                  )}
                </Button>
              </form>

              {/* Quick Amounts */}
              <div className="grid grid-cols-3 gap-2">
                {[25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setDonationAmount(amount.toString())}
                    className="text-xs"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>

              {/* Share */}
              <Button variant="outline" className="w-full">
                <Share2 size={20} className="mr-2" />
                Share Campaign
              </Button>
            </CardContent>
          </Card>

          {/* Supporters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Supporters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Anonymous", amount: 1000 },
                { name: "Jane Smith", amount: 500 },
                { name: "Michael Chen", amount: 250 },
                { name: "Emma Johnson", amount: 100 },
              ].map((supporter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-300">{supporter.name}</span>
                  <span className="text-accent font-semibold">
                    ${supporter.amount}
                  </span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
