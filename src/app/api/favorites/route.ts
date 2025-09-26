import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Product from "@/models/Product";
import Favorite from "@/models/Favorite";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Get user's favorite product IDs
        const userFavorites = await Favorite.find({ userId: session.user.id });
        const productIds = userFavorites.map((fav) => fav.productId);

        // Get the actual product details
        const products = await Product.find({ _id: { $in: productIds } });

        return NextResponse.json({
            favorites: products,
        });
    } catch (error) {
        console.error("Favorites API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch favorites" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            userId: session.user.id,
            productId: productId,
        });

        if (existingFavorite) {
            return NextResponse.json({
                message: "Product already in favorites",
            });
        }

        // Add to favorites
        const favorite = new Favorite({
            userId: session.user.id,
            productId: productId,
        });

        await favorite.save();

        // Get product details for notification
        const product = await Product.findById(productId).populate(
            "seller",
            "name"
        );

        // Create notification for product owner (don't notify yourself)
        if (product && product.seller._id.toString() !== session.user.id) {
            try {
                const notification = new Notification({
                    user: product.seller._id.toString(),
                    type: "favorite",
                    title: "Item Favorited",
                    message: `${
                        session.user.name || "Someone"
                    } favorited your listing "${product.title}"`,
                    data: { productId },
                    relatedProduct: productId,
                });
                await notification.save();
            } catch (error) {
                console.error("Error creating favorite notification:", error);
                // Don't fail the favorite action if notification fails
            }
        }

        return NextResponse.json({
            message: "Product added to favorites",
        });
    } catch (error) {
        console.error("Add favorite error:", error);
        return NextResponse.json(
            { error: "Failed to add favorite" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Remove from favorites
        const result = await Favorite.deleteOne({
            userId: session.user.id,
            productId: productId,
        });

        return NextResponse.json({
            message: "Product removed from favorites",
        });
    } catch (error) {
        console.error("Remove favorite error:", error);
        return NextResponse.json(
            { error: "Failed to remove favorite" },
            { status: 500 }
        );
    }
}
