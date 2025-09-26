import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        // Add a unique conversation key for better duplicate handling
        conversationKey: {
            type: String,
            required: true,
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes for efficient querying
ConversationSchema.index({ conversationKey: 1 }, { unique: true });
ConversationSchema.index({ participants: 1 }); // Non-unique index for querying
ConversationSchema.index({ product: 1 }); // Non-unique index for querying
ConversationSchema.index({ lastMessageAt: -1 });

// Pre-save middleware to generate conversation key
ConversationSchema.pre("save", function (next) {
    if (this.isNew || !this.conversationKey) {
        // Create a unique key by sorting participant IDs and combining with product ID
        const sortedParticipants = this.participants
            .map((id) => id.toString())
            .sort();
        this.conversationKey = `${sortedParticipants.join("-")}-${
            this.product
        }`;
    }
    next();
});

// Prevent recompilation during development
const Conversation =
    mongoose.models.Conversation ||
    mongoose.model("Conversation", ConversationSchema);

export default Conversation;
