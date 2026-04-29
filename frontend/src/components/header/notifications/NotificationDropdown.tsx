"use client";

import { useState } from "react";
import NotificationItem from "./NotificationItem";
import type { NotificationDropdownProps } from "./types";

export default function NotificationDropdown({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onClearAll,
}: NotificationDropdownProps) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.read && !readIds.has(n.id)).length;

  const handleMarkAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
    onMarkAsRead?.(id);
  };

  const handleClearAll = () => {
    setReadIds(new Set());
    onClearAll?.();
  };

  return (
    <div
      className="absolute right-0 top-12 z-50 w-fit min-w-[360px] max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#1a202c]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-bold text-[#111318] dark:text-white">Notifications</h3>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <span className="material-symbols-outlined mb-2 text-3xl text-gray-400 dark:text-gray-600">
              notifications_none
            </span>
            <p className="text-xs text-[#616e89] dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => {
                onNotificationClick?.(notification);
                if (!notification.read) {
                  handleMarkAsRead(notification.id);
                }
              }}
              onMarkAsRead={() => handleMarkAsRead(notification.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
          <button
            onClick={handleClearAll}
            className="w-full text-center text-xs font-semibold text-[#616e89] transition-colors hover:text-[#111318] dark:text-gray-400 dark:hover:text-white"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
