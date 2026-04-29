import { getProjects, getProjectLastScan } from "@/features/scans/api/scans.api";
import type { Project } from "@/features/scans";
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function timeAgo(date: Date): string {
    const ms = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return seconds <= 1 ? "just now" : `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
}

export default function ProjectCards(){
    const [projects, setProjects] = useState<Project[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = (searchParams.get("q") ?? "").trim().toLowerCase();

    useEffect(() => {
        getProjects()
            .then(async (result) => {
                for (const proj of result) {
                    if (proj.domain_id != null) {
                        try {
                            proj.lastScanDate = (await getProjectLastScan(proj.domain_id)).date;
                        } catch {
                            // project has no scans yet
                        }
                    }
                }
                setProjects([...result]);
            })
            .catch((err) => {
                if (err?.status === 401) {
                    router.push("/auth/login");
                }
            });
    }, [router])

    const goToProject = (domainId: number) => {
        router.push(`/project/details?id=${domainId}`)
    }

    const visibleProjects = projects.filter((project) => {
        if (!query) return true;
        const haystack = `${project.title ?? ""} ${project.description ?? ""} ${project.domain ?? ""}`.toLowerCase();
        return haystack.includes(query);
    });

    return(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {!visibleProjects.length && (
                <div className="col-span-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-10 text-center text-sm text-[#616e89] dark:border-gray-700 dark:bg-[#1a202c] dark:text-slate-300">
                    No projects match your search.
                </div>
            )}
            {visibleProjects.map((project, index) => {
                const lastScanned = project.lastScanDate
                    ? `Scanned ${timeAgo(project.lastScanDate)}`
                    : "Never scanned";
                return(
                    <div key={project.domain || index} className="group bg-white dark:bg-[#1a202c] rounded-lg border border-[#e5e7eb] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between min-h-[160px]">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col min-w-0">
                        <h3 className="font-semibold text-[#111318] dark:text-white text-base truncate">{project.title}</h3>
                        <p className="text-xs text-[#616e89] mt-1 truncate">{project.description}</p>
                        </div>
                        <button
                            className="text-[#616e89] hover:text-[#2463eb] transition-colors"
                            onClick={() => goToProject(project.domain_id!)}>
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#616e89] mb-4">
                        <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                        <span>{lastScanned}</span>
                    </div>
                    </div>
                )
            })}
        </div>
    )
}