"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/header/Header";
import ProjectFormFields, { DESCRIPTION_MAX_LENGTH } from "@/components/projects/ProjectFormFields";
import { saveProject } from "@/features/scans/api/scans.api";
import type { ApiError } from "@/features/scans/types";

export default function CreateProjectPage() {
	const router = useRouter();
	const [projectName, setProjectName] = useState("");
	const [projectDescription, setProjectDescription] = useState("");
	const [hostUrl, setHostUrl] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hostUrlError, setHostUrlError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const handleSubmit = async () => {
		setHostUrlError(null);
		setFormError(null);
		setIsSubmitting(true);
		try {
			const created = await saveProject({ domain: hostUrl.trim(), title: projectName, description: projectDescription });
			router.push(`/project/details?id=${created.domain_id!}`);
		} catch (err) {
			const apiErr = err as ApiError;
			const msg = apiErr.message ?? "";
			if (
				apiErr.status === 409 ||
				msg.toLowerCase().includes("duplicate") ||
				msg.toLowerCase().includes("already exist")
			) {
				setHostUrlError("A project with this host URL already exists.");
			} else {
				setFormError(msg || "Failed to create project. Please try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#f6f6f8] text-[#111318] dark:bg-[#111621] dark:text-white">
			<Header />

			<main className="mx-auto w-full max-w-3xl p-4 md:p-6 lg:p-10">
				<div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
					<Link className="text-[#616e89] transition-colors hover:text-[#2463eb]" href="/home">
						Home
					</Link>
					<span className="material-symbols-outlined text-[16px] text-[#9aa4b2]">chevron_right</span>
					<Link className="text-[#616e89] transition-colors hover:text-[#2463eb]" href="/project/overview">
						Projects
					</Link>
					<span className="material-symbols-outlined text-[16px] text-[#9aa4b2]">chevron_right</span>
					<span className="font-semibold text-[#111318] dark:text-white">Create Project</span>
				</div>

				<div className="mb-8 space-y-2">
					<h1 className="text-3xl font-black tracking-tight text-[#111318] dark:text-white md:text-4xl">
						Create New Project
					</h1>
					<p className="text-lg text-[#616e89] dark:text-slate-400">
						Set up a new project to organise and track your security scans.
					</p>
				</div>

				<div className="flex flex-col gap-8">
					<ProjectFormFields
						projectName={projectName}
						projectDescription={projectDescription}
						hostUrl={hostUrl}
						onProjectNameChange={setProjectName}
						onProjectDescriptionChange={setProjectDescription}
						onHostUrlChange={(val) => {
							setHostUrl(val);
							if (hostUrlError) setHostUrlError(null);
						}}
						hostUrlEditable
						hostUrlError={hostUrlError}
					/>

					{formError && (
						<div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
							{formError}
						</div>
					)}

					<div className="flex justify-end gap-3">
						<Link
							className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
							href="/project/overview"
						>
							Cancel
						</Link>
						<button
							className="flex items-center gap-2 rounded-lg bg-[#2463eb] px-6 py-3 font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={isSubmitting || projectDescription.length > DESCRIPTION_MAX_LENGTH}
							onClick={handleSubmit}
							type="button"
						>
							<span className="material-symbols-outlined text-[20px]">
								{isSubmitting ? "hourglass_top" : "add_circle"}
							</span>
							{isSubmitting ? "Creating…" : "Create Project"}
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}
