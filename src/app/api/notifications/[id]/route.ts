import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import Notification from "@/models/Notification";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        await connectDB();

        // Delete the notification from the database
        await Notification.findByIdAndDelete(id);

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
