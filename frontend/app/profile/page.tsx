"use client";
import React, { useState, useEffect } from "react";
import { fetchProfile, updateProfile, searchMemories } from "@/lib/api";
import { MemoryItem, ProfileResponse } from "@/lib/types";
import { User, FileText, Search, Database, Save, CheckCircle2, Sparkles, BookOpen, Quote, ArrowRight } from "lucide-react";
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

  const QUICK_SEARCHES = ["salary", "burnout", "startup", "family", "regrets", "equity"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* ──────────────────────────────────────────────────────────
       *  NEO-BRUTALIST ARCHIVE HEADER
       * ────────────────────────────────────────────────────────── */}
      <div className="bg-[#1C100B] border-4 border-black p-6 sm:p-7 shadow-[8px_8px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 border-3 border-black overflow-hidden bg-black shadow-[3px_3px_0px_#000] flex-shrink-0 hidden sm:block">
            <img
              src="/pixel_court_badge.jpg"
              alt="Archive Seal"
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-neo-yellow text-black px-2.5 py-0.5 border-2 border-black font-pixel text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] -rotate-1">
                ARCHIVE_STATION
              </span>
              <span className="font-mono text-xs text-[#FFE885] font-bold uppercase tracking-widest">
                Living Identity Core
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-sans">
              USER DOSSIER & VECTOR BANK
            </h1>
            <p className="text-xs sm:text-sm text-[#FFF8E7] font-mono mt-1">
              The multi-agent courtroom cross-examines your life dilemmas against this explicit dossier and Qdrant memory archive.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-neo-green text-black border-3 border-black font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2">
            <Database className="w-4 h-4 stroke-[2.5]" />
            <span>{profile?.memory_count ?? 12} Memories Synced</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ──────────────────────────────────────────────────────────
         *  LEFT 2 COLS: user.md DOSSIER EDITOR / VIEWER
         * ────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
            {/* Window Title Bar */}
            <div className="bg-neo-yellow border-b-4 border-black px-4 py-2.5 flex items-center justify-between text-black font-mono text-xs">
              <div className="flex items-center gap-2 font-black uppercase">
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <span>USER_DOSSIER.MD [CONFIDENTIAL RECORD]</span>
              </div>

              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setMarkdown(profile?.raw_markdown || "");
                      }}
                      className="px-3 py-1 bg-[#26150F] text-[#FFF8E7] border-2 border-black font-bold uppercase text-[10px] hover:bg-[#382017]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="neo-btn px-3 py-1 bg-neo-green text-black border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_#000] flex items-center gap-1"
                    >
                      <Save className="w-3 h-3 stroke-[2.5]" />
                      <span>{saving ? "Saving..." : "Save Dossier"}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="neo-btn px-3 py-1 bg-black text-neo-yellow border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_#000]"
                  >
                    Edit Dossier
                  </button>
                )}
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-neo-green text-black border-b-3 border-black font-mono text-xs font-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Dossier successfully updated on disk and indexed to Qdrant memory.</span>
              </div>
            )}

            {/* Document Content */}
            <div className="p-6">
              {editing ? (
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  rows={20}
                  className="w-full bg-[#120907] border-3 border-black p-4 font-mono text-xs text-[#FFF8E7] leading-relaxed focus:outline-none focus:border-neo-yellow shadow-[4px_4px_0px_#000]"
                />
              ) : (
                <div className="space-y-6 font-mono">
                  {profile?.sections && Object.keys(profile.sections).length > 0 ? (
                    Object.entries(profile.sections).map(([sectionTitle, items], idx) => (
                      <div
                        key={idx}
                        className="bg-[#26150F] border-3 border-black p-4 shadow-[4px_4px_0px_#000]"
                      >
                        <h3 className="font-pixel text-[11px] font-black uppercase text-neo-yellow flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
                          <span className="w-2 h-2 bg-neo-yellow border border-black inline-block" />
                          {sectionTitle}
                        </h3>
                        <ul className="space-y-2 pl-2">
                          {items.map((item, iIdx) => (
                            <li
                              key={iIdx}
                              className="text-xs text-[#FFF8E7] font-sans leading-relaxed flex items-start gap-2"
                            >
                              <span className="text-neo-green font-bold">▶</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <pre className="font-mono text-xs text-[#FFF8E7] whitespace-pre-wrap">
                      {markdown}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
         *  RIGHT COL: QDRANT VECTOR SEMANTIC MEMORY SEARCH
         * ────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
            {/* Window Bar */}
            <div className="bg-neo-red border-b-4 border-black px-4 py-2.5 flex items-center gap-2 text-white font-mono text-xs font-black uppercase">
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>SEMANTIC MEMORY SUBPOENA</span>
            </div>

            <div className="p-5 space-y-4 font-mono">
              <p className="text-xs text-[#FFF8E7] leading-relaxed font-sans">
                Test how Qdrant retrieves your personal precedents based on semantic proximity to any dilemma or keyword.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. salary, family, burnout..."
                    className="flex-1 bg-[#26150F] border-3 border-black px-3 py-2 text-xs text-[#FFF8E7] placeholder-[#FFE885]/60 focus:outline-none focus:border-neo-yellow font-mono shadow-[3px_3px_0px_#000]"
                  />
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="neo-btn px-4 py-2 bg-neo-yellow text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_#000] disabled:opacity-40"
                  >
                    {searching ? "..." : "Search"}
                  </button>
                </div>

                {/* Quick Query Pills */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {QUICK_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        searchMemories(tag, 5).then((r) => setSearchResults(r)).catch(() => {});
                      }}
                      className="px-2 py-0.5 bg-[#26150F] border border-black text-[#FFF8E7] hover:bg-neo-yellow hover:text-black font-mono text-[10px] uppercase font-bold transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </form>

              {/* Search Results */}
              <div className="space-y-3 pt-2">
                {searchResults.length > 0 ? (
                  searchResults.map((mem, i) => (
                    <div
                      key={mem.id || i}
                      className="p-3 bg-[#26150F] border-2 border-black shadow-[3px_3px_0px_#000] space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="px-1.5 py-0.2 bg-neo-yellow text-black font-bold uppercase border border-black">
                          {mem.type}
                        </span>
                        {mem.score !== undefined && (
                          <span className="text-neo-green font-bold">
                            Match: {(mem.score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#FFF8E7] font-sans leading-relaxed">
                        &ldquo;{mem.text}&rdquo;
                      </p>
                    </div>
                  ))
                ) : searchQuery && !searching ? (
                  <div className="text-center py-8 text-xs text-[#FFE885] font-mono border-2 border-dashed border-black/80 p-4">
                    No matching memories found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-[#FFE885] font-mono border-2 border-dashed border-black/80 p-4">
                    Type a query or tap a tag to subpoena vector precedents from Qdrant.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
