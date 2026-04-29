export interface UserProfileIdentity {
	name: string;
	role: string;
	email: string;
	avatarUrl: string;
}

export interface UserProfileMenuItem {
	id: string;
	label: string;
	icon: string;
	onClick?: () => void;
}

// Props for UserProfileButton component
export interface UserProfileButtonProps {
	icon: string;
	label: string;
	onClick?: () => void;
}


export interface SignOutConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export interface UserProfileDropdownProps {
	user?: UserProfileIdentity;
	menuItems?: UserProfileMenuItem[];
	onSignOut?: () => void;
}
