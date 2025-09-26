import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Message from "@/models/Message";
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

        // Count unread messages for the current user
        const unreadCount = await Message.countDocuments({
            receiver: session.user.id,
            isRead: false,
        });

        return NextResponse.json({
            unreadCount,
        });
    } catch (error) {
        console.error("Unread count error:", error);
        return NextResponse.json(
            { error: "Failed to fetch unread count" },
            { status: 500 }
        );
    }
}
