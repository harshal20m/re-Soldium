import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
    userId: string;
    productId: string;
    createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    productId: {
        type: String,
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create compound index to ensure unique user-product pairs
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.Favorite ||
    mongoose.model<IFavorite>("Favorite", FavoriteSchema);
