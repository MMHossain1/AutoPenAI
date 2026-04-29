/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function LandingPage() {
	return (
		<div className="bg-background-light text-slate-800 antialiased min-h-screen flex flex-col dark:bg-background-dark dark:text-slate-100">
			<header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 dark:bg-slate-900 dark:border-slate-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy/10 text-navy">
								<span className="material-symbols-outlined text-2xl">security</span>
							</div>
							<h1 className="text-slate-800 text-lg font-bold tracking-tight dark:text-slate-100">
								Pentest Platform
							</h1>
						</div>
						<Link
							href="/auth/login"
							className="flex items-center justify-center h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 hover:text-navy transition-colors focus:outline-none focus:ring-2 focus:ring-navy/20 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
						>
							Sign In
						</Link>
					</div>
				</div>
			</header>

			<main className="flex-grow flex flex-col items-center">
				<section className="w-full bg-white border-b border-slate-200 pb-16 pt-20 px-4 sm:px-6 lg:px-8 dark:bg-slate-900 dark:border-slate-700">
					<div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
						<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/10 text-navy text-xs font-semibold uppercase tracking-wide">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-navy opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-navy"></span>
							</span>
							Internal Network Only
						</div>

						<h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight leading-[1.1] dark:text-slate-100">
							Secure your endpoints <span className="text-navy">instantly</span>.
						</h2>

						<p className="text-lg text-slate-500 max-w-2xl leading-relaxed dark:text-slate-300">
							Paste a URL below to initiate a preliminary vulnerability scan.
							Authorized for internal services and pre-approved external assets.
						</p>

						<div className="w-full max-w-2xl mt-4">
							<form className="relative group" action="#">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-navy transition-colors">
									<span className="material-symbols-outlined">link</span>
								</div>
								<input
									className="block w-full pl-12 pr-32 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 transition-all text-lg shadow-sm hover:border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
									placeholder="https://internal-service.company.com"
									required
									type="url"
								/>
								<div className="absolute inset-y-0 right-2 flex items-center">
									<button
										className="h-10 px-6 bg-navy hover:bg-navy/90 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
										type="button"
									>
										<span className="material-symbols-outlined text-[18px]">radar</span>
										Start Scan
									</button>
								</div>
							</form>
							<p className="mt-3 text-xs text-slate-400 dark:text-slate-300/80">
								<span className="font-medium text-slate-500 dark:text-slate-200">
									Pro Tip:
								</span>{" "}
								You can also paste IP addresses (e.g., 192.168.1.1)
							</p>
						</div>
					</div>
				</section>

				<section className="w-full bg-slate-50 py-16 px-4 border-b border-slate-200 dark:bg-slate-950 dark:border-slate-700">
					<div className="max-w-7xl mx-auto flex flex-col items-center">
						<div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm max-w-3xl w-full text-center dark:bg-slate-900 dark:border-slate-700">
							<h3 className="text-2xl font-bold text-slate-800 mb-2 dark:text-slate-100">
								Need full access?
							</h3>
							<p className="text-slate-500 mb-8 max-w-lg mx-auto dark:text-slate-300">
								Sign in to manage scheduled scans, view historical reports, and
								access advanced configuration options for your team.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<button className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700">
									<img
										alt="Google Logo"
										className="w-5 h-5"
										src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx8fittjgZQFIql8SaANTQpcmvZ9tTjehmri5BivPLb-kBIVCKdVkhzqf2FrG4xDjWVXh-5ooA4qo2SAmExKgxvTGhUXOvt7nyRElWtykxBFCZRfm7KKCx8ynEUJfF9uulC5-I36MnfM87NDl6zTtcPjKw_crmdTHuc6xzH97oc-kCdRyKiZ7vREELtxRem7pNUqvgH-4AjsM91zG9chnGIy3ibCIBMijLSc9fajlmamtP0pwMfsJO4MGINBm8vCNzkqqZ5RFifrID"
									/>
									<span>Sign in with Google</span>
								</button>
								<button className="flex items-center justify-center gap-3 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] dark:bg-slate-700 dark:hover:bg-slate-600">
									<span className="material-symbols-outlined text-[20px]">mail</span>
									<span>Sign in with Email</span>
								</button>
							</div>
						</div>
					</div>
				</section>

				<section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
					<div className="mb-12 text-center sm:text-left">
						<h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-4 dark:text-slate-100">
							Platform Capabilities
						</h3>
						<p className="text-slate-500 max-w-2xl dark:text-slate-300">
							Automated security testing designed for modern engineering teams,
							integrated directly into your workflow.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group dark:bg-slate-900 dark:border-slate-700">
							<div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform dark:bg-blue-900/30 dark:text-blue-300">
								<span className="material-symbols-outlined text-3xl">
									verified_user
								</span>
							</div>
							<h4 className="text-lg font-bold text-slate-800 mb-2 dark:text-slate-100">
								OWASP Top 10 Checks
							</h4>
							<p className="text-slate-500 text-sm leading-relaxed dark:text-slate-300">
								Comprehensive scanning against critical web application security
								risks including Injection, Broken Authentication, and XSS.
							</p>
						</div>

						<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group dark:bg-slate-900 dark:border-slate-700">
							<div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform dark:bg-indigo-900/30 dark:text-indigo-300">
								<span className="material-symbols-outlined text-3xl">description</span>
							</div>
							<h4 className="text-lg font-bold text-slate-800 mb-2 dark:text-slate-100">
								Instant PDF Reports
							</h4>
							<p className="text-slate-500 text-sm leading-relaxed dark:text-slate-300">
								Generate executive summaries and detailed technical remediation
								reports in seconds to share with stakeholders.
							</p>
						</div>

						<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group dark:bg-slate-900 dark:border-slate-700">
							<div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform dark:bg-teal-900/30 dark:text-teal-300">
								<span className="material-symbols-outlined text-3xl">dataset</span>
							</div>
							<h4 className="text-lg font-bold text-slate-800 mb-2 dark:text-slate-100">
								JIRA Integration
							</h4>
							<p className="text-slate-500 text-sm leading-relaxed dark:text-slate-300">
								Automatically create tickets for discovered vulnerabilities in
								your project board with severity ratings pre-filled.
							</p>
						</div>
					</div>
				</section>

				<footer className="w-full bg-slate-50 border-t border-slate-200 mt-auto dark:bg-slate-950 dark:border-slate-700">
					<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
						<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-4 items-start mb-8 dark:bg-amber-100/90 dark:border-amber-300">
							<span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5">
								warning
							</span>
							<div className="text-sm text-amber-900">
								<p className="font-bold mb-1">Authorization Required</p>
								<p className="opacity-90">
									Scanning production environments requires explicit approval from
									the Infosec team. Ensure targets are within the approved scope
									list. Unauthorized scanning is prohibited and monitored.
								</p>
							</div>
						</div>
						<div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-300">
							<p>© 2023 Internal SecOps Team. v2.4.0</p>
							<div className="flex gap-6">
								<a className="hover:text-navy transition-colors" href="#">
									Documentation
								</a>
								<a className="hover:text-navy transition-colors" href="#">
									Scope Guidance
								</a>
								<a className="hover:text-navy transition-colors" href="#">
									Support
								</a>
							</div>
						</div>
					</div>
				</footer>
			</main>
		</div>
	);
}
