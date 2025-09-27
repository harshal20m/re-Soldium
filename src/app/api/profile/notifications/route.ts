import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = await getServerSession(authOptions) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        const user = await User.findById(session.user.id).select(
            "notifications"
        );

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            notifications: user.notifications || {
                emailNotifications: true,
                pushNotifications: true,
                marketingEmails: false,
                messageNotifications: true,
            },
        });
    } catch (error) {
        console.error("Notifications GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = await getServerSession(authOptions) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { notifications } = await request.json();

        if (!notifications) {
            return NextResponse.json(
                { error: "Notifications data is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { notifications },
            { new: true, runValidators: true }
        ).select("notifications");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Notification settings updated successfully",
            notifications: user.notifications,
        });
    } catch (error) {
        console.error("Notifications PUT error:", error);
        return NextResponse.json(
            { error: "Failed to update notifications" },
            { status: 500 }
        );
    }
}
