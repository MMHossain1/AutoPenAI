"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header/Header";
import ProjectFormFields, { DESCRIPTION_MAX_LENGTH } from "@/components/projects/ProjectFormFields";
import { getProjects, updateProject } from "@/features/scans/api/scans.api";
import type { ApiError } from "@/features/scans/types";

function EditProjectPageInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = Number(searchParams.get("id"));

	const [projectName, setProjectName] = useState("");
	const [projectDescription, setProjectDescription] = useState("");
	const [hostUrl, setHostUrl] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;
		getProjects()
			.then((all) => {
				const project = all.find((p) => p.domain_id != null && p.domain_id === id);
				if (!project) {
					setLoadError("Project not found.");
					return;
				}
				setProjectName(project.title);
				setProjectDescription(project.description ?? "");
				setHostUrl(project.domain);
			})
			.catch((err) => setLoadError(err?.message ?? "Failed to load project."))
			.finally(() => setIsLoading(false));
	}, [id]);

	const handleSubmit = async () => {
		setFormError(null);
		setIsSubmitting(true);
		try {
			await updateProject(id, projectName, projectDescription);
			router.push(`/project/details?id=${id}`);
		} catch (err) {
			const apiErr = err as ApiError;
			setFormError(apiErr.message || "Failed to update project. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
			<Header />

			<main className="mx-auto w-full max-w-3xl p-4 md:p-6 lg:p-10">
				<div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
					<Link className="text-slate-500 transition-colors hover:text-primary" href="/home">
						Home
					</Link>
					<span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
					<Link className="text-slate-500 transition-colors hover:text-primary" href="/project/overview">
						Projects
					</Link>
					<span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
					<Link className="text-slate-500 transition-colors hover:text-primary" href={`/project/details?id=${id}`}>
						{isLoading ? "…" : (projectName || String(id))}
					</Link>
					<span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
					<span className="font-semibold text-slate-900 dark:text-white">Edit</span>
				</div>

				<div className="mb-8 space-y-2">
					<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
						Edit Project
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-400">
						Update the name and description for this project.
					</p>
				</div>

				{loadError ? (
					<div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
						{loadError}
					</div>
				) : (
					<div className="flex flex-col gap-8">
						<ProjectFormFields
							projectName={projectName}
							projectDescription={projectDescription}
							hostUrl={hostUrl}
							onProjectNameChange={setProjectName}
							onProjectDescriptionChange={setProjectDescription}
							hostUrlEditable={false}
						/>

						{formError && (
							<div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
								{formError}
							</div>
						)}

						<div className="flex justify-end gap-3">
							<Link
								className="rounded-lg border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
								href={`/project/details?id=${id}`}
							>
								Cancel
							</Link>
							<button
								className="flex items-center gap-2 rounded-lg bg-[#2463eb] px-6 py-3 font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={isSubmitting || isLoading || projectDescription.length > DESCRIPTION_MAX_LENGTH}
								onClick={handleSubmit}
								type="button"
							>
								<span className="material-symbols-outlined text-[20px]">
									{isSubmitting ? "hourglass_top" : "save"}
								</span>
								{isSubmitting ? "Saving…" : "Save Changes"}
							</button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

export default function EditProjectPage() {
	return (
		<Suspense>
			<EditProjectPageInner />
		</Suspense>
	);
}
