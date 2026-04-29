const HOST_URL_PLACEHOLDER = "https://example.app.com";
export const DESCRIPTION_MAX_LENGTH = 500;

type ProjectFormFieldsProps = {
  projectName: string;
  projectDescription: string;
  hostUrl: string;
  onProjectNameChange: (value: string) => void;
  onProjectDescriptionChange: (value: string) => void;
  onHostUrlChange?: (value: string) => void;
  hostUrlEditable?: boolean;
  hostUrlError?: string | null;
};

export default function ProjectFormFields({
  projectName,
  projectDescription,
  hostUrl,
  onProjectNameChange,
  onProjectDescriptionChange,
  onHostUrlChange,
  hostUrlEditable = true,
  hostUrlError,
}: ProjectFormFieldsProps) {
  return (
    <>
      <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1a202c]">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-[#616e89] dark:text-slate-400">
              Project Name
            </span>
            <input
              className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3.5 text-[#111318] shadow-sm transition-shadow placeholder:text-[#9aa4b2] focus:border-transparent focus:ring-2 focus:ring-[#2463eb] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              onChange={(e) => onProjectNameChange(e.target.value)}
              placeholder="Financial Portal API"
              type="text"
              value={projectName}
            />
          </label>

          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="block text-sm font-semibold uppercase tracking-wider text-[#616e89] dark:text-slate-400">
                Description
              </span>
              <span className={`text-xs ${projectDescription.length > 500 ? "font-semibold text-red-500" : "text-[#9aa4b2] dark:text-slate-500"}`}>
                {projectDescription.length} / 500
              </span>
            </div>
            <textarea
              className={`w-full resize-y rounded-lg border bg-white px-4 py-3.5 text-[#111318] shadow-sm transition-shadow placeholder:text-[#9aa4b2] focus:border-transparent focus:ring-2 focus:ring-[#2463eb] dark:bg-slate-800 dark:text-white ${
                projectDescription.length > 500
                  ? "border-red-400 dark:border-red-500"
                  : "border-[#e5e7eb] dark:border-slate-700"
              }`}
              onChange={(e) => onProjectDescriptionChange(e.target.value)}
              placeholder="Testing the core banking services for OWASP vulnerabilities"
              rows={4}
              value={projectDescription}
            />
            {projectDescription.length > 500 && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <span className="material-symbols-outlined text-[14px]">error</span>
                Description cannot exceed 500 characters.
              </p>
            )}
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1a202c]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#616e89] dark:text-slate-400">
            Host URL
          </span>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="material-symbols-outlined text-[#9aa4b2]">link</span>
            </div>
            <input
              className={`w-full rounded-lg border bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm transition-shadow placeholder:text-[#9aa4b2] focus:border-transparent focus:ring-2 focus:ring-[#2463eb] dark:bg-slate-800 ${
                !hostUrlEditable
                  ? "cursor-default select-all text-[#616e89] dark:text-slate-400"
                  : "text-[#111318] dark:text-white"
              } ${
                hostUrlError
                  ? "border-red-400 dark:border-red-500"
                  : "border-[#e5e7eb] dark:border-slate-700"
              }`}
              onChange={(e) => {
                if (hostUrlEditable && onHostUrlChange) onHostUrlChange(e.target.value);
              }}
              placeholder={HOST_URL_PLACEHOLDER}
              readOnly={!hostUrlEditable}
              type="url"
              value={hostUrl}
            />
          </div>
          {hostUrlError ? (
            <p className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {hostUrlError}
            </p>
          ) : !hostUrlEditable ? (
            <p className="mt-2 flex items-center gap-1 text-sm text-[#616e89] dark:text-slate-400">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Host URL cannot be changed after project creation.
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#616e89] dark:text-slate-400">
              The base URL of the asset you want to monitor and scan.
            </p>
          )}
        </label>
      </section>
    </>
  );
}
