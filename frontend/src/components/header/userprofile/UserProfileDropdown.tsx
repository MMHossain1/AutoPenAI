/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserProfileButton from "./UserProfileButton";
import SignOutConfirm from "./SignOutConfirm";
import { useAuth } from "@/features/auth";

export default function UserProfileDropdown() {
	const router = useRouter();
	const { logout } = useAuth();
	const [isSignOutOpen, setIsSignOutOpen] = useState(false);

	return (
		<>
			<div className="z-10 w-fit min-w-[296px] max-w-[90vw] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm dark:border-gray-700 dark:bg-[#1a202c]">
				<div className="flex items-center gap-3 border-b border-[#e5e7eb] bg-[#f6f6f8] p-4 dark:border-gray-700 dark:bg-[#111621]">
					<img
						alt="Alex Morgan"
						className="h-12 w-12 rounded-full ring-2 ring-primary/10"
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuCun51h28B18UL5P_ya-_WW1ZYOQEF6FWaxm82BjKG7Jhf7oL2WamHNrBMhOtNkjUDGNOudJzJ7Il6PPrMc4v9GCSOcHBSC9K_bvF-GISgreDTkDZ64PeLITIvJGS8VrtHoWOaZrAA72EoilAhFW2aaL8JogCof9pVi3YXiUDcnphr_Ox_qW_osU3k2qtruaBvyvS8radfOyeBLGGboiuW8WZgJrYCvfPutkHQgRcNipP06B-AEXuFte-qagefPWQcGIiq1wAcCF0gH"
					/>
					<div>
						<p className="text-md font-bold leading-none text-[#111318] dark:text-white">Alex Breslin</p>
						<p className="mt-1 whitespace-nowrap pr-4 text-[14px] text-[#616e89] dark:text-gray-400">Admin </p>
						<p className="whitespace-nowrap pr-4 text-[12px] text-[#616e89] dark:text-gray-400">alex.breslin@example.com</p>
					</div>
				</div>

				<div className="flex flex-col gap-0.5 p-1.5">
					{/* onClick={() => router.push("/home")} */}
					<UserProfileButton icon="person" label="Your Profile" />
					{/* onClick={() => router.push("/home")} */}
					<UserProfileButton icon="manage_accounts" label="Personal Settings" />
					{/* onClick={() => router.push("/home")} */}
					<UserProfileButton icon="security" label="Security & MFA" />
					{/* onClick={() => router.push("/home")} */}
					<UserProfileButton icon="corporate_fare" label="Organisation Workspace" />
				</div>

				<div className="border-t border-[#e5e7eb] p-1.5 dark:border-gray-700">
					<button
						type="button"
						onClick={() => setIsSignOutOpen(true)}
						className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 focus:outline-none focus-visible:outline-none active:outline-none dark:text-red-400 dark:hover:border-red-900/50 dark:hover:bg-red-900/30"
					>
						<span className="material-symbols-outlined text-[20px]">logout</span>
						<span>Sign Out</span>
					</button>
				</div>
			</div>

			<SignOutConfirm
				isOpen={isSignOutOpen}
				onClose={() => setIsSignOutOpen(false)}
				onConfirm={async () => {
					setIsSignOutOpen(false);
					await logout();
					router.push("/");
				}}
			/>
		</>
	);
}
