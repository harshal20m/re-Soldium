import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/utils/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Message from "@/models/Message";

export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Check if user is admin
        const user = await User.findById(session.user.id).select("role");

        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        // Get overview stats
        const [
            totalUsers,
            totalProducts,
            totalMessages,
            activeListings,
            pendingListings,
            soldListings,
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Message.countDocuments(),
            Product.countDocuments({ status: "active" }),
            Product.countDocuments({ status: "pending" }),
            Product.countDocuments({ status: "sold" }),
        ]);

        // Calculate total revenue (sum of sold products)
        const revenueResult = await Product.aggregate([
            { $match: { status: "sold" } },
            { $group: { _id: null, total: { $sum: "$price" } } },
        ]);
        const totalRevenue =
            revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Get products by category
        const productsByCategory = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // Get products by status (with fallback to isActive)
        const productsByStatus = await Product.aggregate([
            {
                $addFields: {
                    effectiveStatus: {
                        $cond: {
                            if: { $ne: ["$status", null] },
                            then: "$status",
                            else: {
                                $cond: {
                                    if: "$isActive",
                                    then: "active",
                                    else: "sold",
                                },
                            },
                        },
                    },
                },
            },
            { $group: { _id: "$effectiveStatus", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // Get products by condition
        const productsByCondition = await Product.aggregate([
            { $group: { _id: "$condition", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // Get top sellers
        const topSellers = await Product.aggregate([
            {
                $group: {
                    _id: "$seller",
                    productCount: { $sum: 1 },
                    totalViews: { $sum: "$views" },
                },
            },
            { $sort: { productCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "sellerInfo",
                },
            },
            {
                $project: {
                    _id: 1,
                    name: { $arrayElemAt: ["$sellerInfo.name", 0] },
                    email: { $arrayElemAt: ["$sellerInfo.email", 0] },
                    productCount: 1,
                    totalViews: 1,
                },
            },
        ]);

        // Get user growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
            {
                $project: {
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day",
                        },
                    },
                    count: 1,
                    _id: 0,
                },
            },
        ]);

        // Generate recent activity (mock data for now)
        const recentActivity = [
            {
                type: "user_registration",
                description: "New user registered",
                timestamp: new Date().toISOString(),
            },
            {
                type: "product_created",
                description: "New product listing created",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                type: "product_sold",
                description: "Product marked as sold",
                timestamp: new Date(Date.now() - 7200000).toISOString(),
            },
            {
                type: "message_sent",
                description: "New message sent between users",
                timestamp: new Date(Date.now() - 10800000).toISOString(),
            },
        ];

        return NextResponse.json({
            overview: {
                totalUsers,
                totalProducts,
                totalMessages,
                totalRevenue,
                activeListings,
                pendingListings,
                soldListings,
            },
            userGrowth: userGrowth.map((item) => ({
                date: item.date.toISOString().split("T")[0],
                count: item.count,
            })),
            productStats: {
                byCategory: productsByCategory.map((item) => ({
                    category: item._id,
                    count: item.count,
                })),
                byStatus: productsByStatus.map((item) => ({
                    status: item._id,
                    count: item.count,
                })),
                byCondition: productsByCondition.map((item) => ({
                    condition: item._id,
                    count: item.count,
                })),
            },
            topSellers,
            recentActivity,
        });
    } catch (error) {
        console.error("Admin analytics error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
