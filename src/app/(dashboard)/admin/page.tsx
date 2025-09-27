"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Users,
    Package,
    MessageSquare,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";

interface AdminStats {
    totalUsers: number;
    totalProducts: number;
    totalMessages: number;
    totalConversations: number;
    activeListings: number;
    pendingListings: number;
    totalRevenue: number;
    recentUsers: Array<{
        _id: string;
        name: string;
        email: string;
        createdAt: string;
        role: string;
    }>;
    recentProducts: Array<{
        _id: string;
        title: string;
        price: number;
        seller: {
            name: string;
        };
        createdAt: string;
        status: string;
    }>;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const fetchAdminStats = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/stats");
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                toast.error("Failed to fetch admin statistics");
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            toast.error("Failed to fetch admin statistics");
        } finally {
            setLoading(false);
        }
    }, []);

    const checkAdminAccess = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/check-access");
            if (!response.ok) {
                if (response.status === 403) {
                    toast.error("Access denied. Admin privileges required.");
                    router.push("/");
                } else {
                    toast.error("Failed to verify admin access");
                }
                return;
            }
            fetchAdminStats();
        } catch (error) {
            console.error("Error checking admin access:", error);
            toast.error("Failed to verify admin access");
        }
    }, [router, fetchAdminStats]);

    // Check admin access
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            checkAdminAccess();
        }
    }, [status, session, checkAdminAccess]);

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "super_admin":
                return "bg-red-100 text-red-800";
            case "admin":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "sold":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Failed to Load Dashboard
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Unable to fetch admin statistics
                    </p>
                    <Button onClick={fetchAdminStats}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: "Admin", href: "/admin" },
                        { label: "Dashboard" },
                    ]}
                />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Manage users, products, and monitor platform activity
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalUsers}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Products
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalProducts}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Listings
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.activeListings}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Messages
                            </CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalMessages}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.recentUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {user.email}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(
                                                    user.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge
                                            className={getRoleBadgeColor(
                                                user.role
                                            )}
                                        >
                                            {user.role}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.recentProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        className="flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {product.title}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                by {product.seller.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                ₹
                                                {product.price.toLocaleString()}{" "}
                                                •{" "}
                                                {new Date(
                                                    product.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge
                                            className={getStatusBadgeColor(
                                                product.status
                                            )}
                                        >
                                            {product.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    onClick={() => router.push("/admin/users")}
                                    variant="outline"
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Manage Users
                                </Button>
                                <Button
                                    onClick={() =>
                                        router.push("/admin/products")
                                    }
                                    variant="outline"
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    Manage Products
                                </Button>
                                <Button
                                    onClick={() =>
                                        router.push("/admin/analytics")
                                    }
                                    variant="outline"
                                >
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    View Analytics
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
