export interface SettingButtonProps {
	icon: string;
	label: string;
	onClick?: () => void;
}

export interface SettingsDropdownProps {
	onThemeToggle?: () => void;
}
