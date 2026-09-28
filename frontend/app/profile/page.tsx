"use client";
import React, { useState, useEffect } from "react";
import { fetchProfile, updateProfile, searchMemories, synthesizeProfile } from "@/lib/api";
import { MemoryItem, ProfileResponse } from "@/lib/types";
import { User, FileText, Search, Database, Save, CheckCircle2, Sparkles, BookOpen, Quote, ArrowRight, Zap, Cpu, RefreshCw, AlertCircle, Copy, Code } from "lucide-react";
import { playClickSound } from "@/lib/sounds";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<"sections" | "raw">("sections");
  const [copied, setCopied] = useState<boolean>(false);

  // NVIDIA NIM Synthesizer state
  const [synthInput, setSynthInput] = useState<string>("");
  const [synthMode, setSynthMode] = useState<"replace" | "append">("replace");
  const [synthSyncQdrant, setSynthSyncQdrant] = useState<boolean>(true);
  const [synthesizing, setSynthesizing] = useState<boolean>(false);
  const [synthSuccess, setSynthSuccess] = useState<string | null>(null);
  const [synthError, setSynthError] = useState<string | null>(null);

  // Semantic search tool state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MemoryItem[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  async function loadProfileData() {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await fetchProfile();
      setProfile(data);
      setMarkdown(data.raw_markdown || "");
    } catch (err: any) {
      console.error("Failed to load profile:", err);
      setProfileError(err?.message || "Failed to load user dossier from disk.");
    } finally {
      setProfileLoading(false);
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

  async function handleSynthesize(e?: React.FormEvent, overrideText?: string) {
    if (e) e.preventDefault();
    const textToProcess = overrideText || synthInput;
    if (!textToProcess.trim()) return;

    setSynthesizing(true);
    setSynthSuccess(null);
    setSynthError(null);
    playClickSound();

    try {
      const res = await synthesizeProfile(
        textToProcess.trim(),
        synthMode,
        "Subharup",
        synthSyncQdrant
      );
      setMarkdown(res.raw_markdown);
      setSynthSuccess(
        `Personal constitution updated — ${res.extracted_memories_count} points extracted (${res.memory_count} total memories in Qdrant).`
      );
      if (!overrideText) setSynthInput("");
      await loadProfileData();
    } catch (err: any) {
      console.error("Synthesis failed:", err);
      setSynthError(err.message || "Failed to synthesize dossier");
    } finally {
      setSynthesizing(false);
    }
  }

  const PRESET_THOUGHTS = [
    "I refuse to work on weekends, have 6 months savings runway, regret turning down an AI startup last year, and value autonomy above all else.",
    "Burned out in 2023 from 70hr sprints. Now health and 8h sleep are non-negotiable. I want high-upside equity, not comfortable mediocrity.",
    "Solo engineer with $30k savings. Boundary: no meetings before 1 PM. Regret staying 6 months too long at my previous corporate job."
  ];

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
        <div className="lg:col-span-2 space-y-6">
          {/* ──────────────────────────────────────────────────────────
           *  NVIDIA NIM NATURAL LANGUAGE SYNTHESIZER
           * ────────────────────────────────────────────────────────── */}
          <div className="bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
            {/* Header bar */}
            <div className="bg-neo-yellow border-b-4 border-black px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-black font-mono text-xs">
              <div className="flex items-center gap-2 font-black uppercase">
                <Zap className="w-4 h-4 fill-black stroke-[2.5]" />
                <span>Living Constitution Synthesizer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 bg-black text-neo-yellow font-bold uppercase border border-black shadow-[1px_1px_0px_#000]">
                  Neural Parser Active
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4 font-mono text-xs">
              <div>
                <p className="text-xs text-[#FFF8E7] leading-relaxed font-sans">
                  Don&apos;t want to manually draft a structured Markdown constitution? Type 1-2 raw thoughts or informal statements.
                  The reasoning engine will automatically deduce your core values, non-negotiable boundaries, stated regrets, and baselines into a rigorous dossier.
                </p>
              </div>

              {/* Input Form */}
              <form onSubmit={(e) => handleSynthesize(e)} className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={synthInput}
                    onChange={(e) => setSynthInput(e.target.value)}
                    placeholder="e.g. I refuse to work on weekends, I have 6 months savings runway, I regret turning down an AI startup last year, and I value intellectual freedom above all else."
                    className="w-full bg-[#26150F] border-3 border-black p-3 text-xs text-[#FFF8E7] placeholder-[#FFE885]/60 focus:outline-none focus:border-neo-yellow font-mono shadow-[3px_3px_0px_#000] resize-y"
                  />
                </div>

                {/* Preset Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#FFE885] font-bold uppercase tracking-wider block">
                    Quick Preset Prompts (Click to Fill &amp; Run):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_THOUGHTS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSynthInput(preset);
                          handleSynthesize(undefined, preset);
                        }}
                        className="px-2.5 py-1 bg-[#26150F] border border-black text-[#FFF8E7] hover:bg-neo-yellow hover:text-black font-mono text-[10px] transition-colors text-left"
                      >
                        ⚡ Preset #{idx + 1}: &ldquo;{preset.slice(0, 48)}...&rdquo;
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black/80">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 bg-[#26150F] border-2 border-black p-0.5">
                      <button
                        type="button"
                        onClick={() => setSynthMode("replace")}
                        className={`px-2.5 py-1 font-mono text-[10px] uppercase font-black transition-all ${
                          synthMode === "replace"
                            ? "bg-neo-yellow text-black shadow-[1px_1px_0px_#000]"
                            : "text-[#FFF8E7] hover:text-neo-yellow"
                        }`}
                        title="Rebuild the complete user.md dossier from this thought"
                      >
                        Full Dossier Build
                      </button>
                      <button
                        type="button"
                        onClick={() => setSynthMode("append")}
                        className={`px-2.5 py-1 font-mono text-[10px] uppercase font-black transition-all ${
                          synthMode === "append"
                            ? "bg-neo-green text-black shadow-[1px_1px_0px_#000]"
                            : "text-[#FFF8E7] hover:text-neo-green"
                        }`}
                        title="Append & merge this thought into existing dossier sections"
                      >
                        Append &amp; Merge
                      </button>
                    </div>

                    {/* Sync to Qdrant Checkbox */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#FFE885] font-bold">
                      <input
                        type="checkbox"
                        checked={synthSyncQdrant}
                        onChange={(e) => setSynthSyncQdrant(e.target.checked)}
                        className="accent-neo-yellow w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Sync memories to Qdrant Cloud</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={synthesizing || !synthInput.trim()}
                    className="neo-btn px-4 py-2 bg-neo-yellow text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {synthesizing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-black stroke-[3]" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-black stroke-[2.5]" />
                        <span>Synthesize Dossier</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Feedback Banners */}
              {synthSuccess && (
                <div className="p-3 bg-neo-green text-black border-2 border-black font-mono text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                  <span>{synthSuccess}</span>
                </div>
              )}

              {synthError && (
                <div className="p-3 bg-neo-red text-white border-2 border-black font-mono text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <AlertCircle className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                  <span>{synthError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
            {/* Window Title Bar */}
            <div className="bg-neo-yellow border-b-4 border-black px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-black font-mono text-xs">
              <div className="flex items-center gap-2 font-black uppercase">
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <span>USER_DOSSIER.MD [CONFIDENTIAL RECORD]</span>
                <span className="text-[10px] px-2 py-0.5 bg-black text-[#FFE885] font-mono font-bold lowercase border border-black hidden sm:inline-block">
                  backend/data/user.md
                </span>
              </div>

              {/* View Switcher & Action Controls */}
              <div className="flex items-center gap-2">
                {!editing && (
                  <div className="flex items-center bg-[#26150F] border-2 border-black p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewTab("sections")}
                      className={`px-2 py-0.5 font-mono text-[10px] uppercase font-bold transition-all ${
                        viewTab === "sections"
                          ? "bg-neo-yellow text-black shadow-[1px_1px_0px_#000]"
                          : "text-[#FFF8E7] hover:text-neo-yellow"
                      }`}
                    >
                      Sections View
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewTab("raw")}
                      className={`px-2 py-0.5 font-mono text-[10px] uppercase font-bold transition-all flex items-center gap-1 ${
                        viewTab === "raw"
                          ? "bg-neo-green text-black shadow-[1px_1px_0px_#000]"
                          : "text-[#FFF8E7] hover:text-neo-green"
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      Raw user.md View
                    </button>
                  </div>
                )}

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
                    onClick={() => {
                      setEditing(true);
                      setViewTab("raw");
                    }}
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
                <span>Dossier successfully updated on disk (backend/data/user.md) and indexed to Qdrant memory.</span>
              </div>
            )}

            {/* Document Content */}
            <div className="p-6">
              {profileLoading ? (
                <div className="p-10 text-center space-y-4 font-mono bg-[#120907] border-3 border-black shadow-[4px_4px_0px_#000]">
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#26150F] border-2 border-black text-neo-yellow text-xs font-bold uppercase shadow-[2px_2px_0px_#000]">
                    <RefreshCw className="w-4 h-4 animate-spin text-neo-yellow" />
                    <span>Loading User Dossier (user.md)...</span>
                  </div>
                  <p className="text-white/60 text-xs">Connecting to identity archive & vector index...</p>
                </div>
              ) : profileError ? (
                <div className="p-6 bg-[#26150F] border-3 border-neo-red space-y-4 font-mono text-center shadow-[4px_4px_0px_#000]">
                  <div className="flex items-center justify-center gap-2 text-neo-red font-black text-sm">
                    <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                    <span>COULD NOT CONNECT TO DOSSIER RECORD</span>
                  </div>
                  <p className="text-xs text-white/70 max-w-md mx-auto">{profileError}</p>
                  <button
                    onClick={() => loadProfileData()}
                    className="neo-btn px-4 py-2 bg-neo-yellow text-black border-2 border-black font-pixel text-xs uppercase font-black shadow-[3px_3px_0px_#000] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Loading Dossier</span>
                  </button>
                </div>
              ) : editing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#FFE885] font-mono">
                    <span>Editing raw markdown — changes persist directly to <code className="bg-black px-1.5 py-0.5 text-neo-yellow">data/user.md</code>:</span>
                    <span>{markdown.split("\n").length} lines</span>
                  </div>
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    rows={22}
                    className="w-full bg-[#120907] border-3 border-black p-4 font-mono text-xs text-[#FFF8E7] leading-relaxed focus:outline-none focus:border-neo-yellow shadow-[4px_4px_0px_#000] resize-y"
                  />
                </div>
              ) : viewTab === "raw" ? (
                /* RAW MARKDOWN FILE VIEW */
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between bg-[#120907] border-2 border-black px-3 py-2 text-[11px] text-[#FFE885]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-neo-green rounded-full inline-block" />
                      <span className="font-bold">user.md</span>
                      <span className="text-white/40">|</span>
                      <span className="text-white/70">{markdown.split("\n").length} lines</span>
                      <span className="text-white/40">|</span>
                      <span className="text-white/70">{markdown.length} bytes</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(markdown);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-[#26150F] hover:bg-neo-yellow hover:text-black border border-black text-[#FFF8E7] font-bold text-[10px] uppercase flex items-center gap-1.5 transition-colors shadow-[1px_1px_0px_#000]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? "Copied to Clipboard!" : "Copy user.md"}</span>
                    </button>
                  </div>

                  <div className="bg-[#120907] border-3 border-black p-4 shadow-[4px_4px_0px_#000] overflow-x-auto max-h-[600px] overflow-y-auto">
                    <pre className="font-mono text-xs text-[#FFF8E7] leading-relaxed whitespace-pre-wrap selection:bg-neo-yellow selection:text-black">
                      {markdown || "No content found in user.md"}
                    </pre>
                  </div>
                </div>
              ) : (
                /* SECTIONS STRUCTURED VIEW */
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
                        {items && items.length > 0 ? (
                          <ul className="space-y-2 pl-2">
                            {items.map((item, iIdx) => (
                              <li
                                key={iIdx}
                                className="text-xs text-[#FFF8E7] font-sans leading-relaxed flex items-start gap-2"
                              >
                                <span className="text-neo-green font-bold flex-shrink-0">▶</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-white/50 italic pl-2">No items recorded in this section.</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#120907] border-3 border-black p-4 shadow-[4px_4px_0px_#000]">
                      <pre className="font-mono text-xs text-[#FFF8E7] whitespace-pre-wrap">
                        {markdown || "No sections or content found in user.md"}
                      </pre>
                    </div>
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
