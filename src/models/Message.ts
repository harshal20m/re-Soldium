import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        messageType: {
            type: String,
            enum: ["text", "image", "system"],
            default: "text",
        },
    },
    {
        timestamps: true,
    }
);

// Create compound index for efficient querying
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Prevent recompilation during development
const Message =
    mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
