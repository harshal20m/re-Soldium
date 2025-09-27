import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/utils/db";
import User from "@/models/User";
import Product from "@/models/Product";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();
        const { role } = body;

        await connectDB();

        // Check if user is admin
        const adminUser = await User.findById(session.user.id).select("role");

        if (
            !adminUser ||
            (adminUser.role !== "admin" && adminUser.role !== "super_admin")
        ) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        // Prevent non-super-admins from creating super-admins
        if (role === "super_admin" && adminUser.role !== "super_admin") {
            return NextResponse.json(
                { error: "Only super admins can create super admins" },
                { status: 403 }
            );
        }

        // Prevent users from changing their own role
        if (id === session.user.id) {
            return NextResponse.json(
                { error: "You cannot change your own role" },
                { status: 400 }
            );
        }

        // Update user role
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select("name email role");

        if (!updatedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: "User role updated successfully",
        });
    } catch (error) {
        console.error("Admin user update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        await connectDB();

        // Check if user is admin
        const adminUser = await User.findById(session.user.id).select("role");

        if (
            !adminUser ||
            (adminUser.role !== "admin" && adminUser.role !== "super_admin")
        ) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        // Prevent users from deleting themselves
        if (id === session.user.id) {
            return NextResponse.json(
                { error: "You cannot delete your own account" },
                { status: 400 }
            );
        }

        // Check if user exists
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Prevent non-super-admins from deleting super-admins
        if (
            userToDelete.role === "super_admin" &&
            adminUser.role !== "super_admin"
        ) {
            return NextResponse.json(
                { error: "Only super admins can delete super admins" },
                { status: 403 }
            );
        }

        // Delete user's products first
        await Product.deleteMany({ seller: id });

        // Delete the user
        await User.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Admin user delete error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
