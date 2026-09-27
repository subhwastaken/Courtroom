"use client";
import React, { useState, useEffect } from "react";
import { fetchProfile, updateProfile, searchMemories } from "@/lib/api";
import { MemoryItem, ProfileResponse } from "@/lib/types";
import { User, FileText, Search, Database, Save, CheckCircle2 } from "lucide-react";
import { playClickSound } from "@/lib/sounds";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Semantic search tool state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MemoryItem[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  async function loadProfileData() {
    try {
      const data = await fetchProfile();
      setProfile(data);
      setMarkdown(data.raw_markdown);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }

  async function handleSave() {
    setSaving(true);
    playClickSound();
    try {
      await updateProfile(markdown);
      setSavedSuccess(true);
      setEditing(false);
      setTimeout(() => setSavedSuccess(false), 3000);
      await loadProfileData();
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    playClickSound();
    try {
      const res = await searchMemories(searchQuery.trim(), 5);
      setSearchResults(res);
    } catch (err) {
      console.error("Memory search failed:", err);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-400 mb-1">
            <User className="w-4 h-4" />
            <span>Living Identity Core</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            User Profile & Vector Memory Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            The multi-agent courtroom reasons with your explicit historical values and vector-embedded recollections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 font-mono text-xs text-amber-300 flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>{profile?.memory_count ?? 0} Memories in Qdrant</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: user.md Viewer / Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-300">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Living Profile Document (<code className="text-amber-400">backend/data/user.md</code>)</span>
            </div>

            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setMarkdown(profile?.raw_markdown || "");
                    }}
                    className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-1.5 rounded-md bg-amber-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-500/40 hover:text-amber-300 font-mono text-xs uppercase tracking-wider transition-all"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updated and synchronized to disk.</span>
            </div>
          )}

          {editing ? (
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={18}
              className="w-full bg-slate-950/90 border border-amber-500/40 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 space-y-6">
              {profile?.sections && Object.keys(profile.sections).length > 0 ? (
                Object.entries(profile.sections).map(([sectionTitle, items], idx) => (
                  <div key={idx} className="space-y-2 border-b border-slate-900 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {sectionTitle}
                    </h3>
                    <ul className="space-y-1.5 pl-4">
                      {items.map((item, iIdx) => (
                        <li key={iIdx} className="text-xs text-slate-300 font-sans list-disc marker:text-amber-500/60 leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{markdown}</pre>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Qdrant Vector Semantic Search Playground */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-300">
            <Search className="w-4 h-4 text-amber-400" />
            <span>Semantic Memory Search</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Test how Qdrant retrieves your memories based on semantic proximity to any thought or question.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. salary, family, weekend..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-mono text-xs font-bold uppercase hover:brightness-110 disabled:opacity-40"
              >
                {searching ? "..." : "Search"}
              </button>
            </form>

            <div className="space-y-2.5 pt-2">
              {searchResults.length > 0 ? (
                searchResults.map((mem, i) => (
                  <div
                    key={mem.id || i}
                    className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                        {mem.type}
                      </span>
                      {mem.score !== undefined && (
                        <span className="text-cyan-400 font-semibold">
                          Score: {(mem.score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 font-sans">
                      "{mem.text}"
                    </p>
                  </div>
                ))
              ) : searchQuery && !searching ? (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">
                  No matching memories found for "{searchQuery}"
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">
                  Type a concept to view cosine similarity rankings from Qdrant.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
