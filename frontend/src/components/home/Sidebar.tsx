"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const active = "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#2463eb]/10 text-[#2463eb]";
const inactive = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#616e89] hover:bg-[#f6f6f8] dark:hover:bg-[#111621] hover:text-[#111318] dark:hover:text-white transition-colors";

export default function Sidebar() {
  const pathname = usePathname();

  const nav = (href: string) => pathname === href || pathname.startsWith(href + "/") ? active : inactive;

    return(
        <aside className="w-64 bg-white dark:bg-[#1a202c] border-r border-[#e5e7eb] dark:border-gray-800 flex-col justify-between hidden md:flex shrink-0">
          <div className="flex flex-col gap-2 p-4">
            {/* User Context */}
            <div className="flex gap-3 mb-6 p-2 rounded-lg hover:bg-[#f6f6f8] dark:hover:bg-[#111621] transition-colors cursor-pointer">
              <div className="bg-[#2463eb]/10 text-[#2463eb] flex items-center justify-center rounded-lg size-10 shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-[#111318] dark:text-white text-sm font-semibold truncate">SecOps Team</h1>
                <p className="text-[#616e89] text-xs font-normal truncate">Internal Tools</p>
              </div>
            </div>
            {/* Main Nav */}
            <nav className="flex flex-col gap-1">
              <Link className={nav("/home")} href="/home">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                <p className="text-sm font-medium leading-normal">Dashboard</p>
              </Link>
              <Link className={nav("/project")} href="/project/overview">
                <span className="material-symbols-outlined text-[20px]">folder</span>
                <p className="text-sm font-medium leading-normal">Projects</p>
              </Link>
              <Link className={nav("/scan")} href="/scan/all">
                <span className="material-symbols-outlined text-[20px]">radar</span>
                <p className="text-sm font-medium leading-normal">Scans</p>
              </Link>
              <Link className={nav("/findings")} href="#">
                <span className="material-symbols-outlined text-[20px]">bug_report</span>
                <p className="text-sm font-medium leading-normal">Findings</p>
              </Link>
              <Link className={nav("/reports")} href="#">
                <span className="material-symbols-outlined text-[20px]">description</span>
                <p className="text-sm font-medium leading-normal">Reports</p>
              </Link>
            </nav>
            <div className="my-4 border-t border-[#e5e7eb] dark:border-gray-800" />
          </div>
        </aside>
    )
}