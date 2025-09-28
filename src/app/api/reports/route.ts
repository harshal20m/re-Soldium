import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/utils/db";
import Report from "@/models/Report";
import Product from "@/models/Product";
import User from "@/models/User";

// Create a new report
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { productId, reason, description } = await request.json();

        if (!productId || !reason) {
            return NextResponse.json(
                { error: "Product ID and reason are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if product exists
        const product = await Product.findById(productId).populate("seller");
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Check if user is trying to report their own product
        if (product.seller._id.toString() === session.user.id) {
            return NextResponse.json(
                { error: "You cannot report your own listing" },
                { status: 400 }
            );
        }

        // Check if user has already reported this product
        const existingReport = await Report.findOne({
            reporter: session.user.id,
            reportedProduct: productId,
        });

        if (existingReport) {
            return NextResponse.json(
                { error: "You have already reported this listing" },
                { status: 400 }
            );
        }

        // Create the report
        const report = new Report({
            reporter: session.user.id,
            reportedProduct: productId,
            reportedUser: product.seller._id,
            reason,
            description,
        });

        await report.save();

        return NextResponse.json({
            success: true,
            message: "Report submitted successfully",
            reportId: report._id,
        });
    } catch (error) {
        console.error("Error creating report:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Get reports for admin
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

        // Check if user is admin
        const user = await User.findById(session.user.id).select("role");
        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get("status") || "pending";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const skip = (page - 1) * limit;

        // Build query based on status filter
        const query: { status?: string } = {};
        if (statusFilter !== "all") {
            query.status = statusFilter;
        }

        const reports = await Report.find(query)
            .populate("reporter", "name email")
            .populate("reportedUser", "name email")
            .populate("reportedProduct", "title price images")
            .populate("reviewedBy", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Report.countDocuments(query);

        return NextResponse.json({
            success: true,
            reports,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
