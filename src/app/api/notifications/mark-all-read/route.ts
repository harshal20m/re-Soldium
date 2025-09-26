import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import Notification from "@/models/Notification";

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Update all notifications for the user to isRead: true
        const result = await Notification.updateMany(
            { user: session.user.id, isRead: false },
            { isRead: true }
        );

        return NextResponse.json({
            message: "All notifications marked as read",
            updatedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("Mark all read error:", error);
        return NextResponse.json(
            { error: "Failed to mark all notifications as read" },
            { status: 500 }
        );
    }
}
