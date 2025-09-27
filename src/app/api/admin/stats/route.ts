import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/utils/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

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

        // Get basic stats
        const [
            totalUsers,
            totalProducts,
            totalMessages,
            totalConversations,
            activeListings,
            pendingListings,
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Message.countDocuments(),
            Conversation.countDocuments(),
            Product.countDocuments({ status: "active" }),
            Product.countDocuments({ status: "pending" }),
        ]);

        // Get recent users (last 5)
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email createdAt role");

        // Get recent products (last 5)
        const recentProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("seller", "name")
            .select("title price seller createdAt status");

        // Calculate total revenue (sum of all product prices - this is just for demo)
        const revenueResult = await Product.aggregate([
            { $match: { status: "sold" } },
            { $group: { _id: null, total: { $sum: "$price" } } },
        ]);
        const totalRevenue =
            revenueResult.length > 0 ? revenueResult[0].total : 0;

        return NextResponse.json({
            totalUsers,
            totalProducts,
            totalMessages,
            totalConversations,
            activeListings,
            pendingListings,
            totalRevenue,
            recentUsers,
            recentProducts,
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
