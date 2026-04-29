"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getScanStatus, streamScanAlerts, stopActiveScan, getAlertCounts } from "@/features/scans/api/scans.api";
import type { ZapAlert } from "@/features/scans/types";
import Header from "@/components/header/Header";
import ScanActivityLog, { type ScanLogEntry, type ScanLogLevel } from "@/components/scan/ScanActivityLog";
import AISummaryChat from "@/components/scan/AISummaryChat";

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function toDisplayHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

type ScanPhase = "idle" | "spidering" | "scanning" | "done" | "stopped" | "error";

export default function ScanPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [scanHost, setScanHost] = useState("");
  const [scanStatus, setScanStatus] = useState<ScanPhase>("idle");
  const [scanId, setScanId] = useState<number | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [alertCounts, setAlertCounts] = useState<Record<string, number>>({ High: 0, Medium: 0, Low: 0, Informational: 0 });
  const [logs, setLogs] = useState<ScanLogEntry[]>([
    {
      id: "init",
      time: nowTime(),
      level: "INFO",
      message: "Waiting for scan status…",
    },
  ]);

  const abortRef = useRef<AbortController | null>(null);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamingRef = useRef(false);
  const countsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const appendLog = useCallback((level: ScanLogLevel, message: string, alert?: ZapAlert) => {
    setLogs((prev) => [
      ...prev.slice(-199),
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        time: nowTime(),
        level,
        message,
        alert,
      },
    ]);
  }, []);

  const connectStream = useCallback(async (zapScanId: string, url: string) => {
    if (streamingRef.current) return;
    streamingRef.current = true;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setScanStatus("scanning");
    appendLog("INFO", zapScanId === "passive" ? "Passive scan finished. Streaming alerts…" : "Active scan started. Streaming alerts…");

    try {
      for await (const event of streamScanAlerts(zapScanId, url, controller.signal)) {
        if (event.type === "progress") {
          const parsed = Number(event.progress);
          setProgress(Number.isFinite(parsed) ? parsed : 0);
        } else if (event.type === "alert") {
          const a = event.alert;
          appendLog("FIND", `${a.name} (${a.risk})${a.url ? ` on ${a.url}` : ""}`, a);
        } else if (event.type === "done") {
          setProgress(100);
          setScanStatus("done");
          appendLog("INFO", `Scan completed with ${event.total} alerts.`);
          // Poll for the DB scan_id (backend saves it shortly after ZAP finishes)
          const pollForScanId = () => {
            getScanStatus()
              .then((s) => {
                if (s.scan_id != null) {
                  setScanId(s.scan_id);
                } else {
                  setTimeout(pollForScanId, 1000);
                }
              })
              .catch(() => { /* scan_id is best-effort */ });
          };
          pollForScanId();
        } else if (event.type === "error") {
          setScanStatus("error");
          appendLog("ERROR", event.message);
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setScanStatus("error");
      appendLog("ERROR", err instanceof Error ? err.message : "Stream error");
    }
  }, [appendLog]);

  const pollStatus = useCallback((url: string) => {
    getScanStatus()
      .then((status) => {
        if (status.status === "spidering") {
          setScanStatus("spidering");
          pollingRef.current = setTimeout(() => pollStatus(url), 2000);
        } else if (status.status === "scanning" && status.zap_scan_id) {
          void connectStream(status.zap_scan_id, url);
        } else if (status.status === "done" && status.zap_scan_id) {
          void connectStream(status.zap_scan_id, url);
        } else if (status.status === "done") {
          setScanStatus("done");
          setProgress(100);
          if (status.scan_id != null) setScanId(status.scan_id);
          appendLog("INFO", "Scan already completed.");
        } else if (status.status === "error") {
          setScanStatus("error");
          appendLog("ERROR", "Scan encountered an error on the backend.");
        } else {
          pollingRef.current = setTimeout(() => pollStatus(url), 2000);
        }
      })
      .catch(() => {
        setScanStatus("error");
        appendLog("ERROR", "Could not reach backend to get scan status.");
      });
  }, [connectStream, appendLog]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    if (!urlParam) return;

    setTargetUrl(urlParam);
    setScanHost(toDisplayHost(urlParam));
    setScanStatus("spidering");
    setLogs([{
      id: "scan-start",
      time: nowTime(),
      level: "INFO",
      message: `Scan started for ${urlParam}. Spidering target…`,
    }]);

    pollStatus(urlParam);

    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
      abortRef.current?.abort();
    };
  // pollStatus is stable — intentionally excluded to run only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScan = useCallback(async () => {
    if (pollingRef.current) clearTimeout(pollingRef.current);
    abortRef.current?.abort();
    try {
      await stopActiveScan();
    } catch {
      // Keep UX responsive even if backend has nothing running
    }
    setScanStatus("stopped");
    appendLog("WARN", "Scan stopped by user.");
  }, [appendLog]);

  const metrics = useMemo(() => ({
    critical: alertCounts["High"] ?? 0,
    high: alertCounts["Medium"] ?? 0,
    medium: alertCounts["Low"] ?? 0,
    low: alertCounts["Informational"] ?? 0,
  }), [alertCounts]);

  const timeline = useMemo(() => {
    const queuedDone = scanStatus !== "idle";
    const spideringActive = scanStatus === "spidering";
    const spideringDone = scanStatus === "scanning" || scanStatus === "done";
    const testingActive = scanStatus === "scanning" && progress < 100;
    const analysisActive = scanStatus === "done";
    const reportReady = false;
    return { queuedDone, spideringActive, spideringDone, testingActive, analysisActive, reportReady };
  }, [progress, scanStatus]);

  const progressBarWidth = `${Math.max(0, Math.min(progress, 100))}%`;
  const isActive = scanStatus === "spidering" || scanStatus === "scanning";

  useEffect(() => {
    if (!targetUrl) return;
    const fetchCounts = () => {
      getAlertCounts(targetUrl).then(setAlertCounts).catch(() => {});
    };
    if (scanStatus === "scanning") {
      fetchCounts();
      countsIntervalRef.current = setInterval(fetchCounts, 3000);
    } else if (scanStatus === "done") {
      fetchCounts();
    }
    return () => {
      if (countsIntervalRef.current) clearInterval(countsIntervalRef.current);
    };
  }, [scanStatus, targetUrl]);

  const statusLabel =
    scanStatus === "spidering" ? "Spidering" :
    scanStatus === "scanning"  ? "Running" :
    scanStatus === "done"      ? "Complete" :
    scanStatus === "error"     ? "Error" :
    scanStatus === "stopped"   ? "Stopped" : "Idle";

  return (
    <div className="relative min-h-screen bg-background-light font-sans text-slate-900 antialiased dark:bg-background-dark dark:text-slate-100">
      <Header />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>Scans</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-slate-900 dark:text-white">Active Scan</span>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {scanHost || "—"}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <span className={`size-1.5 rounded-full ${isActive ? "animate-pulse bg-green-500" : "bg-slate-400"}`} />
                  {statusLabel}
                </span>
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {scanStatus === "spidering"
                  ? "Crawling target for attack surface…"
                  : `Active pentest scan • Progress ${Math.round(progress)}%`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                onClick={() => void stopScan()}
                disabled={!isActive}
              >
                <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                Stop Scan
              </button>
            </div>
          </div>
        </div>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#1a2332]">
          <div className="relative">
            <div className="absolute left-0 top-5 -z-10 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
            <div
              className="absolute left-0 top-5 -z-10 h-1 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-blue-600 transition-all duration-700"
              style={{ width: progressBarWidth }}
            />

            <div className="flex w-full justify-between">
              <div className="group flex flex-col items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-white dark:ring-[#1a2332] ${timeline.queuedDone ? "bg-green-500" : "bg-slate-400"}`}>
                  <span className="material-symbols-outlined text-[20px]">{timeline.queuedDone ? "check" : "schedule"}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Queued</p>
              </div>

              <div className="relative flex flex-col items-center gap-3">
                {timeline.spideringActive && <div className="absolute top-0 size-10 animate-ping rounded-full bg-green-500/30" />}
                <div className={`relative z-10 flex size-10 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-white dark:ring-[#1a2332] ${timeline.spideringDone ? "bg-green-500" : timeline.spideringActive ? "bg-green-500" : "bg-slate-400"}`}>
                  <span className={`material-symbols-outlined text-[20px] ${timeline.spideringActive ? "animate-spin" : ""}`}>
                    {timeline.spideringDone ? "check" : "travel_explore"}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Crawling</p>
              </div>

              <div className="relative flex flex-col items-center gap-3">
                {timeline.testingActive && <div className="absolute top-0 size-10 animate-ping rounded-full bg-blue-500/30" />}
                <div className={`relative z-10 flex size-10 items-center justify-center rounded-full text-white shadow-md ring-4 ring-white dark:ring-[#1a2332] ${timeline.testingActive || scanStatus === "done" ? "bg-blue-600" : "bg-slate-400"}`}>
                  <span className={`material-symbols-outlined text-[20px] ${timeline.testingActive ? "animate-spin" : ""}`}>
                    {scanStatus === "done" ? "check" : "sync"}
                  </span>
                </div>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Testing</p>
              </div>

              <div className={`group flex flex-col items-center gap-3 ${timeline.analysisActive ? "opacity-100" : "opacity-50"}`}>
                <div className={`flex size-10 items-center justify-center rounded-full border-2 text-slate-400 ring-4 ring-white dark:ring-[#1a2332] ${timeline.analysisActive ? "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/40" : "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"}`}>
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">AI Analysis</p>
              </div>

              <div className={`group flex flex-col items-center gap-3 ${timeline.reportReady ? "opacity-100" : "opacity-50"}`}>
                <div className={`flex size-10 items-center justify-center rounded-full border-2 text-slate-400 ring-4 ring-white dark:ring-[#1a2332] ${timeline.reportReady ? "border-green-200 bg-green-50 text-green-600 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400" : "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"}`}>
                  <span className="material-symbols-outlined text-[20px]">description</span>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Report Ready</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/30 dark:bg-[#1a2332]">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-2 rounded-full bg-red-600" />
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Critical</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{metrics.critical}</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">findings</span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-orange-200 bg-white p-5 shadow-sm dark:border-orange-900/30 dark:bg-[#1a2332]">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-2 rounded-full bg-orange-500" />
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">High</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{metrics.high}</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">findings</span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-yellow-200 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-[#1a2332]">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-2 rounded-full bg-yellow-500" />
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Medium</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{metrics.medium}</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">findings</span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900/30 dark:bg-[#1a2332]">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-2 rounded-full bg-blue-500" />
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Low</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{metrics.low}</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">findings</span>
            </div>
          </div>
        </div>

        <ScanActivityLog entries={logs} scanning={isActive} />

        <div id="ai-summary">
          <AISummaryChat scanUrl={targetUrl} scanId={scanId} scanStatus={scanStatus === "done" ? "done" : scanStatus === "stopped" ? "stopped" : scanStatus === "error" ? "error" : "running"} />
        </div>
      </main>

      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
