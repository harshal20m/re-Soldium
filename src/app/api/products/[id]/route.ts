import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        await connectDB();

        const product = await Product.findById(id)
            .populate("seller", "name email image createdAt")
            .lean();

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Increment view count
        await Product.findByIdAndUpdate(id, { $inc: { views: 1 } });

        return NextResponse.json({
            product: {
                ...product,
                _id: (product as { _id: string })._id.toString(),
                seller: {
                    ...(
                        product as unknown as {
                            seller: Record<string, unknown>;
                        }
                    ).seller,
                    _id: (
                        product as unknown as { seller: { _id: string } }
                    ).seller._id.toString(),
                },
            },
        });
    } catch (error) {
        console.error("Product API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = await getServerSession(authOptions) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const updateData = await request.json();

        await connectDB();

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Check if user owns the product
        if (product.seller.toString() !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized to update this product" },
                { status: 403 }
            );
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
        }).populate("seller", "name email image");

        return NextResponse.json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("Update product error:", error);
        return NextResponse.json(
            { error: "Failed to update product" },
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
        const session = await getServerSession(authOptions) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        await connectDB();

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Check if user owns the product
        if (product.seller.toString() !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized to delete this product" },
                { status: 403 }
            );
        }

        await Product.findByIdAndDelete(id);

        return NextResponse.json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete product error:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
