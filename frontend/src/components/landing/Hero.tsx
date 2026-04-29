"use client";

import SearchBar from './SearchBar'

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-6 hero-gradient overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100/60 via-slate-50/20 to-transparent dark:from-white/5 dark:via-transparent dark:to-transparent pointer-events-none"></div>
      {/* Gradient fade-out at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none"></div>
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-navy/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px]"></div>

      <div className="max-w-[960px] w-full text-center relative z-10 flex flex-col items-center">
        {/* Spacer to preserve vertical space of removed badge */}
        <div aria-hidden className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8 opacity-0 pointer-events-none"></div>

        {/* Headline */}
        <h1 className="font-grotesk text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight text-slate-950 dark:text-white">
          Secure Your Website<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy to-accent-cyan">Before Hackers Do</span>
        </h1>

        {/* Subheading */}
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Identify vulnerabilities before attackers do.<br></br>Instant Automated Penetration Testing Powered By AI
        </p>

        {/* Search Bar */}
        <SearchBar />
      </div>
    </section>
  )
}
