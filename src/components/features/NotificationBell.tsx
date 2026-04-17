"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Clock, Droplet, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/notifications?userId=${user.id}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh notifications periodically
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const markAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "POST" });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length === 0) return;
        try {
            await Promise.all(unreadIds.map(id => fetch(`/api/notifications/${id}/read`, { method: "POST" })));
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const clearAll = async () => {
        if (!user || notifications.length === 0) return;
        try {
            await fetch(`/api/notifications?userId=${user.id}`, { method: "DELETE" });
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // Less than a minute
        if (diff < 60000) return "Just now";
        // Less than an hour
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        // Less than a day
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        // More than a day
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    if (!user) return null;

    return (
        <div className="relative ml-2" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 text-red-900 text-[10px] font-bold rounded-full flex items-center justify-center -mt-1 -mr-1 animate-pulse border border-red-600 shadow-md">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 origin-top-right transition-all">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md transition-colors"
                                    title="Mark all as read"
                                >
                                    <Check className="w-3 h-3" /> Mark read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-gray-500 hover:text-red-600 font-medium flex items-center gap-1 bg-gray-100 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                                    title="Clear all notifications"
                                >
                                    <Trash2 className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto w-full">
                        {notifications.length === 0 ? (
                            <div className="py-12 px-4 text-center text-gray-500 flex flex-col items-center">
                                <div className="bg-gray-100 p-3 rounded-full mb-3">
                                    <Bell className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="font-medium text-gray-600">No notifications yet</p>
                                <p className="text-xs mt-1">We'll alert you when there's an update</p>
                            </div>
                        ) : (
                            <div className="flex flex-col w-full divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`block w-full text-left px-4 py-3 hover:bg-red-50/50 transition-colors ${!notif.isRead ? 'bg-red-50/80' : ''}`}
                                        onClick={() => {
                                            markAsRead(notif.id, notif.isRead);
                                            // Don't close immediately if clicking the div to allow copying or whatever
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {notif.type.includes("BLOOD") ? <Droplet className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium whitespace-nowrap ml-2">
                                                        <Clock className="w-3 h-3" /> {formatDate(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className={`text-xs ${!notif.isRead ? 'text-gray-700' : 'text-gray-500'} line-clamp-2 leading-relaxed`}>
                                                    {notif.message}
                                                </p>
                                                {notif.link && (
                                                    <Link
                                                        href={notif.link}
                                                        onClick={() => {
                                                            markAsRead(notif.id, notif.isRead);
                                                            setIsOpen(false);
                                                        }}
                                                        className="inline-block mt-2 text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                                                    >
                                                        View details &rarr;
                                                    </Link>
                                                )}
                                            </div>
                                            {!notif.isRead && (
                                                <div className="flex-shrink-0 self-center">
                                                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 text-center bg-gray-50">
                            <span className="text-xs text-gray-500 font-medium">End of notifications</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
