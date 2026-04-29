"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [domain, setDomain] = useState("");
  const router = useRouter();

  const handleScan = () => {
    if (domain.trim()) {
      router.push(`/scan?url=${encodeURIComponent(domain.trim())}`);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleScan();
        }}
        className="glass-card p-1.5 rounded-xl flex items-center shadow-2xl"
      >
        <div className="pl-4 flex items-center text-slate-500">
          <span className="material-symbols-outlined">language</span>
        </div>
        <input
          type="text"
          placeholder="https://your-domain.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          suppressHydrationWarning
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-500 py-3 px-4 text-lg focus:outline-none"
        />
        <button
          type="submit"
          suppressHydrationWarning
          className="bg-navy hover:bg-navy/90 text-white text-sm font-bold px-6 h-10 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-navy/30"
        >
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          Scan Now
        </button>
      </form>
    </div>
  );
}
