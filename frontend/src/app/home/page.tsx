"use client";

import ActivityTable from "@/components/home/ActivityTable"
import ProjectCards from "@/components/home/ProjectCards";
import Sidebar from "@/components/home/Sidebar";
import Header from "@/components/header/Header";

export default function HomePage() {

  return (
    <div className="bg-[#f6f6f8] dark:bg-[#111621] text-[#111318] dark:text-white font-sans min-h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
        <Header />
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#f6f6f8] dark:bg-[#111621] p-4 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Breadcrumb & Title */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-[#616e89]">
                    <a className="hover:text-[#2463eb] transition-colors" href="#">Home</a>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-[#111318] dark:text-white font-medium">Dashboard Overview</span>
                  </div>
                  <h1 className="text-[#111318] dark:text-white text-2xl md:text-3xl font-bold tracking-tight">Your Projects</h1>
                </div>
                <a href="/project/new" className="flex items-center gap-1.5 rounded-lg h-9 px-4 bg-[#2463eb] text-white hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold leading-normal">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  New Project
                </a>
              </div>
            </div>

            {/* Project Cards Grid */}
            <ProjectCards />

            {/* Recent Activity Table */}
            <ActivityTable />
          </div>
        </main>
      </div>
    </div>
  );
}
