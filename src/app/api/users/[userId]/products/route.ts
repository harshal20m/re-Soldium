import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Product from "@/models/Product";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await connectDB();
        const { userId } = await params;

        const products = await Product.find({
            seller: userId,
            isActive: true,
        })
            .select(
                "title price images category condition location views createdAt"
            )
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({ products });
    } catch (error) {
        console.error("User products API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch user products" },
            { status: 500 }
        );
    }
}
