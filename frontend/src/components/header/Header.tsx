"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import UserProfileDropdown from "@/components/header/userprofile/UserProfileDropdown";
import NotificationDropdown from "@/components/header/notifications/NotificationDropdown";
import SettingsDropdown from "@/components/header/settings/SettingsDropdown";
import type { Notification } from "@/components/header/notifications";
import { getProjects, getUserScans } from "@/features/scans/api/scans.api";
import type { Project } from "@/features/scans/types";

type FlawCounts = {
    critical: number;
    high: number;
    medium: number;
    low: number;
};

export default function Header() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [flawCountsByDomain, setFlawCountsByDomain] = useState<Record<string, FlawCounts>>({});
    const profileContainerRef = useRef<HTMLDivElement>(null);
    const notificationsContainerRef = useRef<HTMLDivElement>(null);
    const settingsContainerRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            title: "Scan Complete",
            message: "Your security scan for example.com has completed",
            timestamp: new Date(Date.now() - 5 * 60000),
            read: false,
            icon: "check_circle",
            type: "success",
        },
        {
            id: "2",
            title: "Vulnerability Found",
            message: "Critical vulnerability detected in scan results",
            timestamp: new Date(Date.now() - 15 * 60000),
            read: false,
            icon: "error",
            type: "warning",
        },
    ]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (profileContainerRef.current && !profileContainerRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationsContainerRef.current && !notificationsContainerRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
            if (settingsContainerRef.current && !settingsContainerRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        setSearchQuery(searchParams.get("q") ?? "");
    }, [searchParams]);

    useEffect(() => {
        let isCancelled = false;
        getProjects()
            .then((result) => {
                if (!isCancelled) setProjects(result);
            })
            .catch(() => {
                if (!isCancelled) setProjects([]);
            });
        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;
        getUserScans(1, 200)
            .then((paged) => {
                if (isCancelled) return;

                const latestByDomain: Record<string, { date: number; counts: FlawCounts }> = {};
                for (const scan of paged.result) {
                    const domain = scan.target_url;
                    if (!domain) continue;
                    const ts = new Date(scan.date).getTime();
                    const current = latestByDomain[domain];
                    if (current && current.date >= ts) continue;

                    latestByDomain[domain] = {
                        date: ts,
                        counts: {
                            critical: scan.critical_alert_count ?? 0,
                            high: scan.high_risk_count ?? 0,
                            medium: scan.medium_risk_count ?? 0,
                            low: scan.low_risk_count ?? 0,
                        },
                    };
                }

                const flattened: Record<string, FlawCounts> = {};
                for (const [domain, value] of Object.entries(latestByDomain)) {
                    flattened[domain] = value.counts;
                }
                setFlawCountsByDomain(flattened);
            })
            .catch(() => {
                if (!isCancelled) setFlawCountsByDomain({});
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    const trimmedQuery = searchQuery.trim().toLowerCase();
    const searchResults = useMemo(() => {
        if (!trimmedQuery) return [];
        return projects
            .filter((project) => {
                const haystack = `${project.title ?? ""} ${project.description ?? ""} ${project.domain ?? ""}`.toLowerCase();
                return haystack.includes(trimmedQuery);
            })
            .slice(0, 6);
    }, [projects, trimmedQuery]);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (trimmedQuery && searchResults.length > 0) {
            openProjectFromSearch(searchResults[0]);
            return;
        }
        setIsSearchOpen(true);
    };

    const openProjectFromSearch = (project: Project) => {
        setIsSearchOpen(false);
        setSearchQuery(project.title || project.domain || "");
        if (project.domain_id != null) {
            router.push(`/project/details?id=${project.domain_id}`);
        }
    };

    const renderFlawBadges = (project: Project) => {
        const counts = flawCountsByDomain[project.domain] ?? { critical: 0, high: 0, medium: 0, low: 0 };
        const badges = [
            { label: "C", value: counts.critical, className: "bg-red-50 text-red-700 border-red-200" },
            { label: "H", value: counts.high, className: "bg-orange-50 text-orange-700 border-orange-200" },
            { label: "M", value: counts.medium, className: "bg-amber-50 text-amber-700 border-amber-200" },
            { label: "L", value: counts.low, className: "bg-lime-50 text-lime-700 border-lime-200" },
        ];

        return (
            <div className="ml-4 flex shrink-0 items-center gap-1.5">
                {badges.map((badge) => (
                    <span
                        key={badge.label}
                        className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${badge.className}`}
                        title={`${badge.label}: ${badge.value}`}
                    >
                        <span>{badge.label}</span>
                        <span>{badge.value}</span>
                    </span>
                ))}
            </div>
        );
    };

    return(
        <header className="flex items-center justify-between whitespace-nowrap border-b border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-[#1a202c] px-6 py-3 shrink-0 z-20">
            <div
                className="flex items-center gap-3 text-[#111318] dark:text-white cursor-pointer"
                onClick={() => router.push("/home")}
            >
                <Image src="/logo.png" alt="AutoPenAI Logo" className="h-8 w-auto object-contain" width={32} height={32} />
                <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">AutoPen</h2>
            </div>

            <div className="hidden md:flex flex-1 justify-center px-6" ref={searchContainerRef}>
                <form className="relative flex flex-col h-10 w-full max-w-2xl" onSubmit={handleSearchSubmit}>
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                        <div className="text-[#616e89] flex border-none bg-[#f6f6f8] dark:bg-[#111621] items-center justify-center pl-4 rounded-l-lg border-r-0">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            suppressHydrationWarning
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#f6f6f8] dark:bg-[#111621] focus:border-none h-full placeholder:text-[#616e89] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                            onChange={(event) => {
                                setSearchQuery(event.target.value);
                                setIsSearchOpen(true);
                            }}
                            onFocus={() => setIsSearchOpen(true)}
                            placeholder="Search projects..."
                            value={searchQuery}
                        />
                    </div>

                    {isSearchOpen && trimmedQuery && (
                        <div className="absolute top-full mt-2 z-50 w-full overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-lg dark:border-gray-700 dark:bg-[#1a202c]">
                            {searchResults.length > 0 ? (
                                <ul className="max-h-72 overflow-y-auto py-1">
                                    {searchResults.map((project) => (
                                        <li key={project.domain}>
                                            <button
                                                type="button"
                                                className="w-full px-4 py-2.5 text-left hover:bg-[#f6f6f8] dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => openProjectFromSearch(project)}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm text-[#111318] dark:text-white">
                                                            <span className="font-semibold">{project.title || project.domain}</span>
                                                            <span className="mx-2 text-[#9aa4ba]">•</span>
                                                            <span className="text-xs text-[#616e89]">{project.domain}</span>
                                                        </p>
                                                    </div>
                                                    {renderFlawBadges(project)}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-4 py-3 text-sm text-[#616e89]">No matching projects</div>
                            )}
                        </div>
                    )}
                </form>
			      </div>

            <div className="flex items-center">
                {/* Actions */}
                <div className="flex gap-2 items-center">
                <div ref={notificationsContainerRef} className="relative">
                    <button
                        suppressHydrationWarning
                        onClick={() => {
                            setIsNotificationsOpen((prev) => {
                                const next = !prev;
                                if (next) {
                                    setIsProfileOpen(false);
                                    setIsSettingsOpen(false);
                                }
                                return next;
                            });
                        }}
                        className="flex items-center justify-center rounded-lg size-10 bg-[#f6f6f8] dark:bg-[#111621] text-[#111318] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                    </button>
                    {isNotificationsOpen && (
                        <NotificationDropdown
                            notifications={notifications}
                            onNotificationClick={(notification) => {
                                console.log("Clicked notification:", notification);
                            }}
                            onMarkAsRead={(id) => {
                                setNotifications((prev) =>
                                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                                );
                            }}
                            onClearAll={() => {
                                setNotifications([]);
                            }}
                        />
                    )}
                </div>
                <div ref={settingsContainerRef} className="relative">
                    <button
                        suppressHydrationWarning
                        onClick={() => {
                            setIsSettingsOpen((prev) => {
                                const next = !prev;
                                if (next) {
                                    setIsProfileOpen(false);
                                    setIsNotificationsOpen(false);
                                }
                                return next;
                            });
                        }}
                        className="flex items-center justify-center rounded-lg size-10 bg-[#f6f6f8] dark:bg-[#111621] text-[#111318] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                    </button>
                    {isSettingsOpen && <SettingsDropdown onThemeToggle={() => setIsSettingsOpen(false)} />}
                </div>
                <div ref={profileContainerRef} className="relative ml-2">
                    <button
                        type="button"
                        suppressHydrationWarning
                        aria-label="Open user profile menu"
                        onClick={() => {
                            setIsProfileOpen((prev) => {
                                const next = !prev;
                                if (next) {
                                    setIsNotificationsOpen(false);
                                    setIsSettingsOpen(false);
                                }
                                return next;
                            });
                        }}
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-gray-200 dark:border-gray-700"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD-76CcRUQ9tqU5SutHjDYZYn8eUz-e46R89qY-Ax4zsAmOBOfEL1R5cDrWLHDzb7tXzf54Pts3kmb7r54L7qb0mYb52ctIPMQBoy_9DgBTLYk6noibEXp4fBZq_BRcQs3Ui_zAl3DYLScogYLOSv1Vo4e86vm6pETJDFbakGe06GvE98l9S9uOterfJsqc5DaPNsUdCnt91y4oBx35zTKuuOz3CimS6GLjBkoVBsuTqDl7NorHA9pmllgjTto9lVqxWRtr1y70af1M")' }}
                    />
                    {isProfileOpen ? (
                        <div className="absolute right-0 top-full mt-2 z-50">
                            <UserProfileDropdown />
                        </div>
                    ) : null}
                </div>
                </div>
            </div>
        </header>
    )
}