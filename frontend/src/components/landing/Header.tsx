import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/landing/ThemeToggle";

type HeaderProps = {
  showAuthActions?: boolean;
  showNavigation?: boolean;
  showThemeToggle?: boolean;
};

export default function Header({
  showAuthActions = true,
  showNavigation = true,
  showThemeToggle = true,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-slate-200/10 dark:border-white/5 bg-white/80 dark:bg-[rgb(var(--card)/0.90)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
        {/* Logo */}
        <div className="flex-1">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <Image src="/logo.png" alt="AutoPenAI Logo" className="h-10 w-auto object-contain" width={40} height={40} />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Autopen
            </h2>
          </Link>
        </div>

        {/* Navigation */}
        {showNavigation ? (
          <nav className="hidden md:flex items-center justify-center flex-1 gap-8">
            <Link href="/landing" className="text-lg font-medium text-slate-600 transition-colors hover:text-navy dark:text-slate-300">Features</Link>
            <Link href="/theme" className="text-lg font-medium text-slate-600 transition-colors hover:text-navy dark:text-slate-300">Pricing</Link>
            <Link href="/test" className="text-lg font-medium text-slate-600 transition-colors hover:text-navy dark:text-slate-300">Documentation</Link>
            <a href="#" className="text-lg font-medium text-slate-600 transition-colors hover:text-navy dark:text-slate-300">API</a>
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        {/* CTA Buttons */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {showThemeToggle ? <ThemeToggle /> : null}
          {showAuthActions ? (
            <>
              <Link href="/auth/login" className="bg-secondary hover:opacity-90 border border-border px-4 py-2 rounded-lg text-base font-semibold text-secondary-foreground transition-all">
                Login
              </Link>
              <Link href="/auth/signup" className="bg-navy hover:bg-navy/90 px-5 py-2 rounded-lg text-base font-bold text-white hover:text-white visited:text-white transition-all shadow-lg shadow-navy/20">Get Started</Link>
            </>
          ) : null}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-transparent to-slate-100/40 dark:to-transparent" />
    </header>
  );
}
