"use client";

import { useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MessageCircle, Heart, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } =
        useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "message":
                return <MessageCircle className="h-4 w-4 text-blue-600" />;
            case "favorite":
                return <Heart className="h-4 w-4 text-red-600" />;
            case "view":
                return <Eye className="h-4 w-4 text-green-600" />;
            default:
                return <Bell className="h-4 w-4 text-gray-600" />;
        }
    };

    const handleNotificationClick = (notification: {
        id: string;
        type: string;
        isRead: boolean;
        data?: Record<string, unknown>;
        relatedProduct?: {
            _id: string;
            title: string;
            price: number;
            images: string[];
        };
    }) => {
        // Mark as read if not already read
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        setIsOpen(false);

        // Navigate based on notification type and data
        if (
            notification.data?.conversationId ||
            notification.type === "message"
        ) {
            const conversationId = notification.data?.conversationId;
            if (conversationId) {
                window.location.href = `/messages?conversationId=${conversationId}`;
            } else {
                window.location.href = `/messages`;
            }
        } else if (
            notification.data?.productId ||
            notification.relatedProduct?._id
        ) {
            const productId =
                notification.data?.productId ||
                notification.relatedProduct?._id;
            window.location.href = `/product/${productId}`;
        } else if (notification.type === "favorite") {
            window.location.href = `/favorites`;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative p-2">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 max-h-96 overflow-y-auto"
            >
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-gray-900">
                        Notifications
                    </h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.slice(0, 10).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                onClick={() =>
                                    handleNotificationClick(notification)
                                }
                                className={`p-3 cursor-pointer ${
                                    !notification.isRead ? "bg-blue-50" : ""
                                }`}
                            >
                                <div className="flex items-start space-x-3 w-full">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDistanceToNow(
                                                notification.timestamp,
                                                { addSuffix: true }
                                            )}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a
                                href="/notifications"
                                className="flex items-center justify-center p-2"
                            >
                                <Bell className="h-4 w-4 mr-2" />
                                View all notifications
                            </a>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
