"use client";

import { useEffect, useRef } from "react";
import type { ZapAlert } from "@/features/scans/types";

export type ScanLogLevel = "INFO" | "TEST" | "WARN" | "FIND" | "ERROR";

export type ScanLogEntry = {
  id: string;
  time: string;
  level: ScanLogLevel;
  message: string;
  alert?: ZapAlert;
};

type ScanActivityLogProps = {
  entries: ScanLogEntry[];
  scanning: boolean;
};

export default function ScanActivityLog({ entries, scanning }: ScanActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [entries]);

  return (
    <div className="flex h-[400px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1a2332]">
      <div className="flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-slate-500 dark:text-slate-400">terminal</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Real-time Activity Log</h3>
          <span className={`ml-2 flex size-2 rounded-full ${scanning ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
          <span className="text-xs text-slate-500 dark:text-slate-400">{scanning ? "Live" : "Idle"}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-b-xl bg-slate-50 p-4 font-mono text-xs dark:bg-[#0f1218] md:text-sm">
        {entries.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">Waiting for scan events...</p>
        ) : (
          entries.map((entry) => {
            const isWarn = entry.level === "WARN";
            const isFind = entry.level === "FIND";
            const isError = entry.level === "ERROR";
            const isTest = entry.level === "TEST";

            return (
              <div
                key={entry.id}
                className={[
                  "-mx-2 flex gap-4 rounded px-2 py-1.5",
                  isFind
                    ? "ml-0 border-l-2 border-red-500 bg-red-50/50 pl-2.5 hover:bg-red-50 dark:bg-red-900/10 dark:hover:bg-red-900/20"
                    : isError
                      ? "bg-red-50/50 hover:bg-red-50 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                      : isWarn
                        ? "bg-yellow-50/50 hover:bg-yellow-50 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/20"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50",
                ].join(" ")}
              >
                <span className="min-w-[80px] select-none text-slate-400">{entry.time}</span>
                <span
                  className={[
                    "min-w-[60px] font-bold",
                    isFind || isError
                      ? "text-red-600 dark:text-red-400"
                      : isWarn
                        ? "text-yellow-600 dark:text-yellow-400"
                        : isTest
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-blue-600 dark:text-blue-400",
                  ].join(" ")}
                >
                  [{entry.level}]
                </span>
                <span
                  className={
                    isFind || isError
                      ? "font-medium text-red-800 dark:text-red-200"
                      : isWarn
                        ? "text-yellow-800 dark:text-yellow-200"
                        : "text-slate-700 dark:text-slate-300"
                  }
                >
                  {entry.message}
                </span>
                {entry.alert?.risk ? (
                  <span className="ml-auto self-center rounded border border-red-200 px-1.5 text-[10px] uppercase text-red-600 dark:border-red-800 dark:text-red-400">
                    {entry.alert.risk}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}
