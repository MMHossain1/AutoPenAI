"use client";

import { ChangeEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header/Header";
import { startActiveScan, startPassiveScan } from "@/features/scans/api/scans.api";

const PROFILE_DURATION: Record<string, string> = {
	quick: "~ 15 minutes",
	standard: "~ 2 hours",
	deep: "~ 6+ hours",
};

const TARGET_URL = "https://example.app.com";

const SCANNER_OPTIONS = [
	{ id: "ajax", label: "AJAX" },
	{ id: "passive", label: "Passive" },
] as const;

function NewScanPageInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const scanProfile = "standard";
	const domainId = searchParams.get("id") ? Number(searchParams.get("id")) : undefined;
	const [targetUrl, setTargetUrl] = useState<string>(searchParams.get("url") ?? "");
	const [zapUsername, setZapUsername] = useState<string>("");
	const [zapPassword, setZapPassword] = useState<string>("");
	const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
	const [enabledScanners, setEnabledScanners] = useState<Record<string, boolean>>({
		ajax: true,
		passive: false,
	});
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isStarting, setIsStarting] = useState(false);
	const [startError, setStartError] = useState<string | null>(null);

	const handleUploadFiles = (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []).map((file) => file.name);
		if (files.length === 0) return;
		setUploadedFiles((prev) => [...new Set([...prev, ...files])]);
		event.target.value = "";
	};

	const removeUploadedFile = (fileName: string) => {
		setUploadedFiles((prev) => prev.filter((file) => file !== fileName));
	};

	const toggleScanner = (scannerId: string) => {
		setEnabledScanners((prev) => ({
			...prev,
			[scannerId]: !prev[scannerId],
		}));
	};

	return (
		<div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
			<Header />

			<main className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-10">
				<div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
					<Link className="text-slate-500 transition-colors hover:text-primary" href="/home">
						Home
					</Link>
					<span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
					<Link className="text-slate-500 transition-colors hover:text-primary" href="/scan">
						Scans
					</Link>
					<span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
					<span className="font-semibold text-slate-900 dark:text-white">New Scan</span>
				</div>

				<div className="flex flex-col gap-8 lg:flex-row">
					<div className="flex flex-1 flex-col gap-8">
						<div className="space-y-2">
							<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">Configure New Scan</h1>
							<p className="text-lg text-slate-600 dark:text-slate-400">Set up an automated security assessment for your assets.</p>
						</div>

						<section className="rounded-xl border border-slate-200 bg-gray p-6 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-500 dark:text-slate-400">Target URL</span>
								<div className="group relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
										<span className="material-symbols-outlined text-slate-400">link</span>
									</div>
									<input
										className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 shadow-sm transition-shadow placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
										onChange={(event) => setTargetUrl(event.target.value)}
										placeholder={TARGET_URL}
										type="url"
										value={targetUrl}
									/>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-green-500">
										<span className="material-symbols-outlined text-[20px]">check_circle</span>
									</div>
								</div>
								<p className="mt-2 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
									<span className="material-symbols-outlined text-[16px] text-green-500">verified_user</span>
									Domain ownership verified via DNS record.
								</p>
							</label>
						</section>

						<section className="rounded-xl border border-slate-200 bg-gray p-6 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
							<div className="mb-4 flex items-center gap-3">
								<span className="material-symbols-outlined text-slate-400">lock</span>
								<h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Authentication <span className="text-sm font-normal">(Optional)</span></h3>
							</div>
							<p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
								Provide credentials to allow ZAP to scan authenticated areas of the target.
							</p>
							<div className="space-y-4">
								<label className="block">
									<span className="mb-2 block text-sm font-medium text-slate-500 dark:text-slate-400">Username</span>
									<div className="relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
											<span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
										</div>
										<input
											className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition-shadow placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
											onChange={(event) => setZapUsername(event.target.value)}
											placeholder="username"
											type="text"
											value={zapUsername}
											autoComplete="off"
										/>
									</div>
								</label>
								<label className="block">
									<span className="mb-2 block text-sm font-medium text-slate-500 dark:text-slate-400">Password</span>
									<div className="relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
											<span className="material-symbols-outlined text-slate-400 text-[18px]">key</span>
										</div>
										<input
											className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition-shadow placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
											onChange={(event) => setZapPassword(event.target.value)}
											placeholder="••••••••"
											type="password"
											value={zapPassword}
											autoComplete="new-password"
										/>
									</div>
								</label>
							</div>
						</section>

						<section className="rounded-xl border border-slate-200 bg-gray p-6 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
							<div className="mb-4 flex items-center gap-3">
								<h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Scanning Profile</h3>
							</div>

							<div className="space-y-4">
								<div>
									<p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Scanner Engines</p>
									<div className="flex flex-wrap gap-2">
										{SCANNER_OPTIONS.map((scanner) => {
											const enabled = enabledScanners[scanner.id];
											return (
												<button
													key={scanner.id}
													className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
														enabled
															? "border-primary/40 bg-primary/10 text-primary"
															: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
													}`}
													onClick={() => toggleScanner(scanner.id)}
													type="button"
												>
													<span className="material-symbols-outlined text-[16px]">{enabled ? "check_circle" : "radio_button_unchecked"}</span>
													<span>{scanner.label}</span>
												</button>
											);
										})}
									</div>
								</div>

								<label className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 transition-all hover:border-primary/50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
									<div className="flex flex-col items-center justify-center px-4 pb-6 pt-5 text-center">
										<span className="material-symbols-outlined mb-2 text-[32px] text-slate-400 transition-colors group-hover:text-primary">cloud_upload</span>
										<p className="mb-1 text-sm text-slate-700 dark:text-slate-300">
											<span className="font-semibold">Drag and drop</span> custom test files (.json, .yaml) or click to browse
										</p>
										<p className="text-xs text-slate-500 dark:text-slate-500">These custom tests will be executed alongside the selected test packs.</p>
									</div>
									<input accept=".json,.yaml" className="hidden" multiple onChange={handleUploadFiles} type="file" />
								</label>

								{uploadedFiles.length > 0 && (
									<div>
										<p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Recently Uploaded</p>

										<div className="flex flex-wrap gap-2">
											{uploadedFiles.map((fileName) => (
												<div
													className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
													key={fileName}
												>
													<span className="material-symbols-outlined text-[14px]">description</span>
													<span>{fileName}</span>
													<button className="flex items-center hover:text-red-500" onClick={() => removeUploadedFile(fileName)} type="button">
														<span className="material-symbols-outlined text-[14px]">close</span>
													</button>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</section>
					</div>
					<div className="w-full flex-shrink-0 lg:w-80">
						<div className="space-y-4 lg:sticky lg:top-24">
							<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
								<h4 className="mb-4 font-bold text-slate-900 dark:text-white">Summary</h4>
								<ul className="space-y-4 text-sm">
									<li className="flex justify-between">
										<span className="text-slate-500">Estimated Duration</span>
										<span className="font-medium text-slate-900 dark:text-white">{PROFILE_DURATION[scanProfile]}</span>
									</li>
								</ul>
								<hr className="my-4 border-slate-100 dark:border-slate-700" />
								<div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-600 dark:bg-amber-900/20 dark:text-amber-500">
									<span className="material-symbols-outlined mt-0.5 text-[16px]">warning</span>
									<p>Scanning production assets may trigger alerts or impact performance.</p>
								</div>
								<button
									className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2463eb] px-4 py-3 font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
									disabled={!targetUrl.trim()}
									onClick={() => {
										setIsAuthorized(false);
										setIsConfirmOpen(true);
									}}
									type="button"
								>
									<span>Review & Start Scan</span>
									<span className="material-symbols-outlined text-[20px]">play_arrow</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>

			<div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity ${isConfirmOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}>
				<div className={`w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-transform dark:border-slate-700 dark:bg-slate-800 ${isConfirmOpen ? "scale-100" : "scale-95"}`}>
					<div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
						<div>
							<h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Scan Execution</h3>
							<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Please verify the configuration before starting.</p>
						</div>
						<button
							className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
							onClick={() => setIsConfirmOpen(false)}
							type="button"
						>
							<span className="material-symbols-outlined">close</span>
						</button>
					</div>

					<div className="space-y-4 p-6">
						<div className="flex items-center gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
							<div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-primary dark:bg-blue-900/40">
								<span className="material-symbols-outlined">dns</span>
							</div>
							<div className="overflow-hidden">
								<p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Target</p>
								<p className="truncate font-mono text-base font-medium text-slate-900 dark:text-white">{targetUrl}</p>
							</div>
						</div>

						<label className="flex cursor-pointer items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
							<input
								checked={isAuthorized}
								className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
								onChange={(event) => setIsAuthorized(event.target.checked)}
								type="checkbox"
							/>
							<span>I am authorized to scan this target and I understand the potential risks to service availability.</span>
						</label>
					</div>

					{startError && (
						<div className="mx-6 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
							{startError}
						</div>
					)}
					<div className="flex gap-3 p-6 pt-2">
						<button
							className="flex-1 rounded-lg border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
							onClick={() => setIsConfirmOpen(false)}
							type="button"
						>
							Cancel
						</button>
						<button
							className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2463eb] px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={!isAuthorized || isStarting}
							onClick={async () => {
								const urlToScan = (targetUrl || TARGET_URL).trim();
								setIsStarting(true);
								setStartError(null);
								try {
									const scanFn = enabledScanners.passive ? startPassiveScan : startActiveScan;
									await scanFn(
										urlToScan,
										domainId,
										zapUsername || undefined,
										zapPassword || undefined,
										enabledScanners.ajax,
									);
									router.push(`/scan/inprogress?url=${encodeURIComponent(urlToScan)}`);
								} catch (err) {
									setStartError(err instanceof Error ? err.message : "Failed to start scan");
									setIsStarting(false);
								}
							}}
							type="button"
						>
							<span className="material-symbols-outlined">{isStarting ? "hourglass_top" : "rocket_launch"}</span>
							{isStarting ? "Starting…" : "Execute Scan"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function NewScanPage() {
	return (
		<Suspense>
			<NewScanPageInner />
		</Suspense>
	);
}
