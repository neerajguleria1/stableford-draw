"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  user_id: string;
  full_name: string;
  email: string;
  created_at: string;
  subscriptions: { status: string; plan_type: string }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("users_profiles")
      .select("user_id, full_name, email, created_at, subscriptions(status, plan_type)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setUsers((data as any) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Users ({users.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-left">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Subscription</th>
              <th className="py-2 px-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const sub = u.subscriptions?.[0];
              return (
                <tr key={u.user_id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-3">{u.full_name ?? "—"}</td>
                  <td className="py-2 px-3 text-muted-foreground">{u.email}</td>
                  <td className="py-2 px-3">
                    {sub ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sub.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {sub.plan_type} — {sub.status}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
