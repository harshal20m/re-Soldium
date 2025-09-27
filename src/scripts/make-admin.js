import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// User schema (simplified for this script)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    googleId: String,
    image: String,
    role: {
        type: String,
        enum: ["user", "admin", "super_admin"],
        default: "user",
    },
    phone: String,
    location: String,
    bio: String,
    website: String,
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

async function makeUserAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Get email from command line arguments
        const email = process.argv[2];
        const role = process.argv[3] || "admin"; // Default to admin, can be 'super_admin'

        if (!email) {
            console.error("Please provide an email address");
            console.log("Usage: node make-admin.js <email> [role]");
            console.log("Example: node make-admin.js admin@example.com admin");
            console.log(
                "Example: node make-admin.js superadmin@example.com super_admin"
            );
            process.exit(1);
        }

        if (!["admin", "super_admin"].includes(role)) {
            console.error('Role must be either "admin" or "super_admin"');
            process.exit(1);
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        // Update user role
        user.role = role;
        await user.save();

        console.log(
            `✅ Successfully updated ${user.name} (${user.email}) to ${role}`
        );
        console.log(`User ID: ${user._id}`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

makeUserAdmin();
