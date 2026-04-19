"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, X, Check, Upload } from "lucide-react";

interface Charity {
  id: string;
  name: string;
  description: string;
  website_url?: string;
  logo_url?: string;
  status: string;
  total_raised: number;
}

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Events state
  const [eventsCharityId, setEventsCharityId] = useState<string | null>(null);
  const [eventsCharityName, setEventsCharityName] = useState("");
  const [events, setEvents] = useState<CharityEvent[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventSaving, setEventSaving] = useState(false);

  interface CharityEvent {
    id: string;
    title: string;
    event_date: string;
    description: string;
    location?: string;
  }

  async function load() {
    const { data } = await supabase
      .from("charities")
      .select("id, name, description, website_url, logo_url, status, total_raised")
      .order("name");
    setCharities(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function uploadLogo(file: File, charityId: string): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `charity-logos/${charityId}.${ext}`;
    const { error } = await supabase.storage
      .from("public-assets")
      .upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    setSaving(true);
    setError("");

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { data: inserted, error: insertErr } = await supabase
      .from("charities")
      .insert({ name, description, website_url: websiteUrl || null, slug, status: "active" })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      setError(insertErr?.message ?? "Failed to add charity");
      setSaving(false);
      return;
    }

    if (logoFile) {
      const logoUrl = await uploadLogo(logoFile, inserted.id);
      if (logoUrl) {
        await supabase.from("charities").update({ logo_url: logoUrl }).eq("id", inserted.id);
      }
    }

    setName(""); setDescription(""); setWebsiteUrl(""); setLogoFile(null);
    load();
    setSaving(false);
  }

  function startEdit(c: Charity) {
    setEditId(c.id);
    setEditName(c.name);
    setEditDescription(c.description ?? "");
    setEditWebsite(c.website_url ?? "");
    setEditLogoFile(null);
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    let logo_url: string | undefined;

    if (editLogoFile) {
      const url = await uploadLogo(editLogoFile, id);
      if (url) logo_url = url;
    }

    await supabase.from("charities").update({
      name: editName,
      description: editDescription,
      website_url: editWebsite || null,
      ...(logo_url ? { logo_url } : {}),
    }).eq("id", id);

    setEditId(null);
    setEditSaving(false);
    load();
  }

  async function toggleStatus(id: string, current: string) {
    await supabase.from("charities")
      .update({ status: current === "active" ? "inactive" : "active" })
      .eq("id", id);
    load();
  }

  async function openEvents(c: Charity) {
    setEventsCharityId(c.id);
    setEventsCharityName(c.name);
    const { data } = await supabase
      .from("charity_events")
      .select("id, title, event_date, description, location")
      .eq("charity_id", c.id)
      .order("event_date", { ascending: true });
    setEvents(data ?? []);
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!eventsCharityId || !eventTitle || !eventDate) return;
    setEventSaving(true);
    await supabase.from("charity_events").insert({
      charity_id: eventsCharityId,
      title: eventTitle,
      event_date: eventDate,
      description: eventDesc || null,
      location: eventLocation || null,
    });
    setEventTitle(""); setEventDate(""); setEventDesc(""); setEventLocation("");
    const { data } = await supabase
      .from("charity_events")
      .select("id, title, event_date, description, location")
      .eq("charity_id", eventsCharityId)
      .order("event_date", { ascending: true });
    setEvents(data ?? []);
    setEventSaving(false);
  }

  async function deleteEvent(id: string) {
    await supabase.from("charity_events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Charities ({charities.length})</h2>

      {/* Events Modal */}
      {eventsCharityId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setEventsCharityId(null)}>
          <div className="max-w-lg w-full glass-card space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Events — {eventsCharityName}</h3>
              <button onClick={() => setEventsCharityId(null)} className="text-muted-foreground hover:text-white">✕</button>
            </div>

            <form onSubmit={addEvent} className="space-y-2 border-b border-white/10 pb-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Add Event</p>
              <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Event title *"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
              <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
              <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Location (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
              <input value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} placeholder="Description (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
              <button type="submit" disabled={eventSaving || !eventTitle || !eventDate}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5 rounded-lg disabled:opacity-50">
                {eventSaving ? "Adding..." : "Add Event"}
              </button>
            </form>

            <div className="space-y-2">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No events yet.</p>
              ) : events.map((ev) => (
                <div key={ev.id} className="flex items-start justify-between gap-3 p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ev.event_date).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                      {ev.location && ` · ${ev.location}`}
                    </p>
                    {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
                  </div>
                  <button onClick={() => deleteEvent(ev.id)} className="text-red-400 hover:text-red-300 text-xs flex-shrink-0">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Add Form */}
      <form onSubmit={handleAdd} className="glass-card space-y-3">
        <h3 className="font-medium">Add Charity</h3>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Charity name *"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          />
          <input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="Website URL (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description (optional)"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        />
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Logo image (optional)</label>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <span className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-sm px-3 py-1.5 rounded-lg transition-colors">
              <Upload size={14} />
              {logoFile ? logoFile.name : "Choose file"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Charity"}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-left">
              <th className="py-2 px-3">Logo</th>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Description</th>
              <th className="py-2 px-3">Total Raised</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {charities.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 align-top">
                <td className="py-2 px-3">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <div className="w-9 h-9 bg-purple-600/30 rounded-lg flex items-center justify-center text-xs text-purple-400">
                      —
                    </div>
                  )}
                </td>

                {editId === c.id ? (
                  <>
                    <td className="py-2 px-3">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </td>
                    <td className="py-2 px-3" colSpan={1}>
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                        placeholder="Description"
                      />
                      <input
                        value={editWebsite}
                        onChange={(e) => setEditWebsite(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500 mt-1"
                        placeholder="Website URL"
                      />
                      <label className="flex items-center gap-1 mt-1 cursor-pointer text-xs text-purple-400 hover:text-purple-300">
                        <Upload size={12} />
                        {editLogoFile ? editLogoFile.name : "Replace logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setEditLogoFile(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    </td>
                    <td className="py-2 px-3">£{(c.total_raised ?? 0).toFixed(2)}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          disabled={editSaving}
                          className="text-green-400 hover:text-green-300 disabled:opacity-50"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-muted-foreground hover:text-white"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-3 font-medium">{c.name}</td>
                    <td className="py-2 px-3 text-muted-foreground max-w-xs">
                      <p className="truncate">{c.description}</p>
                      {c.website_url && (
                        <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline truncate block">
                          {c.website_url}
                        </a>
                      )}
                    </td>
                    <td className="py-2 px-3">£{(c.total_raised ?? 0).toFixed(2)}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(c)}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => toggleStatus(c.id, c.status)}
                          className="text-xs text-purple-400 hover:text-purple-300 underline"
                        >
                          {c.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => openEvents(c)}
                          className="text-xs text-green-400 hover:text-green-300 underline"
                        >
                          Events
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
