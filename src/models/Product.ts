import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxLength: [100, "Title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxLength: [1000, "Description cannot exceed 1000 characters"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "Electronics",
                "Vehicles",
                "Property",
                "Home & Garden",
                "Fashion",
                "Sports",
                "Books",
                "Pets",
                "Jobs",
                "Services",
            ],
        },
        condition: {
            type: String,
            required: [true, "Condition is required"],
            enum: ["new", "used", "refurbished"],
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for better search performance
ProductSchema.index({ title: "text", description: "text" });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

// Prevent recompilation during development
const Product =
    mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
