import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

export async function requireAdmin() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            );
        }

        // Import User model dynamically to avoid circular dependencies
        const { default: User } = await import("@/models/User");
        const { default: connectDB } = await import("@/utils/db");

        await connectDB();

        const user = await User.findById(session.user.id).select("role");

        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        return null; // No error, user is admin
    } catch (error) {
        console.error("Admin middleware error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function requireSuperAdmin() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            );
        }

        // Import User model dynamically to avoid circular dependencies
        const { default: User } = await import("@/models/User");
        const { default: connectDB } = await import("@/utils/db");

        await connectDB();

        const user = await User.findById(session.user.id).select("role");

        if (!user || user.role !== "super_admin") {
            return NextResponse.json(
                { error: "Forbidden - Super admin access required" },
                { status: 403 }
            );
        }

        return null; // No error, user is super admin
    } catch (error) {
        console.error("Super admin middleware error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
