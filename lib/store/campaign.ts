import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface Draw {
  id: string;
  name: string;
  draw_date: string;
  status: string;
  drawn_numbers: number[];
  total_raised: number;
  mode: string;
}

type DrawState = {
  draws: Draw[];
  loading: boolean;
  fetchDraws: () => Promise<void>;
};

export const useCampaignStore = create<DrawState>((set) => ({
  draws: [],
  loading: false,

  fetchDraws: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("draws")
        .select("id, name, draw_date, status, drawn_numbers, total_raised, mode")
        .order("draw_date", { ascending: false });

      if (error) throw error;
      set({ draws: data ?? [] });
    } catch (error) {
      console.error("Fetch draws error:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
