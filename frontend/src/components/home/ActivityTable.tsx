import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserScans } from "@/features/scans/api/scans.api";
import type { ScanSummary } from "@/features/scans";

const PAGE_SIZE = 5;


const riskLevelStyles: Record<string, string> = {
    Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    High:     "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Medium:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Low:      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Info:     "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

function RiskBadge({ level }: { level?: string | null }) {
    if (!level) return <span className="text-[#616e89] text-xs">—</span>;
    const style = riskLevelStyles[level] ?? "bg-gray-100 text-gray-600";
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${style}`}>
            {level}
        </span>
    );
}

function AlertCounts({ scan }: { scan: ScanSummary }) {
    const counts = [
        { label: "C", value: scan.critical_alert_count, color: "text-red-600 dark:text-red-400" },
        { label: "H", value: scan.high_risk_count,      color: "text-orange-500 dark:text-orange-400" },
        { label: "M", value: scan.medium_risk_count,    color: "text-yellow-500 dark:text-yellow-400" },
        { label: "L", value: scan.low_risk_count,       color: "text-green-600 dark:text-green-500" },
    ];

    const hasAny = counts.some(c => c.value != null);
    if (!hasAny) return <span className="text-[#616e89] text-xs">—</span>;

    return (
        <div className="flex items-center gap-2 justify-end">
            {counts.map(({ label, value, color }) => (
                <span key={label} className={`text-xs font-semibold ${color}`}>
                    {label}: {value ?? 0}
                </span>
            ))}
        </div>
    );
}

export default function ActivityTable(){
    const router = useRouter();
    const [scans, setScans] = useState<ScanSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        getUserScans(page, PAGE_SIZE).then(response => {
            setScans(response.result);
            setTotal(response.total);
        });
    }, [page]);

    const start = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
    const end = total > 0 ? start + scans.length - 1 : 0;

    return(
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-[#111318] dark:text-white text-xl font-bold leading-tight">Recent Scan Activity</h2>
                <a className="text-sm font-medium text-[#2463eb] hover:text-blue-700 flex items-center gap-1" href="/scan/all">
                    View all scans
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
            </div>
            <div className="w-full overflow-hidden rounded-lg border border-[#e5e7eb] dark:border-gray-700 shadow-sm bg-white dark:bg-[#1a202c]">
            <div className="overflow-x-auto max-h-[330px] overflow-y-auto">
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
            {scans.length === 0 ? (
                <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#616e89]">
                    <span className="material-symbols-outlined text-3xl opacity-50">
                        search_off
                    </span>
                    <p className="text-sm font-medium">No scan activity yet</p>
                    <p className="text-xs">Run your first scan to see results here</p>
                    </div>
                </td>
                </tr>
            ) : (
                scans.map(scan => (
                <tr key={scan.scanid} onClick={() => router.push(`/scan/results?id=${scan.scanid}`)} className="hover:bg-[#f6f6f8] dark:hover:bg-gray-800/50 transition-all duration-150 cursor-pointer">
                    <td className="px-6 py-4 text-[#616e89] font-mono text-xs">#{scan.scanid}</td>
                    <td className="px-6 py-4 font-medium font-mono text-xs">{scan.target_url}</td>
                    <td className="px-6 py-4 text-[#616e89] text-xs">
                        {new Date(scan.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${scan.scan_type === "passive" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                            {scan.scan_type === "passive" ? "Passive" : "Active"}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <RiskBadge level={scan.overall_risk_level} />
                    </td>
                    <td className="px-6 py-4">
                        <AlertCounts scan={scan} />
                    </td>
                </tr>
                ))
            )}
            </tbody>
                </table>
            </div>
 {/* Table Footer */}
        {total > 0 && (
        <div className="flex items-center justify-between border-t border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a202c] px-4 py-3 sm:px-6">
            <div className="hidden sm:flex flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-[#616e89]">
                Showing <span className="font-medium">{start}</span> to{" "}
                <span className="font-medium">{end}</span> of{" "}
                <span className="font-medium">{total}</span> results
            </p>

            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>

                <span className="relative z-10 inline-flex items-center bg-[#2463eb] px-4 py-2 text-sm font-semibold text-white">
                {page}
                </span>

                <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * PAGE_SIZE >= total}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
            </nav>
            </div>
        </div>
        )}
            </div>
        </div>
    )
}
