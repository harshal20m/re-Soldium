import connectDB from "./db";
import Notification from "@/models/Notification";

interface NotificationData {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
}

export async function sendNotification({
    userId,
    type,
    title,
    message,
    data,
}: NotificationData) {
    try {
        await connectDB();

        const notification = new Notification({
            user: userId,
            type,
            title,
            message,
            data,
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error sending notification:", error);
        throw error;
    }
}
