/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { NotificationItemProps } from "./types";

export default function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
}: NotificationItemProps) {
  const getIconColor = (type?: string) => {
    switch (type) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const getIconBg = (type?: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      case "error":
        return "bg-red-50 dark:bg-red-900/20";
      default:
        return "bg-blue-50 dark:bg-blue-900/20";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer gap-3 border-b border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40 ${
        !notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
      }`}
    >
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getIconBg(notification.type)}`}>
        <span className={`material-symbols-outlined text-lg ${getIconColor(notification.type)}`}>
          {notification.icon || "notifications_none"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111318] dark:text-white line-clamp-1">
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-[#616e89] dark:text-gray-400 line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-[#999] dark:text-gray-500">
          {notification.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {!notification.read && (
        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2" />
      )}
    </div>
  );
}
