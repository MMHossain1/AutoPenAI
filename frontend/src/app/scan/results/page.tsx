"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/header/Header";
import Sidebar from "@/components/home/Sidebar";
import AISummaryChat from "@/components/scan/AISummaryChat";
import { getScanDetail, getScanAlerts } from "@/features/scans/api/scans.api";
import type { ScanDetail, ZapAlert, PagedResponse } from "@/features/scans/types";

const ALERTS_PAGE_SIZE = 20;

const riskBadgeStyles: Record<string, string> = {
  High:          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  Medium:        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Low:           "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Informational: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

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

function RiskBadge({ risk }: { risk: string }) {
  const style = riskBadgeStyles[risk] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${style}`}>
      {risk}
    </span>
  );
}

function formatDate(raw: Date | string | undefined) {
  if (!raw) return "—";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const RISK_FILTERS = ["", "High", "Medium", "Low", "Informational"] as const;

function ScanResultsPageInner() {
  const searchParams = useSearchParams();
  const scanId = Number(searchParams.get("id"));

  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [alerts, setAlerts] = useState<ZapAlert[]>([]);
  const [alertsTotal, setAlertsTotal] = useState(0);
  const [alertsPage, setAlertsPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [loadingScan, setLoadingScan] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId) return;
    setLoadingScan(true);
    getScanDetail(scanId)
      .then(setScan)
      .catch((err) => setError(err?.message ?? "Failed to load scan"))
      .finally(() => setLoadingScan(false));
  }, [scanId]);

  useEffect(() => {
    if (!scanId) return;
    setLoadingAlerts(true);
    getScanAlerts(scanId, alertsPage, ALERTS_PAGE_SIZE, riskFilter || undefined)
      .then((data: PagedResponse<ZapAlert>) => {
        setAlerts(data.result);
        setAlertsTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoadingAlerts(false));
  }, [scanId, alertsPage, riskFilter]);

  const handleRiskChange = useCallback((r: string) => {
    setRiskFilter(r);
    setAlertsPage(1);
    setExpandedIdx(null);
  }, []);

  const totalPages = Math.ceil(alertsTotal / ALERTS_PAGE_SIZE);
  const alertsStart = alertsTotal > 0 ? (alertsPage - 1) * ALERTS_PAGE_SIZE + 1 : 0;
  const alertsEnd = alertsTotal > 0 ? alertsStart + alerts.length - 1 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8] dark:bg-[#111621] text-[#111318] dark:text-white font-sans antialiased overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden h-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-[#616e89] dark:text-gray-400">
              <a href="/scan/all" className="hover:text-[#2463eb] transition-colors">Scans</a>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#111318] dark:text-white font-medium">#{scanId}</span>
            </nav>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-mono break-all">
                  {loadingScan ? `Scan #${scanId}` : (scan?.target_url ?? `Scan #${scanId}`)}
                </h1>
                <p className="mt-1 text-sm text-[#616e89] dark:text-gray-400">
                  {scan ? formatDate(scan.date) : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {scan && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${scan.scan_type === "passive" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                    {scan.scan_type === "passive" ? "Passive" : "Active"}
                  </span>
                )}
                {scan?.overall_risk_level && (
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${riskStyle(scan.overall_risk_level)}`}>
                    {scan.overall_risk_level}
                  </span>
                )}
              </div>
            </div>

            {/* Alert count cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative overflow-hidden rounded-xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/30 dark:bg-[#1a202c]">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-2 rounded-full bg-red-600" />
                  <h3 className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Critical</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{scan?.critical_alert_count ?? 0}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">findings</span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-orange-200 bg-white p-5 shadow-sm dark:border-orange-900/30 dark:bg-[#1a202c]">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-2 rounded-full bg-orange-500" />
                  <h3 className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">High</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{scan?.high_risk_count ?? 0}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">findings</span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-yellow-200 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-[#1a202c]">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-2 rounded-full bg-yellow-500" />
                  <h3 className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Medium</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{scan?.medium_risk_count ?? 0}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">findings</span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900/30 dark:bg-[#1a202c]">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-2 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Low</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{scan?.low_risk_count ?? 0}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">findings</span>
                </div>
              </div>
            </div>

            {/* Alerts table */}
            <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e5e7eb] dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Table header + filter */}
              <div className="px-6 py-4 border-b border-[#e5e7eb] dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2463eb] text-[20px]">security</span>
                  Alerts
                  {!loadingAlerts && (
                    <span className="ml-1 rounded-full bg-[#f6f6f8] dark:bg-[#111621] px-2 py-0.5 text-xs font-medium text-[#616e89] dark:text-gray-400 border border-[#e5e7eb] dark:border-gray-700">
                      {alertsTotal}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-1 flex-wrap">
                  {RISK_FILTERS.map((r) => (
                    <button
                      key={r || "all"}
                      onClick={() => handleRiskChange(r)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        riskFilter === r
                          ? "bg-[#2463eb] text-white"
                          : "bg-[#f6f6f8] dark:bg-gray-800 text-[#616e89] dark:text-gray-400 hover:bg-[#e5e7eb] dark:hover:bg-gray-700"
                      }`}
                    >
                      {r || "All"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                {loadingAlerts ? (
                  <div className="p-12 text-center text-[#616e89] text-sm">Loading alerts…</div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 p-12 text-center text-[#616e89]">
                    <span className="material-symbols-outlined text-3xl opacity-50">search_off</span>
                    <p className="text-sm font-medium">No alerts found</p>
                    {riskFilter && <p className="text-xs">Try removing the risk filter</p>}
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-[#f3f4f6] dark:bg-gray-800 border-b border-[#e5e7eb] dark:border-gray-700 text-[#4b5563] dark:text-gray-400 uppercase text-xs font-semibold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 w-[120px]">Risk</th>
                        <th className="px-4 py-3">Alert Name</th>
                        <th className="px-4 py-3 w-[220px]">Affected URL</th>
                        <th className="px-4 py-3 w-[110px]">Confidence</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 w-[40px]" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb] dark:divide-gray-700 text-[#111318] dark:text-white">
                      {alerts.map((alert, i) => (
                        <React.Fragment key={i}>
                          <tr
                            onClick={() => setExpandedIdx((prev) => (prev === i ? null : i))}
                            className="hover:bg-[#f6f6f8] dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3 whitespace-nowrap"><RiskBadge risk={alert.risk} /></td>
                            <td className="px-4 py-3 font-medium text-xs max-w-[200px]">{alert.name || alert.alert || "—"}</td>
                            <td className="px-4 py-3 font-mono text-xs max-w-[220px] truncate text-[#616e89] dark:text-gray-400">{alert.url || "—"}</td>
                            <td className="px-4 py-3 text-xs text-[#616e89] dark:text-gray-400 whitespace-nowrap">{alert.confidence || "—"}</td>
                            <td className="px-4 py-3 text-xs text-[#616e89] dark:text-gray-400 max-w-[300px] truncate">{alert.description}</td>
                            <td className="px-4 py-3 text-[#616e89] dark:text-gray-400">
                              <span className="material-symbols-outlined text-[18px]">
                                {expandedIdx === i ? "expand_less" : "expand_more"}
                              </span>
                            </td>
                          </tr>
                          {expandedIdx === i && (
                            <tr className="bg-[#f6f6f8] dark:bg-gray-800/40">
                              <td colSpan={6} className="px-6 py-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#616e89] dark:text-gray-400 mb-1.5">Description</p>
                                    <p className="text-[#111318] dark:text-gray-200 leading-relaxed">{alert.description || "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#616e89] dark:text-gray-400 mb-1.5">Solution</p>
                                    <p className="text-[#111318] dark:text-gray-200 leading-relaxed">{alert.solution || "—"}</p>
                                  </div>
                                  {alert.evidence && (
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wider text-[#616e89] dark:text-gray-400 mb-1.5">Evidence</p>
                                      <pre className="rounded-md bg-slate-800 text-slate-100 text-xs p-3 overflow-x-auto whitespace-pre-wrap break-all">{alert.evidence}</pre>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#616e89] dark:text-gray-400 mb-1.5">CWE ID</p>
                                    <p className="text-[#111318] dark:text-gray-200">{alert.cweid ? `CWE-${alert.cweid}` : "—"}</p>
                                  </div>
                                  {alert.reference && (
                                    <div className="md:col-span-2">
                                      <p className="text-xs font-semibold uppercase tracking-wider text-[#616e89] dark:text-gray-400 mb-1.5">References</p>
                                      <p className="text-xs text-[#616e89] dark:text-gray-400 whitespace-pre-wrap">{alert.reference}</p>
                                    </div>
                                  )}
                                  {alert.nodeName && (
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wider text-[#616e89] dark:text-gray-400 mb-1.5">Node</p>
                                      <p className="font-mono text-xs text-[#111318] dark:text-gray-200 break-all">{alert.nodeName}</p>
                                    </div>
                                  )}
                                  {alert.method && (
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wider text-[#616e89] dark:text-gray-400 mb-1.5">Method</p>
                                      <p className="font-mono text-xs text-[#111318] dark:text-gray-200">{alert.method}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination footer */}
              {alertsTotal > 0 && (
                <div className="flex items-center justify-between border-t border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a202c] px-4 py-3 sm:px-6">
                  <div className="hidden sm:flex flex-1 sm:items-center sm:justify-between">
                    <p className="text-sm text-[#616e89]">
                      Showing <span className="font-medium">{alertsStart}</span> to{" "}
                      <span className="font-medium">{alertsEnd}</span> of{" "}
                      <span className="font-medium">{alertsTotal}</span> alerts
                    </p>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => setAlertsPage((p) => Math.max(1, p - 1))}
                        disabled={alertsPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                      </button>
                      <span className="relative z-10 inline-flex items-center bg-[#2463eb] px-4 py-2 text-sm font-semibold text-white">
                        {alertsPage}
                      </span>
                      <button
                        onClick={() => setAlertsPage((p) => Math.min(totalPages, p + 1))}
                        disabled={alertsPage >= totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>

            {/* AI Summary Chat */}
            {scan?.target_url && (
              <AISummaryChat scanUrl={scan.target_url} scanStatus="done" />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default function ScanResultsPage() {
  return (
    <Suspense>
      <ScanResultsPageInner />
    </Suspense>
  );
}
