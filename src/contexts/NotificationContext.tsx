"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Notification {
    id: string;
    type:
        | "message"
        | "favorite"
        | "view"
        | "system"
        | "product_sold"
        | "product_updated";
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    data?: Record<string, unknown>;
    relatedProduct?: {
        _id: string;
        title: string;
        price: number;
        images: string[];
    };
    relatedUser?: {
        _id: string;
        name: string;
        email: string;
        image?: string;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (
        notification: Omit<Notification, "id" | "timestamp" | "isRead">
    ) => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!session?.user || !("id" in session.user)) return;

        try {
            const response = await fetch("/api/notifications");
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, [session?.user]);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        if (session?.user && "id" in session.user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [session?.user, fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isRead: true }),
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === id
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch("/api/notifications/mark-all-read", {
                method: "PUT",
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notification) => ({
                        ...notification,
                        isRead: true,
                    }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const addNotification = (
        notification: Omit<Notification, "id" | "timestamp" | "isRead">
    ) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            isRead: false,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
        });
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                addNotification,
                clearNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider"
        );
    }
    return context;
}
