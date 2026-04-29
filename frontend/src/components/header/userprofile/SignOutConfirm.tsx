"use client";

import type { SignOutConfirmProps } from "./types";

export default function SignOutConfirm({ isOpen, onClose, onConfirm }: SignOutConfirmProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-8 shadow-xl transition-all dark:bg-[#1a202c]"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Sign out confirmation"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">logout</span>
                    </div>
                    <h2 className="text-[24px] font-bold text-[#111318] dark:text-white">Sign Out</h2>
                    <p className="mt-2 w-full max-w-[40ch] whitespace-normal break-words text-center text-sm leading-relaxed text-[#616e89] dark:text-gray-300">
                        Are you sure you want to sign out? You will need to log back in to access your projects and
                        scan data.
                    </p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full rounded-lg bg-red-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:bg-red-700 active:opacity-80 focus:outline-none"
                    >
                        Sign Out
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-lg bg-[#f3f4f6] py-3.5 text-sm font-bold uppercase tracking-wide text-[#111318] transition-all hover:bg-[#e5e7eb] active:opacity-80 focus:outline-none dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
}