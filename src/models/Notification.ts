import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "message",
                "favorite",
                "view",
                "system",
                "product_sold",
                "product_updated",
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        // Reference to related entities
        relatedProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        relatedConversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
        },
        relatedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes for efficient querying
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });

// Prevent recompilation during development
const Notification =
    mongoose.models.Notification ||
    mongoose.model("Notification", NotificationSchema);

export default Notification;
