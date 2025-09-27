import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import Notification from "@/models/Notification";

export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Fetch notifications from database
        const notifications = await Notification.find({ user: session.user.id })
            .populate("relatedProduct", "title price images")
            .populate("relatedUser", "name email image")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = await Notification.countDocuments({
            user: session.user.id,
            isRead: false,
        });

        // Convert to the format expected by the frontend
        const formattedNotifications = notifications.map((notification) => ({
            id: (notification as { _id: string })._id.toString(),
            type: notification.type,
            title: notification.title,
            message: notification.message,
            timestamp: notification.createdAt,
            isRead: notification.isRead,
            data: notification.data,
            relatedProduct: notification.relatedProduct,
            relatedUser: notification.relatedUser,
        }));

        return NextResponse.json({
            notifications: formattedNotifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Notifications GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            type,
            title,
            message,
            data,
            relatedProduct,
            relatedConversation,
            relatedUser,
        } = body;

        if (!type || !title || !message) {
            return NextResponse.json(
                { error: "Type, title, and message are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Create notification in database
        const notification = new Notification({
            user: session.user.id,
            type,
            title,
            message,
            data: data || {},
            relatedProduct,
            relatedConversation,
            relatedUser,
        });

        await notification.save();

        // Populate the notification data
        await notification.populate([
            { path: "relatedProduct", select: "title price images" },
            { path: "relatedUser", select: "name email image" },
        ]);

        return NextResponse.json({
            notification: {
                id: notification._id.toString(),
                type: notification.type,
                title: notification.title,
                message: notification.message,
                timestamp: notification.createdAt,
                isRead: notification.isRead,
                data: notification.data,
                relatedProduct: notification.relatedProduct,
                relatedUser: notification.relatedUser,
            },
            message: "Notification created successfully",
        });
    } catch (error) {
        console.error("Notifications POST error:", error);
        return NextResponse.json(
            { error: "Failed to create notification" },
            { status: 500 }
        );
    }
}
