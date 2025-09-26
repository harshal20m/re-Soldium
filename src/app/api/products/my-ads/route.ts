import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Product from "@/models/Product";
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

        const products = await Product.find({ seller: session.user.id })
            .populate("seller", "name email image")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            products: products.map((product) => ({
                ...product,
                _id: product._id.toString(),
                seller: {
                    ...product.seller,
                    _id: product.seller._id.toString(),
                },
            })),
        });
    } catch (error) {
        console.error("My ads API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch user products" },
            { status: 500 }
        );
    }
}
