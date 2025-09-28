import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/utils/db";
import User from "@/models/User";

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

        const user = await User.findById(session.user.id).select("role");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if user is admin or super_admin
        const isAdmin = user.role === "admin" || user.role === "super_admin";

        return NextResponse.json({
            success: true,
            isAdmin,
            role: user.role,
            message: isAdmin ? "Admin access granted" : "User access confirmed",
        });
    } catch (error) {
        console.error("Admin access check error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
