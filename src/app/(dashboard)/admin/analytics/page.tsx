"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    TrendingUp,
    Users,
    Package,
    DollarSign,
    BarChart3,
    PieChart,
    Activity,
} from "lucide-react";

interface AnalyticsData {
    overview: {
        totalUsers: number;
        totalProducts: number;
        totalMessages: number;
        totalRevenue: number;
        activeListings: number;
        pendingListings: number;
        soldListings: number;
    };
    userGrowth: Array<{
        date: string;
        count: number;
    }>;
    productStats: {
        byCategory: Array<{
            category: string;
            count: number;
        }>;
        byStatus: Array<{
            status: string;
            count: number;
        }>;
        byCondition: Array<{
            condition: string;
            count: number;
        }>;
    };
    topSellers: Array<{
        _id: string;
        name: string;
        email: string;
        productCount: number;
        totalViews: number;
    }>;
    recentActivity: Array<{
        type: string;
        description: string;
        timestamp: string;
        user?: string;
    }>;
}

export default function AdminAnalyticsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/analytics");
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            } else {
                toast.error("Failed to fetch analytics");
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Failed to fetch analytics");
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
            fetchAnalytics();
        } catch (error) {
            console.error("Error checking admin access:", error);
            toast.error("Failed to verify admin access");
        }
    }, [router, fetchAnalytics]);

    // Check admin access and fetch analytics
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            checkAdminAccess();
        }
    }, [status, session, checkAdminAccess]);

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Failed to Load Analytics
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Unable to fetch analytics data
                    </p>
                    <Button onClick={fetchAnalytics}>Retry</Button>
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
                        { label: "Analytics" },
                    ]}
                />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Platform insights, user behavior, and performance
                        metrics
                    </p>
                </div>

                {/* Overview Stats */}
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
                                {analytics.overview.totalUsers}
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
                                {analytics.overview.totalProducts}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Listings
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analytics.overview.activeListings}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₹
                                {analytics.overview.totalRevenue.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts and Detailed Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Products by Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Products by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analytics.productStats.byCategory.map(
                                    (item) => (
                                        <div
                                            key={item.category}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="capitalize">
                                                {item.category}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${
                                                                (item.count /
                                                                    analytics
                                                                        .overview
                                                                        .totalProducts) *
                                                                100
                                                            }%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium w-8">
                                                    {item.count}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products by Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Products by Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analytics.productStats.byStatus.map((item) => (
                                    <div
                                        key={item.status}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="capitalize">
                                            {item.status}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        item.status === "active"
                                                            ? "bg-green-600"
                                                            : item.status ===
                                                              "pending"
                                                            ? "bg-yellow-600"
                                                            : item.status ===
                                                              "sold"
                                                            ? "bg-blue-600"
                                                            : "bg-red-600"
                                                    }`}
                                                    style={{
                                                        width: `${
                                                            (item.count /
                                                                analytics
                                                                    .overview
                                                                    .totalProducts) *
                                                            100
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium w-8">
                                                {item.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Sellers and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Sellers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Top Sellers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analytics.topSellers.map((seller, index) => (
                                    <div
                                        key={seller._id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-medium text-sm">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {seller.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {seller.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {seller.productCount} products
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {seller.totalViews} views
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analytics.recentActivity.map(
                                    (activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(
                                                        activity.timestamp
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
