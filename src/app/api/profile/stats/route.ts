import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Favorite from "@/models/Favorite";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Get user's products
        const userProducts = await Product.find({ seller: session.user.id });
        const activeListings = userProducts.filter((p) => p.isActive).length;
        const totalViews = userProducts.reduce(
            (sum, p) => sum + (p.views || 0),
            0
        );

        // Get user's favorites count
        const favoritesCount = await Favorite.countDocuments({
            userId: session.user.id,
        });

        // Get user's profile views (mock data for now)
        const profileViews = Math.floor(Math.random() * 2000) + 500;

        // Get unread messages count (mock data for now)
        const unreadMessages = Math.floor(Math.random() * 10);

        // Calculate rating (mock data for now)
        const rating = 4.8;

        // Get member since date
        const user = await User.findById(session.user.id).select("createdAt");
        const memberSince = user?.createdAt || new Date();

        // Get recent activity (mock data for now)
        const recentActivity = [
            {
                type: "listing_created",
                title: "New listing created",
                description: "iPhone 13 Pro - 2 hours ago",
                icon: "Package",
                color: "green",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            },
            {
                type: "message_received",
                title: "New message received",
                description: "From John Doe - 4 hours ago",
                icon: "MessageSquare",
                color: "blue",
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            },
            {
                type: "review_received",
                title: "New review received",
                description: "5 stars - 1 day ago",
                icon: "Star",
                color: "yellow",
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            },
            {
                type: "item_favorited",
                title: "Item favorited",
                description: "MacBook Pro - 2 days ago",
                icon: "Heart",
                color: "red",
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
        ];

        // Get achievements (mock data for now)
        const achievements = [
            {
                id: "first_sale",
                title: "First Sale",
                description: "Completed your first transaction",
                icon: "Award",
                color: "yellow",
                unlocked: true,
                unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
            {
                id: "top_rated",
                title: "Top Rated",
                description: "Maintained 4.5+ rating",
                icon: "Star",
                color: "green",
                unlocked: true,
                unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            },
            {
                id: "quick_responder",
                title: "Quick Responder",
                description: "Responds within 1 hour",
                icon: "Clock",
                color: "blue",
                unlocked: true,
                unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
            {
                id: "power_seller",
                title: "Power Seller",
                description: "Sold 50+ items",
                icon: "TrendingUp",
                color: "purple",
                unlocked: false,
                progress: 23, // 23 out of 50
            },
        ];

        return NextResponse.json({
            stats: {
                activeListings,
                totalListings: userProducts.length,
                totalViews,
                favoritesCount,
                profileViews,
                unreadMessages,
                rating,
                memberSince,
            },
            recentActivity,
            achievements,
        });
    } catch (error) {
        console.error("Profile stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile stats" },
            { status: 500 }
        );
    }
}
