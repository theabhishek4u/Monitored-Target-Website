"use client";

import { useEffect, useState } from "react";
import { Settings, Globe, Plus, Save, Trash2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Active Source state
  const [sourceName, setSourceName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [homepageUrl, setHomepageUrl] = useState("");
  const [sourceId, setSourceId] = useState("");

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatUrl, setNewCatUrl] = useState("");
  const [newCatPriority, setNewCatPriority] = useState(1);
  const [newCatKeywords, setNewCatKeywords] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sourceRes, catRes] = await Promise.all([
        fetch("/api/sources"),
        fetch("/api/categories"),
      ]);

      const sourceData = await sourceRes.json();
      const catData = await catRes.json();

      if (sourceData.sources && sourceData.sources.length > 0) {
        setSources(sourceData.sources);
        const s = sourceData.sources[0];
        setSourceId(s.id);
        setSourceName(s.name);
        setBaseUrl(s.baseUrl);
        setHomepageUrl(s.homepageUrl);
      }

      if (catData.categories) {
        setCategories(catData.categories);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saving source settings...");

    try {
      const res = await fetch("/api/sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sourceId,
          name: sourceName,
          baseUrl,
          homepageUrl,
          enabled: true,
        }),
      });

      if (res.ok) {
        setSaveStatus("Target source settings updated successfully!");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err.message}`);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug || !newCatUrl) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName,
          slug: newCatSlug,
          sourceUrl: newCatUrl,
          priority: newCatPriority,
          keywords: newCatKeywords,
          enabled: true,
        }),
      });

      if (res.ok) {
        setNewCatName("");
        setNewCatSlug("");
        setNewCatUrl("");
        setNewCatKeywords("");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create category:", err);
    }
  };

  const handleUpdateCategory = async (cat: any) => {
    try {
      await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat),
      });
      setSaveStatus(`Updated ${cat.name}`);
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error("Failed to update category:", err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-400" />
          Target Source & Category Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure target website domains, category archive endpoints, and detection keyword rules
        </p>
      </div>

      {saveStatus && (
        <div className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Target Source Configuration */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-indigo-400" />
          Monitored Website Configuration
        </h2>

        <form onSubmit={handleSaveSource} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Source Name
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Base URL
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Homepage URL
              </label>
              <input
                type="url"
                value={homepageUrl}
                onChange={(e) => setHomepageUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Source Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Category Management */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-4">Configured Categories & Rules</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Source URL</th>
                <th className="py-3 px-3 text-center w-20">Priority</th>
                <th className="py-3 px-3">Keywords</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-200">
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[idx].name = e.target.value;
                        setCategories(updated);
                      }}
                      className="bg-transparent border-b border-transparent focus:border-indigo-500 focus:bg-slate-950 px-1 py-0.5 rounded text-sm w-full text-white"
                    />
                  </td>
                  <td className="py-3 px-3 text-xs font-mono text-slate-400">{cat.slug}</td>
                  <td className="py-3 px-3 text-xs text-slate-300">
                    <input
                      type="text"
                      value={cat.sourceUrl}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[idx].sourceUrl = e.target.value;
                        setCategories(updated);
                      }}
                      className="bg-transparent border-b border-transparent focus:border-indigo-500 focus:bg-slate-950 px-1 py-0.5 rounded text-xs w-full text-slate-300 font-mono"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      value={cat.priority}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[idx].priority = parseInt(e.target.value, 10) || 1;
                        setCategories(updated);
                      }}
                      className="w-14 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-xs text-slate-200"
                    />
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-400 max-w-xs truncate">
                    <input
                      type="text"
                      value={cat.keywords || ""}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[idx].keywords = e.target.value;
                        setCategories(updated);
                      }}
                      placeholder="comma-separated"
                      className="bg-transparent border-b border-transparent focus:border-indigo-500 focus:bg-slate-950 px-1 py-0.5 rounded text-xs w-full text-slate-400"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...categories];
                        updated[idx].enabled = !updated[idx].enabled;
                        setCategories(updated);
                        handleUpdateCategory(updated[idx]);
                      }}
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        cat.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}
                    >
                      {cat.enabled ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleUpdateCategory(cat)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                      title="Save row"
                    >
                      <Save className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Category Form */}
        <form
          onSubmit={handleAddCategory}
          className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-3"
        >
          <input
            type="text"
            value={newCatName}
            onChange={(e) => {
              setNewCatName(e.target.value);
              if (!newCatSlug) {
                setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
              }
            }}
            placeholder="Category Name"
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            required
          />
          <input
            type="text"
            value={newCatSlug}
            onChange={(e) => setNewCatSlug(e.target.value)}
            placeholder="Slug (e.g. results)"
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
            required
          />
          <input
            type="url"
            value={newCatUrl}
            onChange={(e) => setNewCatUrl(e.target.value)}
            placeholder="Archive URL"
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            required
          />
          <input
            type="text"
            value={newCatKeywords}
            onChange={(e) => setNewCatKeywords(e.target.value)}
            placeholder="Keywords (comma separated)"
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Category</span>
          </button>
        </form>
      </div>
    </div>
  );
}
