"use client";

import { useTheme } from "@/theme/ThemeContext";
import SettingButton from "./SettingButton";
import type { SettingsDropdownProps } from "./types";

export default function SettingsDropdown({ onThemeToggle }: SettingsDropdownProps) {
	const { theme, setTheme } = useTheme();

	const handleThemeToggle = () => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
		onThemeToggle?.();
	};

	return (
		<div className="absolute right-0 top-12 z-50 w-fit min-w-[280px] max-w-[90vw] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm dark:border-gray-700 dark:bg-[#1a202c]">
			<div className="flex flex-col gap-0.5 p-1.5">
				<SettingButton
					icon={theme === "dark" ? "light_mode" : "dark_mode"}
					label={theme === "dark" ? "Light Mode" : "Dark Mode"}
					onClick={handleThemeToggle}
				/>
				<SettingButton icon="notifications" label="Notifications" onClick={() => console.log("Notifications")} />
				<SettingButton icon="privacy_tip" label="Privacy Settings" onClick={() => console.log("Privacy")} />
				<SettingButton icon="help" label="Help & Support" onClick={() => console.log("Help")} />
			</div>
		</div>
	);
}
