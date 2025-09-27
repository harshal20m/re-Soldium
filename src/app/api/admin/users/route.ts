import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/utils/db";
import User from "@/models/User";
import Product from "@/models/Product";

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

        // Get all users with their product counts
        const users = await User.find()
            .sort({ createdAt: -1 })
            .select("name email role createdAt image phone location");

        // Get product counts for each user
        const usersWithCounts = await Promise.all(
            users.map(async (user) => {
                const productCount = await Product.countDocuments({
                    seller: user._id,
                });
                return {
                    ...user.toObject(),
                    productCount,
                };
            })
        );

        return NextResponse.json({
            users: usersWithCounts,
        });
    } catch (error) {
        console.error("Admin users GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
