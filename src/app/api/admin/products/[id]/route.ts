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
        const { status } = body;

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

        // Validate status
        const validStatuses = ["pending", "active", "sold", "rejected"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Update product status
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate("seller", "name email");

        if (!updatedProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            product: updatedProduct,
            message: "Product status updated successfully",
        });
    } catch (error) {
        console.error("Admin product update error:", error);
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

        // Check if product exists
        const productToDelete = await Product.findById(id);
        if (!productToDelete) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Delete the product
        await Product.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Admin product delete error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
