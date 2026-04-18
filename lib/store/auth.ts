import { create } from "zustand";
import { User, AuthUser } from "@/types";
import { supabase } from "@/lib/supabase";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) throw error;

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name,
          },
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name,
          },
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  checkAuth: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session?.user) {
        set({
          user: {
            id: data.session.user.id,
            email: data.session.user.email!,
            name: data.session.user.user_metadata?.name,
          },
          isAuthenticated: true,
        });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },
}));
