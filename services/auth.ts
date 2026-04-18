import { supabase } from "@/lib/supabase";
import { User, UserProfile } from "@/types";

export const authService = {
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createUserProfile(userId: string, profile: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert([{ user_id: userId, ...profile }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) throw error;
  },
};
