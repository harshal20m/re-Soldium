"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FavoritesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Redirect if not logged in (only after auth is loaded)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [session, status, router]);

    useEffect(() => {
        const fetchFavorites = async () => {
            // Only fetch if user is authenticated
            if (status !== "authenticated" || !session?.user) {
                return;
            }

            try {
                const response = await fetch("/api/favorites");

                if (response.ok) {
                    const data = await response.json();
                    setFavorites(data.favorites || []);
                } else {
                    setFavorites([]);
                }
            } catch (error) {
                console.error("Favorites: Error fetching favorites:", error);
                setFavorites([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [session, status]); // Added session and status to dependencies

    const handleRemoveFavorite = async (productId: string) => {
        try {
            const response = await fetch(
                `/api/favorites?productId=${productId}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setFavorites((prev) =>
                    prev.filter((product) => product._id !== productId)
                );
                toast.success("Removed from favorites");
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to remove from favorites");
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
            toast.error("Something went wrong");
        }
    };

    // Show loading while auth is being checked
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show loading or redirect if not authenticated
    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                        Loading your favorites...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        My Favorites
                    </h1>
                    <p className="text-gray-600">
                        Products you've saved for later
                    </p>
                </div>

                {favorites.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No favorites yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start exploring and add products to your
                                favorites by clicking the heart icon.
                            </p>
                            <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Link href="/">
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Browse Products
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((product) => (
                            <div key={product._id} className="relative">
                                <ProductCard product={product} />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-2 left-2 bg-white/90 hover:bg-white"
                                    onClick={() =>
                                        handleRemoveFavorite(product._id)
                                    }
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
