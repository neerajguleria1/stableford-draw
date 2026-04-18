import { supabase } from "@/lib/supabase";
import { Campaign, Donation, Impact, CampaignStats } from "@/types";

export const campaignService = {
  async getCampaigns(status?: string) {
    let query = supabase.from("campaigns").select("*");

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async createCampaign(
    campaign: Omit<Campaign, "id" | "created_at" | "updated_at">
  ): Promise<Campaign> {
    const { data, error } = await supabase
      .from("campaigns")
      .insert([campaign])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCampaign(
    id: string,
    updates: Partial<Campaign>
  ): Promise<Campaign> {
    const { data, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCampaign(id: string) {
    const { error } = await supabase.from("campaigns").delete().eq("id", id);

    if (error) throw error;
  },

  async getCampaignStats(campaignId: string): Promise<CampaignStats | null> {
    const { data, error } = await supabase
      .from("campaign_stats")
      .select("*")
      .eq("campaign_id", campaignId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async getDonations(campaignId?: string) {
    let query = supabase.from("donations").select("*");

    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },

  async getImpacts(campaignId: string) {
    const { data, error } = await supabase
      .from("impacts")
      .select("*")
      .eq("campaign_id", campaignId);

    if (error) throw error;
    return data;
  },

  async addImpact(impact: Omit<Impact, "id" | "created_at">): Promise<Impact> {
    const { data, error } = await supabase
      .from("impacts")
      .insert([impact])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
