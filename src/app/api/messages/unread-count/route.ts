import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Message from "@/models/Message";
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
