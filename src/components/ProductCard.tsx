"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/utils/auth";
import { Heart, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ProductCardProps {
    product: Product;
    isFavorited?: boolean;
    onFavoriteToggle?: (productId: string, isFavorited: boolean) => void;
}

export default function ProductCard({
    product,
    isFavorited = false,
    onFavoriteToggle,
}: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(isFavorited);
    const [imageError, setImageError] = useState(false);

    // Update isLiked when isFavorited prop changes
    useEffect(() => {
        setIsLiked(isFavorited);
    }, [isFavorited]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            if (isLiked) {
                // Remove from favorites
                const response = await fetch(
                    `/api/favorites?productId=${product._id}`,
                    {
                        method: "DELETE",
                    }
                );

                if (response.ok) {
                    setIsLiked(false);
                    onFavoriteToggle?.(product._id, false);
                    toast.success("Removed from favorites");
                } else {
                    const data = await response.json();
                    if (response.status === 401) {
                        toast.error("Please log in to manage favorites");
                    } else {
                        toast.error(
                            data.error || "Failed to remove from favorites"
                        );
                    }
                }
            } else {
                // Add to favorites
                const response = await fetch("/api/favorites", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ productId: product._id }),
                });

                if (response.ok) {
                    setIsLiked(true);
                    onFavoriteToggle?.(product._id, true);
                    toast.success("Added to favorites");
                } else {
                    const data = await response.json();
                    if (response.status === 401) {
                        toast.error("Please log in to add favorites");
                    } else {
                        toast.error(data.error || "Failed to add to favorites");
                    }
                }
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            toast.error("Something went wrong");
        }
    };

    return (
        <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden bg-white hover-lift">
            <Link href={`/product/${product._id}`}>
                <div className="relative aspect-[4/3] overflow-hidden">
                    {!imageError && product.images?.[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={() => setImageError(true)}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-gray-400 text-xs">
                                    Product Image
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                        {/* Like Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`p-2 rounded-full ${
                                isLiked
                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                    : "bg-white/80 hover:bg-white"
                            }`}
                            onClick={handleToggleFavorite}
                        >
                            <Heart
                                className={`w-4 h-4 transition-all duration-200 hover-scale ${
                                    isLiked ? "fill-current" : ""
                                }`}
                            />
                        </Button>
                    </div>
                </div>

                <CardContent className="p-3 lg:p-4">
                    <div className="space-y-3">
                        {/* Title */}
                        <h3 className="font-semibold text-base lg:text-lg line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                            {product.title}
                        </h3>

                        {/* Price */}
                        <p className="text-xl lg:text-2xl font-bold text-green-600">
                            {formatPrice(product.price)}
                        </p>

                        {/* Location */}
                        <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{product.location}</span>
                        </div>

                        {/* Category and Date */}
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                                {product.category}
                            </Badge>

                            <span className="text-xs text-gray-500">
                                {formatDate(product.createdAt)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}
