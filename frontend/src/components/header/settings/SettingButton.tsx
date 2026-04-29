"use client";

import type { SettingButtonProps } from "./types";

export default function SettingButton({ icon, label, onClick }: SettingButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-[#616e89] transition-colors hover:bg-blue-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700/60 dark:hover:text-white focus:outline-none focus-visible:outline-none active:outline-none"
		>
			<span className="material-symbols-outlined text-[20px]">{icon}</span>
			<span>{label}</span>
		</button>
	);
}
