type ProjectDetailsSectionProps = {
  projectName: string;
  projectDescription: string;
  onProjectNameChange: (value: string) => void;
  onProjectDescriptionChange: (value: string) => void;
};

export default function ProjectDetailsSection({
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
}: ProjectDetailsSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-gray p-6 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Project Name</span>
          <input
            type="text"
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            placeholder="Financial Portal API"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-shadow placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</span>
          <textarea
            value={projectDescription}
            onChange={(event) => onProjectDescriptionChange(event.target.value)}
            placeholder="Testing the core banking services for OWASP vulnerabilities"
            rows={4}
            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-shadow placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </label>
      </div>
    </section>
  );
}