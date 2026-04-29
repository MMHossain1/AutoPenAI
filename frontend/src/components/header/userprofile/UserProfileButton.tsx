import type { UserProfileButtonProps } from "./types";

export default function UserProfileButton({ icon, label, onClick }: UserProfileButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#616e89] transition-colors hover:bg-blue-50 hover:text-primary focus:outline-none focus-visible:outline-none active:outline-none dark:text-gray-300 dark:hover:bg-gray-700/60 dark:hover:text-white"
        >
            <span className="material-symbols-outlined text-[20px] group-hover:text-primary">{icon}</span>
            <span>{label}</span>
        </button>
    );
}