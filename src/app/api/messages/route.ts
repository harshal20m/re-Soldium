import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = await getServerSession(authOptions) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return NextResponse.json(
                { error: "Conversation ID is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify user is part of this conversation
        const conversation = await Conversation.findById(conversationId);
        if (
            !conversation ||
            !conversation.participants.includes(session.user.id)
        ) {
            return NextResponse.json(
                { error: "Conversation not found or access denied" },
                { status: 404 }
            );
        }

        // Get messages for this conversation
        const messages = await Message.find({
            conversationId,
        })
            .populate("sender", "name email image")
            .populate("receiver", "name email image")
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({
            messages,
        });
    } catch (error) {
        console.error("Messages GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = await getServerSession(authOptions) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { conversationId, content, receiverId } = body;

        if (!conversationId || !content || !receiverId) {
            return NextResponse.json(
                {
                    error: "Conversation ID, content, and receiver ID are required",
                },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify user is part of this conversation
        const conversation = await Conversation.findById(conversationId);
        if (
            !conversation ||
            !conversation.participants.includes(session.user.id)
        ) {
            return NextResponse.json(
                { error: "Conversation not found or access denied" },
                { status: 404 }
            );
        }

        // Create new message
        const message = new Message({
            conversationId,
            sender: session.user.id,
            receiver: receiverId,
            product: conversation.product,
            content: content.trim(),
        });

        await message.save();

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            lastMessageAt: new Date(),
        });

        // Populate the message data
        await message.populate([
            { path: "sender", select: "name email image" },
            { path: "receiver", select: "name email image" },
            { path: "product", select: "title price images" },
        ]);

        // Create notification for the receiver (don't notify yourself)
        if (receiverId !== session.user.id) {
            try {
                const notification = new Notification({
                    user: receiverId,
                    type: "message",
                    title: "New Message",
                    message: `${message.sender.name} sent you a message about "${message.product.title}"`,
                    data: {
                        conversationId,
                        productId: message.product._id.toString(),
                    },
                    relatedConversation: conversationId,
                    relatedProduct: message.product._id.toString(),
                });
                await notification.save();
            } catch (error) {
                console.error("Error creating message notification:", error);
                // Don't fail the message sending if notification fails
            }
        }

        return NextResponse.json({
            message,
            success: true,
        });
    } catch (error) {
        console.error("Messages POST error:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}
