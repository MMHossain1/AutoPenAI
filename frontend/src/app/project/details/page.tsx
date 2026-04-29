"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header/Header";
import Sidebar from "@/components/home/Sidebar";
import Link from "next/link";
import { getProjects, getProjectScans, deleteProject, getProjectRiskMetrics } from "@/features/scans/api/scans.api";
import type { Project, ScanSummary, RiskMetric } from "@/features/scans/types";

const riskLevelStyle: Record<string, string> = {
  critical: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-red-600/20",
  high:     "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-orange-600/20",
  medium:   "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ring-yellow-600/20",
  low:      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20",
  info:     "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-blue-600/20",
};

function riskStyle(level?: string | null) {
  const key = (level ?? "").toLowerCase();
  return riskLevelStyle[key] ?? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 ring-gray-500/10";
}

const riskBarColor: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#10b981",
};

function barColor(label?: string | null) {
  return riskBarColor[(label ?? "").toLowerCase()] ?? "#6b7280";
}

function formatDate(raw: Date | string | undefined) {
  if (!raw) return "—";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" });
}

function ProjectPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [project, setProject] = useState<Project | null>(null);
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingScans, setLoadingScans] = useState(true);
  const [scansError, setScansError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);

  useEffect(() => {
    if (!id) return;
    getProjects()
      .then((all) => setProject(all.find((p) => p.domain_id != null && p.domain_id === id) ?? null))
      .finally(() => setLoadingProject(false));

    getProjectScans(id)
      .then(setScans)
      .catch((err) => setScansError(err?.message ?? "Failed to load scans"))
      .finally(() => setLoadingScans(false));

    getProjectRiskMetrics(id)
      .then(setRiskMetrics)
      .catch(() => setRiskMetrics([]));
  }, [id]);

  const title = loadingProject ? String(id) : (project?.title ?? String(id));
  const description = project?.description ?? null;
  const domain = project?.domain ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8] dark:bg-[#111621] text-[#111318] dark:text-white font-sans antialiased overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden h-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-8">
        <div>
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="flex mb-4 text-sm text-[#616e89] dark:text-gray-400">
            <Link href="/project/overview" className="hover:text-primary transition-colors">Projects</Link>
            <span className="mx-2 text-[#616e89]/50">/</span>
            <span className="text-[#111318] dark:text-white font-medium">{title}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20">
                  Active
                </span>
              </div>
              <p className="text-[#616e89] dark:text-gray-400 max-w-2xl text-sm leading-relaxed">
                {description
                  ? <>{description} <span className="text-[#616e89]/60">• {domain}</span></>
                  : domain}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-[#1a202c] px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-red-200 dark:ring-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete
              </button>
              <button
                onClick={() => router.push(`/project/edit?id=${id}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-[#1a202c] px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-inset ring-[#e5e7eb] dark:ring-gray-700 hover:bg-[#f6f6f8] dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Project
              </button>
              <button
                onClick={() => router.push(`/scan/new?id=${id}&url=${encodeURIComponent(domain)}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-dark px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-primary/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Start Scan
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Recent Scans */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e5e7eb] dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                  Recent Scans
                  {!loadingScans && (
                    <span className="ml-1 rounded-full bg-[#f6f6f8] dark:bg-[#111621] px-2 py-0.5 text-xs font-medium text-[#616e89] dark:text-gray-400 border border-[#e5e7eb] dark:border-gray-700">
                      {scans.length}
                    </span>
                  )}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="sticky top-0 z-10 bg-[#f3f4f6] dark:bg-gray-800 border-b border-[#e5e7eb] dark:border-gray-700 text-[#4b5563] dark:text-gray-400 uppercase text-xs font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-3 w-[120px]">Scan ID</th>
                      <th className="px-6 py-3">Target</th>
                      <th className="px-6 py-3 w-[120px]">Date</th>
                      <th className="px-6 py-3 w-[100px]">Type</th>
                      <th className="px-6 py-3 w-[120px]">Risk Level</th>
                      <th className="px-6 py-3 text-right w-[220px]">Alerts (C / H / M / L)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb] dark:divide-gray-700 text-[#111318] dark:text-white">
                    {loadingScans && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-xs text-[#616e89]">Loading scans…</td>
                      </tr>
                    )}
                    {scansError && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-xs text-red-500">{scansError}</td>
                      </tr>
                    )}
                    {!loadingScans && !scansError && scans.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-xs text-[#616e89]">No scans found for this project.</td>
                      </tr>
                    )}
                    {scans.map((s) => (
                      <tr key={s.scanid} onClick={() => router.push(`/scan/results?id=${s.scanid}`)} className="hover:bg-[#f6f6f8] dark:hover:bg-gray-800/50 transition-all duration-150 cursor-pointer">
                        <td className="px-6 py-4 text-[#616e89] font-mono text-xs">#{s.scanid}</td>
                        <td className="px-6 py-4 font-medium font-mono text-xs">{s.target_url}</td>
                        <td className="px-6 py-4 text-[#616e89] text-xs whitespace-nowrap">{formatDate(s.date)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${s.scan_type === "passive" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                            {s.scan_type === "passive" ? "Passive" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {s.overall_risk_level ? (
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${riskStyle(s.overall_risk_level)}`}>
                              {s.overall_risk_level}
                            </span>
                          ) : (
                            <span className="text-xs text-[#616e89]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">C: {s.critical_alert_count ?? 0}</span>
                            <span className="text-xs font-semibold text-orange-500 dark:text-orange-400">H: {s.high_risk_count ?? 0}</span>
                            <span className="text-xs font-semibold text-yellow-500 dark:text-yellow-400">M: {s.medium_risk_count ?? 0}</span>
                            <span className="text-xs font-semibold text-green-600 dark:text-green-500">L: {s.low_risk_count ?? 0}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Risk Over Time */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-gray-700 p-5">
              <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
                Risk Over Time
              </h3>
              {riskMetrics.length === 0 ? (
                <p className="text-xs text-[#616e89] dark:text-gray-400 text-center py-8">No scan data yet.</p>
              ) : (
                <>
                  {/* Bar chart */}
                  <div className="flex h-40 w-full gap-1.5">
                    {riskMetrics.map((m, i) => {
                      const score = m.risk_score ?? 0;
                      const heightPct = Math.max(score, 2);
                      return (
                        <div key={i} className="flex-1 h-full relative flex flex-col justify-end group">
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 pointer-events-none">
                            <div className="bg-[#111318] dark:bg-gray-700 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap shadow-lg">
                              <span className="font-semibold">{score}</span>
                              {m.risk_label && <span className="ml-1 opacity-75">({m.risk_label})</span>}
                            </div>
                          </div>
                          <div
                            className="w-full rounded-t-sm transition-all"
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor: barColor(m.risk_label),
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* X-axis labels */}
                  <div className="flex gap-1.5 mt-1">
                    {riskMetrics.map((m, i) => (
                      <div key={i} className="flex-1 text-center text-[9px] text-[#616e89] dark:text-gray-400 truncate">
                        {new Date(m.date).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </div>
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
                    {(["Critical", "High", "Medium", "Low"] as const).map((label) => (
                      <div key={label} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: barColor(label) }} />
                        <span className="text-[10px] text-[#616e89] dark:text-gray-400">{label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
        </main>
      </div>

      {/* Delete confirmation modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Project</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
              <button onClick={() => { setIsDeleteOpen(false); setDeleteError(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <span className="font-semibold">{title}</span>? All associated scans will be unlinked.
              </p>
              {deleteError && (
                <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{deleteError}</p>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => { setIsDeleteOpen(false); setDeleteError(null); }}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  setDeleteError(null);
                  try {
                    await deleteProject(id);
                    router.push("/project/overview");
                  } catch (err) {
                    setDeleteError((err as { message?: string })?.message ?? "Failed to delete project");
                    setIsDeleting(false);
                  }
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? "Deleting…" : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense>
      <ProjectPageInner />
    </Suspense>
  );
}
