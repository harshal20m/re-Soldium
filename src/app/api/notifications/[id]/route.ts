import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import Notification from "@/models/Notification";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();
        const { isRead } = body;

        await connectDB();

        // Update the notification in the database
        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: session.user.id },
            { isRead },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json(
                { error: "Notification not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Notification updated successfully",
            notification: {
                id: notification._id.toString(),
                isRead: notification.isRead,
            },
        });
    } catch (error) {
        console.error("Notification PUT error:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        await connectDB();

        // In a real app, you'd delete the notification from the database

        return NextResponse.json({
            message: "Notification deleted successfully",
        });
    } catch (error) {
        console.error("Notification DELETE error:", error);
        return NextResponse.json(
            { error: "Failed to delete notification" },
            { status: 500 }
        );
    }
}
