import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Product schema (simplified for this script)
const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    category: String,
    condition: String,
    images: [String],
    location: String,
    seller: mongoose.Schema.Types.ObjectId,
    isActive: Boolean,
    status: {
        type: String,
        enum: ["pending", "active", "sold", "rejected"],
        default: "active",
    },
    views: Number,
    createdAt: Date,
    updatedAt: Date,
});

const Product = mongoose.model("Product", productSchema);

async function updateProductStatus() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Update all products that don't have a status field
        const result = await Product.updateMany(
            { status: { $exists: false } },
            { $set: { status: "active" } }
        );

        console.log(
            `✅ Updated ${result.modifiedCount} products with status field`
        );

        // Also update products where isActive is false to have status "sold"
        const soldResult = await Product.updateMany(
            { isActive: false, status: "active" },
            { $set: { status: "sold" } }
        );

        console.log(
            `✅ Updated ${soldResult.modifiedCount} inactive products to "sold" status`
        );
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

updateProductStatus();
