"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Charity {
  id: string;
  name: string;
  description: string;
  status: string;
  total_raised: number;
}

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await supabase
      .from("charities")
      .select("id, name, description, status, total_raised")
      .order("name");
    setCharities(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    setSaving(true);
    setError("");
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { error } = await supabase.from("charities").insert({ name, description, slug, status: "active" });
    if (error) setError(error.message);
    else { setName(""); setDescription(""); load(); }
    setSaving(false);
  }

  async function toggleStatus(id: string, current: string) {
    await supabase.from("charities").update({ status: current === "active" ? "inactive" : "active" }).eq("id", id);
    load();
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Charities ({charities.length})</h2>

      <form onSubmit={handleAdd} className="glass-card space-y-3">
        <h3 className="font-medium">Add Charity</h3>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Charity name"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description (optional)"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Charity"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-left">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Description</th>
              <th className="py-2 px-3">Total Raised</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {charities.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-2 px-3 font-medium">{c.name}</td>
                <td className="py-2 px-3 text-muted-foreground max-w-xs truncate">{c.description}</td>
                <td className="py-2 px-3">£{(c.total_raised ?? 0).toFixed(2)}</td>
                <td className="py-2 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => toggleStatus(c.id, c.status)}
                    className="text-xs text-purple-400 hover:text-purple-300 underline"
                  >
                    {c.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
