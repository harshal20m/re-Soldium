import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
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

        const user = await User.findById(session.user.id).select("privacy");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            privacy: user.privacy || {
                profileVisibility: "public",
                showEmail: false,
                showPhone: false,
                allowMessages: true,
            },
        });
    } catch (error) {
        console.error("Privacy GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch privacy settings" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { privacy } = await request.json();

        if (!privacy) {
            return NextResponse.json(
                { error: "Privacy data is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { privacy },
            { new: true, runValidators: true }
        ).select("privacy");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Privacy settings updated successfully",
            privacy: user.privacy,
        });
    } catch (error) {
        console.error("Privacy PUT error:", error);
        return NextResponse.json(
            { error: "Failed to update privacy settings" },
            { status: 500 }
        );
    }
}
