import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId; // Password required only if not using Google auth
            },
        },
        googleId: {
            type: String,
            sparse: true, // Allows null values but ensures uniqueness when present
        },
        image: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        location: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
            maxlength: [500, "Bio cannot exceed 500 characters"],
        },
        website: {
            type: String,
            default: "",
        },
        notifications: {
            emailNotifications: {
                type: Boolean,
                default: true,
            },
            pushNotifications: {
                type: Boolean,
                default: true,
            },
            marketingEmails: {
                type: Boolean,
                default: false,
            },
            messageNotifications: {
                type: Boolean,
                default: true,
            },
        },
        privacy: {
            profileVisibility: {
                type: String,
                enum: ["public", "private"],
                default: "public",
            },
            showEmail: {
                type: Boolean,
                default: false,
            },
            showPhone: {
                type: Boolean,
                default: false,
            },
            allowMessages: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Prevent recompilation during development
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
