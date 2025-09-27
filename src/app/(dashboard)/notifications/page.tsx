"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    MessageCircle,
    Heart,
    Eye,
    Settings,
    Check,
    CheckCheck,
    Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    data?: Record<string, unknown>;
    relatedProduct?: {
        _id: string;
        title: string;
        price: number;
        images: string[];
    };
    timestamp: Date;
}

export default function NotificationsPage() {
    const { status } = useSession();
    const router = useRouter();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    } = useNotifications();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "message":
                return <MessageCircle className="h-5 w-5 text-blue-600" />;
            case "favorite":
                return <Heart className="h-5 w-5 text-red-600" />;
            case "view":
                return <Eye className="h-5 w-5 text-green-600" />;
            case "product_sold":
                return <Check className="h-5 w-5 text-green-600" />;
            case "product_updated":
                return <Settings className="h-5 w-5 text-orange-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case "message":
                return "border-l-blue-500 bg-blue-50";
            case "favorite":
                return "border-l-red-500 bg-red-50";
            case "view":
                return "border-l-green-500 bg-green-50";
            case "product_sold":
                return "border-l-green-500 bg-green-50";
            case "product_updated":
                return "border-l-orange-500 bg-orange-50";
            default:
                return "border-l-gray-500 bg-gray-50";
        }
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        // Mark as read if not already read
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Navigate based on notification type and data
        if (
            notification.data?.conversationId ||
            notification.type === "message"
        ) {
            const conversationId = notification.data?.conversationId;
            if (conversationId) {
                router.push(`/messages?conversationId=${conversationId}`);
            } else {
                router.push("/messages");
            }
        } else if (
            notification.data?.productId ||
            notification.relatedProduct?._id
        ) {
            const productId =
                notification.data?.productId ||
                notification.relatedProduct?._id;
            router.push(`/product/${productId}`);
        } else if (notification.type === "favorite") {
            router.push("/favorites");
        }
    };

    const handleMarkAllAsRead = async () => {
        setLoading(true);
        try {
            await markAllAsRead();
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to mark all as read");
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        if (confirm("Are you sure you want to clear all notifications?")) {
            setLoading(true);
            try {
                clearNotifications();
                toast.success("All notifications cleared");
            } catch {
                toast.error("Failed to clear notifications");
            } finally {
                setLoading(false);
            }
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Notifications
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {unreadCount > 0
                                ? `${unreadCount} unread notification${
                                      unreadCount === 1 ? "" : "s"
                                  }`
                                : "All caught up!"}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button
                                onClick={handleMarkAllAsRead}
                                disabled={loading}
                                variant="outline"
                                size="sm"
                            >
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark All Read
                            </Button>
                        )}
                        <Button
                            onClick={handleClearAll}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No notifications yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                You&apos;ll see notifications here when someone
                                messages you, favorites your items, or when
                                there are updates to your listings.
                            </p>
                            <Button asChild>
                                <a href="/sell">Start Selling</a>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
                                    notification.isRead
                                        ? "bg-white border-l-gray-300"
                                        : getNotificationColor(
                                              notification.type
                                          )
                                }`}
                                onClick={() =>
                                    handleNotificationClick(notification)
                                }
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(
                                                notification.type
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3
                                                    className={`font-medium ${
                                                        notification.isRead
                                                            ? "text-gray-700"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    {!notification.isRead && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            New
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                notification.timestamp
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <p
                                                className={`text-sm ${
                                                    notification.isRead
                                                        ? "text-gray-600"
                                                        : "text-gray-800"
                                                }`}
                                            >
                                                {notification.message}
                                            </p>

                                            {notification.relatedProduct && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Related to:{" "}
                                                    {
                                                        notification
                                                            .relatedProduct
                                                            .title
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Notification Types Legend */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Notification Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <MessageCircle className="h-4 w-4 text-blue-600" />
                                <span>
                                    Messages - New chat messages about your
                                    listings
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Heart className="h-4 w-4 text-red-600" />
                                <span>
                                    Favorites - Someone favorited your item
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Eye className="h-4 w-4 text-green-600" />
                                <span>
                                    Views - High view counts on your listings
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-600" />
                                <span>Sales - Your items have been sold</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
