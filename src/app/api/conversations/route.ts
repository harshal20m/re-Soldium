import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user || !("id" in session.user)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Get all conversations for the current user
        const conversations = await Conversation.find({
            participants: session.user.id,
            isActive: true,
        })
            .populate("participants", "name email image")
            .populate({
                path: "product",
                select: "title price images location views createdAt",
                populate: {
                    path: "seller",
                    select: "name email image phone createdAt",
                },
            })
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "name email image",
                },
            })
            .sort({ lastMessageAt: -1 })
            .lean();

        // Get unread message counts for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conversation) => {
                const unreadCount = await Message.countDocuments({
                    conversationId: (
                        conversation as { _id: string }
                    )._id.toString(),
                    receiver: session.user.id,
                    isRead: false,
                });

                return {
                    ...conversation,
                    unreadCount,
                };
            })
        );

        return NextResponse.json({
            conversations: conversationsWithUnread,
        });
    } catch (error) {
        console.error("Conversations GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch conversations" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user || !("id" in session.user)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, receiverId } = body;

        if (!productId || !receiverId) {
            return NextResponse.json(
                { error: "Product ID and receiver ID are required" },
                { status: 400 }
            );
        }

        // Prevent users from messaging themselves
        if (receiverId === session.user.id) {
            return NextResponse.json(
                { error: "You cannot message yourself" },
                { status: 400 }
            );
        }

        await connectDB();

        // Generate conversation key for duplicate checking
        const sortedParticipants = [session.user.id, receiverId].sort();
        const conversationKey = `${sortedParticipants.join("-")}-${productId}`;

        // Check if conversation already exists using the conversation key
        const existingConversation = await Conversation.findOne({
            conversationKey: conversationKey,
        });

        if (existingConversation) {
            // Populate the existing conversation data
            await existingConversation.populate([
                { path: "participants", select: "name email image" },
                { path: "product", select: "title price images" },
            ]);

            return NextResponse.json({
                conversation: existingConversation,
                message: "Conversation already exists",
            });
        }

        // Create new conversation with proper error handling
        try {
            const conversation = new Conversation({
                participants: [session.user.id, receiverId],
                product: productId,
                conversationKey: conversationKey,
            });

            await conversation.save();

            // Populate the conversation data
            await conversation.populate([
                { path: "participants", select: "name email image" },
                { path: "product", select: "title price images" },
            ]);

            return NextResponse.json({
                conversation,
                message: "Conversation created successfully",
            });
        } catch (createError: unknown) {
            // Handle duplicate key error
            if (
                createError &&
                typeof createError === "object" &&
                "code" in createError &&
                createError.code === 11000
            ) {
                // Try to find the existing conversation again using conversation key
                const existingConv = await Conversation.findOne({
                    conversationKey: conversationKey,
                });

                if (existingConv) {
                    await existingConv.populate([
                        { path: "participants", select: "name email image" },
                        { path: "product", select: "title price images" },
                    ]);

                    return NextResponse.json({
                        conversation: existingConv,
                        message: "Conversation already exists",
                    });
                }
            }
            throw createError;
        }
    } catch (error) {
        console.error("Conversations POST error:", error);
        return NextResponse.json(
            { error: "Failed to create conversation" },
            { status: 500 }
        );
    }
}
