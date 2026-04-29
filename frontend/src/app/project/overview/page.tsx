"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header/Header";
import Sidebar from "@/components/home/Sidebar";
import MetricCard from "@/components/projects/overview/Metric";
import { getProjects } from "@/features/scans/api/scans.api";
import type { Project } from "@/features/scans/types";

function getInitials(title: string): string {
  return title
    .split(/[\s\-_]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const INITIALS_COLORS = [
  "bg-blue-50 text-[#2463eb]",
  "bg-orange-100 text-orange-600",
  "bg-purple-50 text-purple-600",
  "bg-slate-100 text-slate-600",
  "bg-green-50 text-green-600",
  "bg-rose-50 text-rose-600",
];

export default function ProjectOverviewPage() {
  const [filter, setFilter] = useState<"Active" | "Archived">("Active");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((err) => setError(err?.message ?? "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const goToDetails = (domainId: number) => {
    router.push(`/project/details?id=${domainId}`);
  };

  const visibleProjects = projects.filter((project) => {
    if (!query) return true;
    const haystack = `${project.title ?? ""} ${project.description ?? ""} ${project.domain ?? ""}`.toLowerCase();
    return haystack.includes(query);
  });

  return (
    <div className="bg-[#f6f6f8] dark:bg-[#111621] text-[#111318] dark:text-white font-sans min-h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-[#111318] dark:text-white text-2xl md:text-3xl font-bold tracking-tight">Projects Directory</h1>
                <p className="text-[#616e89] mt-1 text-sm">Manage and monitor security posture across all organisational workspaces.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-white dark:bg-[#1a202c] border border-[#e5e7eb] dark:border-gray-700 rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setFilter("Active")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filter === "Active" ? "bg-[#f6f6f8] dark:bg-gray-700 text-[#111318] dark:text-white shadow-sm" : "text-[#616e89] hover:text-[#111318] dark:hover:text-white"}`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter("Archived")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filter === "Archived" ? "bg-[#f6f6f8] dark:bg-gray-700 text-[#111318] dark:text-white shadow-sm" : "text-[#616e89] hover:text-[#111318] dark:hover:text-white"}`}
                  >
                    Archived
                  </button>
                </div>
                <button className="flex items-center gap-2 bg-white dark:bg-[#1a202c] border border-[#e5e7eb] dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-semibold text-[#616e89] hover:bg-[#f6f6f8] dark:hover:bg-gray-800 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  Filters
                </button>
              </div>
            </div>

            {/* High-Density Table */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm overflow-hidden border border-[#e5e7eb] dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f3f4f6] dark:bg-gray-800">
                      {["Project Name", "Environment", "Last Scan Date", "Critical / High", "Health Score", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-4 text-[11px] font-semibold text-[#616e89] uppercase tracking-wider border-b border-[#e5e7eb] dark:border-gray-700">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] dark:divide-gray-700">
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#616e89]">Loading projects…</td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-red-500">{error}</td>
                      </tr>
                    )}
                    {!loading && !error && visibleProjects.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#616e89]">
                          {query ? "No projects match your search." : "No projects found."}
                        </td>
                      </tr>
                    )}
                    {visibleProjects.map((p, i) => {
                      const initials = getInitials(p.title);
                      const initialsColor = INITIALS_COLORS[i % INITIALS_COLORS.length];
                      return (
                        <tr
                          key={p.domain}
                          onClick={() => goToDetails(p.domain_id!)}
                          className="hover:bg-[#f6f6f8] dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${initialsColor}`}>
                                {initials}
                              </div>
                              <div>
                                <div className="font-semibold text-[#111318] dark:text-white">{p.title}</div>
                                <div className="text-[10px] text-[#616e89] font-medium">{p.domain}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-[#616e89]">—</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-[#616e89]">—</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-[#616e89]">—</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-[#616e89]">—</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(event) => event.stopPropagation()}
                              className="material-symbols-outlined text-[#616e89] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              more_vert
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="px-6 py-4 bg-[#f3f4f6] dark:bg-gray-800 border-t border-[#e5e7eb] dark:border-gray-700 flex items-center justify-between">
                <div className="text-xs text-[#616e89] font-medium">
                  Showing <span className="text-[#111318] dark:text-white font-bold">1-4</span> of <span className="text-[#111318] dark:text-white font-bold">128</span> projects
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a202c] text-[#616e89] hover:bg-[#f6f6f8] dark:hover:bg-gray-700">
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-[#2463eb] bg-blue-100 dark:bg-blue-900/30 text-[#2463eb] font-bold text-xs">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a202c] text-[#616e89] hover:bg-[#f6f6f8] font-bold text-xs">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a202c] text-[#616e89] hover:bg-[#f6f6f8] font-bold text-xs">3</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a202c] text-[#616e89] hover:bg-[#f6f6f8]">
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
