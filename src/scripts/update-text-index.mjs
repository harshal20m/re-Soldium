import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Product schema (simplified for this script)
const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    price: Number,
    condition: String,
    images: [String],
    location: String,
    seller: mongoose.Schema.Types.ObjectId,
    isActive: Boolean,
    status: String,
    views: Number,
    createdAt: Date,
    updatedAt: Date,
});

const Product = mongoose.model("Product", productSchema);

async function updateTextIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Drop existing text index
        try {
            await Product.collection.dropIndex("title_text_description_text");
            console.log("✅ Dropped existing text index");
        } catch (error) {
            console.log("ℹ️  No existing text index to drop");
        }

        // Create new text index with category
        await Product.collection.createIndex(
            { title: "text", description: "text", category: "text" },
            { name: "title_text_description_text_category_text" }
        );
        console.log("✅ Created new text index with category field");

        console.log("🎉 Text index update completed successfully!");
    } catch (error) {
        console.error("❌ Error updating text index:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

updateTextIndex();
